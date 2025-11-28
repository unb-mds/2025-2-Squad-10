// backend/src/api/controllers/reportController.js
const db = require('../../config/database');
const { getStatesByRegion } = require('../../utils/regionMap');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('html-pdf-node');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Usando o modelo 1.5 Pro para melhor capacidade de escrita e formatação
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Função auxiliar para gerar o PDF a partir do HTML
const createPdf = async (htmlContent) => {
    const finalHtml = `
        <html>
            <head>
                <style>
                    body { font-family: Arial, Helvetica, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                    h1 { color: #0D4B55; border-bottom: 2px solid #0D4B55; padding-bottom: 10px; margin-bottom: 20px; }
                    h2 { color: #0D4B55; margin-top: 30px; margin-bottom: 15px; border-left: 5px solid #0D4B55; padding-left: 10px; }
                    p { margin-bottom: 15px; text-align: justify; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; font-size: 14px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #0D4B55; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    .highlight { font-weight: bold; color: #0D4B55; }
                    .note { font-size: 12px; color: #666; font-style: italic; margin-top: -10px; margin-bottom: 20px; }
                    .footer { margin-top: 50px; font-size: 10px; color: gray; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
                </style>
            </head>
            <body>
                ${htmlContent}
                <div class="footer">
                    Relatório gerado automaticamente pelo OncoMap em ${new Date().toLocaleDateString()}.<br/>
                    Fonte de Dados: Diários Oficiais Municipais (via Querido Diário).
                </div>
            </body>
        </html>
    `;
    
    const options = { 
        format: 'A4', 
        printBackground: true,
        margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" } 
    };
    
    const file = { content: finalHtml };
    return pdf.generatePdf(file, options);
};

