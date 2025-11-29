const db = require('../../config/database');
const { getStatesByRegion } = require('../../utils/regionMap');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('html-pdf-node');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Formatador
const fmt = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Auxiliares
const somaCategorias = (target, analysis) => {
    if (!analysis) return;
    target.medicamentos += parseFloat(analysis.medicamentos || 0);
    target.equipamentos += parseFloat(analysis.equipamentos || 0);
    target.obras += parseFloat(analysis.obras_infraestrutura || 0);
    target.servicos += parseFloat(analysis.servicos_saude || 0);
    target.estadia += parseFloat(analysis.estadia_paciente || 0);
    target.outros += parseFloat(analysis.outros_relacionados || 0);
};

const initCategories = () => ({
    medicamentos: 0, equipamentos: 0, obras: 0, servicos: 0, estadia: 0, outros: 0
});

const cleanGeminiResponse = (text) => {
    const codeBlockMatch = text.match(/```html([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) return codeBlockMatch[1].trim();
    const htmlStart = text.indexOf('<h1');
    if (htmlStart !== -1) return text.substring(htmlStart).replace(/```/g, '').trim();
    return text.replace(/```html/g, '').replace(/```/g, '').trim();
};

// --- GERAÇÃO DO PDF ---
const createPdf = async (htmlContent) => {
    const finalHtml = `
        <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', Arial, sans-serif; padding: 40px; padding-bottom: 60px; color: #333; line-height: 1.5; }
                    
                    h1 { color: #0D4B55; text-align: center; border-bottom: 3px solid #0D4B55; padding-bottom: 10px; margin-bottom: 30px; font-size: 22px; }
                    h2 { color: #2E7D32; margin-top: 30px; border-left: 6px solid #2E7D32; padding-left: 10px; font-size: 18px; background-color: #f1f8e9; padding: 5px 10px; }
                    h3 { color: #555; margin-top: 20px; margin-bottom: 5px; font-size: 14px; text-transform: uppercase; font-weight: bold; border-bottom: 1px dashed #ccc; }
                    p { text-align: justify; margin-bottom: 10px; font-size: 12px; }
                    
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; page-break-inside: avoid; }
                    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
                    th { background-color: #0D4B55; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .valor { text-align: right; white-space: nowrap; font-weight: bold; }
                    
                    .total-geral { font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; padding: 15px; background: #e0f2f1; border: 1px solid #00695c; color: #004d40; border-radius: 5px; }
                    .ano-section { margin-bottom: 40px; page-break-inside: avoid; }
                    
                    .footer { position: fixed; bottom: 0; left: 0; right: 0; height: 30px; text-align: center; font-size: 9px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; background-color: white; }
                </style>
            </head>
            <body>
                ${htmlContent}
                <div class="footer">
                    Relatório gerado automaticamente pelo OncoMap em ${new Date().toLocaleDateString()}.<br/>
                    <strong>Fonte de Dados:</strong> Diários Oficiais Municipais (via Querido Diário).
                </div>
            </body>
        </html>
    `;
    const options = { format: 'A4', printBackground: true, margin: { top: "30px", bottom: "60px", left: "20px", right: "20px" } };
    return pdf.generatePdf({ content: finalHtml }, options);
};