// 1. RELATÓRIO POR REGIÃO
const generateRegionReport = async (req, res) => {
    const { regionName } = req.params;
    const states = getStatesByRegion(regionName);

    if (states.length === 0) return res.status(400).json({ error: "Região inválida." });

    try {
        // CORREÇÃO: Soma dinâmica de PDF + TXT
        const query = `
            SELECT 
                state_uf, 
                COUNT(*) as total_mentions, 
                SUM(COALESCE(extracted_value, 0) + COALESCE(extracted_value_txt, 0)) as total_value
            FROM mentions 
            WHERE state_uf = ANY($1) 
            AND (extracted_value > 0 OR extracted_value_txt > 0)
            GROUP BY state_uf 
            ORDER BY total_value DESC;
        `;
        const { rows } = await db.query(query, [states]);
        
        const totalRegionValue = rows.reduce((acc, r) => acc + parseFloat(r.total_value), 0);
        
        const dataContext = JSON.stringify({
            regiao: regionName,
            investimento_total: totalRegionValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            detalhes_por_estado: rows.map(r => ({
                estado: r.state_uf,
                valor: parseFloat(r.total_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                qtd_contratos: r.total_mentions
            }))
        });

        // PROMPT PADRONIZADO - REGIÃO
        const prompt = `
            Você é um especialista em relatórios de transparência pública.

            Gere um relatório técnico e elegante em formato HTML (apenas o conteúdo dentro de <body>, sem tags html/head) sobre os investimentos em oncologia na Região ${regionName}.

            DADOS REAIS DO BANCO DE DADOS:
            ${dataContext}

            REGRAS DE FORMATAÇÃO:
            - Use tags <h1> para o título principal.
            - Use <h2> para seções (subtítulos).
            - Crie uma tabela HTML elegante com bordas para mostrar os dados por estado.
            - Escreva um parágrafo de análise interpretando os dados (qual estado investiu mais, a disparidade regional, etc).
            - Adicione uma conclusão sobre a importância desses investimentos.
            - Use CSS inline para deixar o relatório bonito (fonte Arial, cores sóbrias, tabela zebrada).
            - NÃO INVENTE DADOS. Use estritamente os números fornecidos.

            Use de Base o seguinte Modelo pro texto:

            Relatório de Investimentos em Oncologia na Região ${regionName} (TITULO)

            Visão Geral dos Investimentos (SUBTITULO)
            [Breve introdução sobre o relatório].
            <p class="note">Nota: Os dados apresentados neste relatório compreendem o período a partir do ano de 2022.</p>

            Investimento Total (SUBTITULO)
            O investimento total identificado em oncologia na Região ${regionName} foi de [Inserir Valor Total].

            Dados por Estado (SUBTITULO)
            (Tabela com colunas: Estado, Valor Investido, Quantidade de Contratos)

            Análise dos Dados (SUBTITULO)
            [Texto analítico comparando os estados...]

            Conclusão (SUBTITULO)
            [Texto de conclusão...]
        `;

        const result = await model.generateContent(prompt);
        const cleanHtml = result.response.text().replace(/```html|```/g, '');
        const pdfBuffer = await createPdf(cleanHtml);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-regiao-${regionName}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Erro relatório região:", error);
        res.status(500).json({ error: "Erro ao gerar PDF." });
    }
};

// 2. RELATÓRIO POR ESTADO
const generateStateReport = async (req, res) => {
    const { uf } = req.params;

    try {
        // CORREÇÃO: Soma dinâmica de PDF + TXT
        const query = `
            SELECT 
                municipality_name, 
                COUNT(*) as total_mentions, 
                SUM(COALESCE(extracted_value, 0) + COALESCE(extracted_value_txt, 0)) as total_value
            FROM mentions 
            WHERE state_uf = $1 
            AND (extracted_value > 0 OR extracted_value_txt > 0)
            GROUP BY municipality_name 
            ORDER BY total_value DESC 
            LIMIT 15;
        `;
        const { rows } = await db.query(query, [uf.toUpperCase()]);

        if (rows.length === 0) return res.status(404).json({ error: "Sem dados para este estado." });

        const totalStateValue = rows.reduce((acc, r) => acc + parseFloat(r.total_value), 0);
        
        const dataContext = JSON.stringify({
            estado: uf.toUpperCase(),
            investimento_total_amostra: totalStateValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            top_municipios: rows.map(r => ({
                municipio: r.municipality_name,
                valor: parseFloat(r.total_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                contratos: r.total_mentions
            }))
        });

        // PROMPT PADRONIZADO - ESTADO
        const prompt = `
            Você é um especialista em relatórios de transparência pública.

            Gere um relatório técnico e elegante em formato HTML (apenas o conteúdo dentro de <body>, sem tags html/head) sobre os investimentos em oncologia no Estado de ${uf.toUpperCase()}.

            DADOS REAIS DO BANCO DE DADOS:
            ${dataContext}

            REGRAS DE FORMATAÇÃO:
            - Use tags <h1> para o título principal.
            - Use <h2> para seções (subtítulos).
            - Crie uma tabela HTML elegante com bordas para mostrar os dados por município.
            - Escreva um parágrafo de análise interpretando os dados (concentração de recursos, municípios destaque, etc).
            - Adicione uma conclusão sobre o cenário estadual.
            - Use CSS inline para deixar o relatório bonito (fonte Arial, cores sóbrias, tabela zebrada).
            - NÃO INVENTE DADOS. Use estritamente os números fornecidos.

            Use de Base o seguinte Modelo pro texto:

            Relatório de Investimentos em Oncologia no Estado de ${uf.toUpperCase()} (TITULO)

            Visão Geral dos Investimentos (SUBTITULO)
            [Breve introdução sobre o relatório estadual].
            <p class="note">Nota: Os dados apresentados neste relatório compreendem o período a partir do ano de 2022.</p>

            Investimento Total da Amostra (SUBTITULO)
            O investimento total identificado nos principais municípios do estado foi de [Inserir Valor Total].

            Principais Municípios Investidores (SUBTITULO)
            (Tabela com colunas: Município, Valor Investido, Quantidade de Contratos)

            Análise dos Dados (SUBTITULO)
            [Texto analítico sobre a distribuição dos recursos no estado...]

            Conclusão (SUBTITULO)
            [Texto de conclusão...]
        `;

        const result = await model.generateContent(prompt);
        const cleanHtml = result.response.text().replace(/```html|```/g, '');
        const pdfBuffer = await createPdf(cleanHtml);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-estado-${uf}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Erro relatório estado:", error);
        res.status(500).json({ error: "Erro ao gerar PDF." });
    }
};

// 3. RELATÓRIO POR MUNICÍPIO
const generateMunicipalityReport = async (req, res) => {
    const { ibge } = req.params;

    try {
        // CORREÇÃO: Buscar as colunas de valor e os JSONs de análise do PDF e TXT
        const query = `
            SELECT 
                municipality_name, 
                state_uf, 
                COALESCE(extracted_value, 0) + COALESCE(extracted_value_txt, 0) as valor_final, 
                gemini_analysis,
                gemini_analysis_txt
            FROM mentions 
            WHERE municipality_ibge_code = $1 
            AND (extracted_value > 0 OR extracted_value_txt > 0);
        `;
        const { rows } = await db.query(query, [ibge]);

        if (rows.length === 0) return res.status(404).json({ error: "Sem dados para este município." });

        const categories = { medicamentos: 0, equipamentos: 0, obras: 0, servicos: 0, outros: 0, estadia: 0 };
        let totalValue = 0;

        rows.forEach(row => {
            totalValue += parseFloat(row.valor_final);
            
            // CORREÇÃO: Prioriza análise do TXT, se não existir, usa a do PDF
            const analysis = row.gemini_analysis_txt || row.gemini_analysis;
            
            if (analysis) {
                categories.medicamentos += parseFloat(analysis.medicamentos || 0);
                categories.equipamentos += parseFloat(analysis.equipamentos || 0);
                categories.obras += parseFloat(analysis.obras_infraestrutura || 0);
                categories.servicos += parseFloat(analysis.servicos_saude || 0);
                categories.estadia += parseFloat(analysis.estadia_paciente || 0);
                categories.outros += parseFloat(analysis.outros_relacionados || 0);
            }
        });

        const municipalityName = rows[0].municipality_name;
        const stateUf = rows[0].state_uf;

        const dataContext = JSON.stringify({
            municipio: municipalityName,
            uf: stateUf,
            total_investido: totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            categorias: {
                "Medicamentos": categories.medicamentos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                "Equipamentos": categories.equipamentos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                "Obras e Infraestrutura": categories.obras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                "Serviços de Saúde": categories.servicos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                "Outros": categories.outros.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            }
        });

        // PROMPT PADRONIZADO - MUNICÍPIO
        const prompt = `
            Você é um especialista em relatórios de transparência pública.

            Gere um relatório técnico e elegante em formato HTML (apenas o conteúdo dentro de <body>, sem tags html/head) sobre os investimentos em oncologia no Município de ${municipalityName} (${stateUf}).

            DADOS REAIS DO BANCO DE DADOS:
            ${dataContext}

            REGRAS DE FORMATAÇÃO:
            - Use tags <h1> para o título principal.
            - Use <h2> para seções (subtítulos).
            - Crie uma tabela HTML elegante com bordas para mostrar o detalhamento por categoria.
            - Escreva um parágrafo de análise interpretando onde o município focou seus recursos.
            - Adicione uma conclusão sobre o perfil de investimento local.
            - Use CSS inline para deixar o relatório bonito (fonte Arial, cores sóbrias, tabela zebrada).
            - NÃO INVENTE DADOS. Use estritamente os números fornecidos.

            Use de Base o seguinte Modelo pro texto:

            Relatório de Investimentos em Oncologia em ${municipalityName} - ${stateUf} (TITULO)

            Visão Geral dos Investimentos (SUBTITULO)
            [Breve introdução sobre o relatório municipal].
            <p class="note">Nota: Os dados apresentados neste relatório compreendem o período a partir do ano de 2022.</p>

            Investimento Total (SUBTITULO)
            O investimento total identificado em oncologia no município foi de [Inserir Valor Total].

            Detalhamento por Categoria de Gasto (SUBTITULO)
            (Tabela com colunas: Categoria, Valor Investido)

            Análise dos Dados (SUBTITULO)
            [Texto analítico sobre as prioridades de gasto do município (ex: foco em remédios vs equipamentos)...]

            Conclusão (SUBTITULO)
            [Texto de conclusão...]
        `;

        const result = await model.generateContent(prompt);
        const cleanHtml = result.response.text().replace(/```html|```/g, '');
        const pdfBuffer = await createPdf(cleanHtml);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-municipio-${municipalityName}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Erro relatório município:", error);
        res.status(500).json({ error: "Erro ao gerar PDF." });
    }
};

module.exports = { generateRegionReport, generateStateReport, generateMunicipalityReport };