// --- 1. RELATÓRIO POR REGIÃO ---
const generateRegionReport = async (req, res) => {
    const { regionName } = req.params;
    const states = getStatesByRegion(regionName);

    if (states.length === 0) return res.status(400).json({ error: "Região inválida." });

    try {
        const query = `
            SELECT EXTRACT(YEAR FROM publication_date) as ano, state_uf,
            SUM(COALESCE(final_extracted_value, COALESCE(extracted_value, 0) + COALESCE(extracted_value_txt, 0))) as total_value
            FROM mentions 
            WHERE state_uf = ANY($1) 
            AND (final_extracted_value IS NOT NULL OR extracted_value > 0 OR extracted_value_txt > 0)
            GROUP BY ano, state_uf
            ORDER BY ano DESC, total_value DESC;
        `;
        const { rows } = await db.query(query, [states]);

        const dadosPorAno = {};
        let totalGeral = 0;
        const categoriasGerais = initCategories();

        // Para pegar categorias, precisamos de uma query secundária ou mudar a lógica.
        // Como o agrupamento SQL acima perde os detalhes de categoria, vamos buscar os dados brutos para alimentar a IA corretamente.
        // CORREÇÃO: Buscando dados brutos para permitir análise de categoria pela IA
        const queryRaw = `
            SELECT EXTRACT(YEAR FROM publication_date) as ano, state_uf,
            COALESCE(final_extracted_value, COALESCE(extracted_value, 0) + COALESCE(extracted_value_txt, 0)) as valor,
            gemini_analysis, gemini_analysis_txt
            FROM mentions WHERE state_uf = ANY($1) AND (final_extracted_value IS NOT NULL OR extracted_value > 0 OR extracted_value_txt > 0)
            ORDER BY publication_date DESC;
        `;
        const { rows: rowsRaw } = await db.query(queryRaw, [states]);

        rowsRaw.forEach(row => {
            const ano = row.ano || 'Indefinido';
            const valor = parseFloat(row.valor);
            const analysis = row.gemini_analysis_txt || row.gemini_analysis;

            totalGeral += valor;
            somaCategorias(categoriasGerais, analysis);

            if (!dadosPorAno[ano]) {
                dadosPorAno[ano] = { total: 0, categorias: initCategories(), estados: {} };
            }
            dadosPorAno[ano].total += valor;
            somaCategorias(dadosPorAno[ano].categorias, analysis);

            if (!dadosPorAno[ano].estados[row.state_uf]) dadosPorAno[ano].estados[row.state_uf] = 0;
            dadosPorAno[ano].estados[row.state_uf] += valor;
        });

        const yearsData = Object.entries(dadosPorAno)
            .sort((a, b) => b[0] - a[0])
            .map(([ano, dados]) => ({
                ano,
                total: fmt(dados.total),
                categorias: Object.entries(dados.categorias).reduce((acc, [k, v]) => ({...acc, [k]: fmt(v)}), {}),
                estados: Object.entries(dados.estados)
                    .map(([uf, val]) => ({ uf, valor: fmt(val) }))
                    .sort((a, b) => parseFloat(b.valor.replace(/\D/g, '')) - parseFloat(a.valor.replace(/\D/g, '')))
            }));

        const dataContext = JSON.stringify({
            regiao: regionName.toUpperCase(),
            total_acumulado: fmt(totalGeral),
            categorias_gerais: Object.entries(categoriasGerais).reduce((acc, [k, v]) => ({...acc, [k]: fmt(v)}), {}),
            evolucao_anual: yearsData
        });

        // PROMPT REFORÇADO PARA ANÁLISE REAL
        const prompt = `
            ATENÇÃO: Você é um analista financeiro senior. Retorne APENAS HTML.
            
            Sua tarefa: Gerar um relatório sobre a Região ${regionName.toUpperCase()}.
            DADOS: ${dataContext}

            ESTRUTURA OBRIGATÓRIA (HTML dentro do body):
            
            1. <h1>Relatório Regional: ${regionName.toUpperCase()}</h1>
            2. <div class="total-geral">Investimento Total Acumulado: ${fmt(totalGeral)}</div>
            
            3. <h2>Visão Geral do Período</h2>
            - Crie uma Tabela HTML única somando todas as categorias do período.
            - <p>[ESCREVA AQUI UM PARÁGRAFO ANALISANDO QUAIS CATEGORIAS RECEBERAM MAIS RECURSOS NO TOTAL E O QUE ISSO INDICA SOBRE A REGIÃO.]</p>

            4. (LOOP PARA CADA ANO - GERE UMA DIV .ano-section PARA CADA):
               <h2>Exercício de [ANO]</h2>
               <h3>1. Distribuição por Estado</h3>
               - Tabela HTML (Estado | Valor).
               
               <h3>2. Detalhamento Temático</h3>
               - Tabela HTML (Categoria | Valor).
               
               <h3>3. Análise do Ano</h3>
               - <p>[ESCREVA AQUI UMA ANÁLISE REAL DESTE ANO. COMPARE OS ESTADOS (QUAL INVESTIU MAIS?) E AS CATEGORIAS. NÃO USE PLACEHOLDERS. ESCREVA O TEXTO.]</p>
            
            5. <h2>Conclusão Regional</h2>
            - <p>[ESCREVA UMA CONCLUSÃO FINAL SOBRE A TENDÊNCIA DE INVESTIMENTO AO LONGO DOS ANOS NA REGIÃO.]</p>
        `;

        const result = await model.generateContent(prompt);
        const pdfBuffer = await createPdf(cleanGeminiResponse(result.response.text()));
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Erro Região PDF:", error);
        res.status(500).json({ error: "Erro ao gerar PDF." });
    }
};

// --- 2. RELATÓRIO POR ESTADO ---
const generateStateReport = async (req, res) => {
    const { uf } = req.params;

    try {
        const query = `
            SELECT EXTRACT(YEAR FROM publication_date) as ano, municipality_name,
            COALESCE(final_extracted_value, COALESCE(extracted_value, 0) + COALESCE(extracted_value_txt, 0)) as valor,
            gemini_analysis, gemini_analysis_txt
            FROM mentions WHERE state_uf = $1 AND (final_extracted_value IS NOT NULL OR extracted_value > 0 OR extracted_value_txt > 0)
            ORDER BY publication_date DESC;
        `;
        const { rows } = await db.query(query, [uf.toUpperCase()]);

        if (rows.length === 0) return res.status(404).json({ error: "Sem dados." });

        const dadosPorAno = {};
        let totalGeral = 0;
        const categoriasGerais = initCategories();

        rows.forEach(row => {
            const val = parseFloat(row.valor);
            const ano = row.ano || 'Indefinido';
            const analysis = row.gemini_analysis_txt || row.gemini_analysis;

            totalGeral += val;
            somaCategorias(categoriasGerais, analysis);

            if (!dadosPorAno[ano]) {
                dadosPorAno[ano] = { total: 0, categorias: initCategories(), municipios: {} };
            }
            dadosPorAno[ano].total += val;
            somaCategorias(dadosPorAno[ano].categorias, analysis);

            if (!dadosPorAno[ano].municipios[row.municipality_name]) dadosPorAno[ano].municipios[row.municipality_name] = 0;
            dadosPorAno[ano].municipios[row.municipality_name] += val;
        });

        const yearsData = Object.entries(dadosPorAno)
            .sort((a, b) => b[0] - a[0])
            .map(([ano, dados]) => ({
                ano,
                total: fmt(dados.total),
                categorias: Object.entries(dados.categorias).reduce((acc, [k, v]) => ({...acc, [k]: fmt(v)}), {}),
                top_municipios: Object.entries(dados.municipios)
                    .map(([nome, val]) => ({ nome, valor: fmt(val) }))
                    .sort((a, b) => parseFloat(b.valor.replace(/\D/g, '')) - parseFloat(a.valor.replace(/\D/g, '')))
                    .slice(0, 15)
            }));

        const dataContext = JSON.stringify({
            estado: uf.toUpperCase(),
            total_acumulado: fmt(totalGeral),
            categorias_acumuladas: Object.entries(categoriasGerais).reduce((acc, [k, v]) => ({...acc, [k]: fmt(v)}), {}),
            evolucao_anual: yearsData
        });

        // PROMPT REFORÇADO
        const prompt = `
            ATENÇÃO: Retorne APENAS HTML. Você é um analista financeiro.
            
            Relatório do Estado: ${uf.toUpperCase()}.
            DADOS: ${dataContext}
            
            ESTRUTURA OBRIGATÓRIA:
            1. <h1>Relatório Estadual: ${uf.toUpperCase()}</h1>
            2. <div class="total-geral">Total Acumulado: ${fmt(totalGeral)}</div>
            
            3. <h2>Visão Geral do Período</h2>
            - Tabela única com categorias acumuladas.
            - <p>[ESCREVA UMA ANÁLISE GERAL SOBRE ONDE O ESTADO MAIS INVESTIU NO TOTAL.]</p>

            4. (LOOP PARA CADA ANO PRESENTE):
               <div class="ano-section">
                   <h2>Exercício de [ANO]</h2>
                   
                   <h3>1. Detalhamento Temático (Categorias)</h3>
                   - Tabela HTML (Categoria | Valor).
                   
                   <h3>2. Principais Municípios</h3>
                   - Tabela HTML (Município | Valor).
                   
                   <h3>3. Análise do Ano</h3>
                   - <p>[ESCREVA UMA ANÁLISE DETALHADA DESTE ANO. MENCIONE O MUNICÍPIO QUE MAIS GASTOU E A CATEGORIA PRINCIPAL. NÃO USE PLACEHOLDERS.]</p>
               </div>
            
            5. <h2>Conclusão Estadual</h2>
            - <p>[TEXTO CONCLUSIVO SOBRE A EVOLUÇÃO NO ESTADO.]</p>
        `;

        const result = await model.generateContent(prompt);
        const pdfBuffer = await createPdf(cleanGeminiResponse(result.response.text()));
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Erro Estado PDF:", error);
        res.status(500).json({ error: "Erro ao gerar PDF." });
    }
};

// --- 3. RELATÓRIO MUNICIPAL ---
const generateMunicipalityReport = async (req, res) => {
    const { ibge } = req.params;

    try {
        const query = `
            SELECT EXTRACT(YEAR FROM publication_date) as ano, municipality_name, state_uf,
            COALESCE(final_extracted_value, COALESCE(extracted_value, 0) + COALESCE(extracted_value_txt, 0)) as valor,
            gemini_analysis, gemini_analysis_txt
            FROM mentions WHERE municipality_ibge_code = $1 AND (final_extracted_value IS NOT NULL OR extracted_value > 0 OR extracted_value_txt > 0)
            ORDER BY publication_date DESC;
        `;
        const { rows } = await db.query(query, [ibge]);

        if (rows.length === 0) return res.status(404).json({ error: "Sem dados." });

        const dadosPorAno = {};
        let totalGeral = 0;
        const categoriasGerais = initCategories();

        rows.forEach(row => {
            const val = parseFloat(row.valor);
            const ano = row.ano || 'Indefinido';
            const analysis = row.gemini_analysis_txt || row.gemini_analysis;

            totalGeral += val;
            somaCategorias(categoriasGerais, analysis);

            if (!dadosPorAno[ano]) {
                dadosPorAno[ano] = { total: 0, categorias: initCategories() };
            }
            dadosPorAno[ano].total += val;
            somaCategorias(dadosPorAno[ano].categorias, analysis);
        });

        Object.keys(dadosPorAno).forEach(ano => {
            dadosPorAno[ano].total_fmt = fmt(dadosPorAno[ano].total);
            Object.keys(dadosPorAno[ano].categorias).forEach(cat => {
                dadosPorAno[ano].categorias[cat] = fmt(dadosPorAno[ano].categorias[cat]);
            });
        });

        const prompt = `
            ATENÇÃO: Retorne APENAS HTML. Seja analítico.
            
            Relatório do Município: ${rows[0].municipality_name} (${rows[0].state_uf}).
            DADOS: ${JSON.stringify(dadosPorAno)}
            TOTAL GERAL: ${fmt(totalGeral)}
            
            ESTRUTURA OBRIGATÓRIA:
            1. <h1>Relatório Municipal: ${rows[0].municipality_name}</h1>
            2. <div class="total-geral">Total Acumulado: ${fmt(totalGeral)}</div>
            
            3. <h2>Visão Geral</h2>
            - Tabela com as categorias somadas de todo o período.
            - <p>[ANÁLISE GERAL DO PERÍODO]</p>

            4. (LOOP PARA CADA ANO):
               <div class="ano-section">
                   <h2>Exercício de [ANO] - Total: [Valor Total]</h2>
                   <h3>Destinação dos Recursos</h3>
                   - Tabela HTML (Categoria | Valor).
                   <h3>Análise do Ano</h3>
                   - <p>[ESCREVA UMA ANÁLISE ESPECÍFICA SOBRE OS GASTOS DESTE ANO. FOCO EM QUAL ÁREA RECEBEU MAIS RECURSOS.]</p>
               </div>
            
            5. <h2>Conclusão Municipal</h2>
            - <p>[TEXTO FINAL SOBRE O PERFIL DE INVESTIMENTO DA CIDADE.]</p>
        `;

        const result = await model.generateContent(prompt);
        const pdfBuffer = await createPdf(cleanGeminiResponse(result.response.text()));
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Erro Município PDF:", error);
        res.status(500).json({ error: "Erro ao gerar PDF." });
    }
};

module.exports = { generateRegionReport, generateStateReport, generateMunicipalityReport };