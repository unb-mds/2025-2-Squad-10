const db = require('../../config/database');
const { getStatesByRegion } = require('../../utils/regionMap');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('html-pdf-node');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

const generateRegionReport = async (req, res) => {
    const { regionName } = req.params;
    const states = getStatesByRegion(regionName);

    if (states.length === 0) {
        return res.status(400).json({ error: "Região inválida." });
    }

    try {
        // 1. BUSCAR DADOS NO BANCO (Agregados)
        const query = `
            SELECT 
                state_uf,
                COUNT(*) as total_mentions,
                SUM(final_extracted_value) as total_value
            FROM mentions
            WHERE state_uf = ANY($1) AND final_extracted_value IS NOT NULL
            GROUP BY state_uf
            ORDER BY total_value DESC;
        `;
        
        const { rows } = await db.query(query, [states]);

        // Calcula totais gerais
        const totalRegionValue = rows.reduce((acc, r) => acc + parseFloat(r.total_value), 0);
        const formattedTotal = totalRegionValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Prepara dados para o Prompt (JSON enxuto)
        const dataContext = JSON.stringify({
            regiao: regionName,
            investimento_total: formattedTotal,
            detalhes_por_estado: rows.map(r => ({
                estado: r.state_uf,
                valor: parseFloat(r.total_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                qtd_contratos: r.total_mentions
            }))
        });

        // 2. PROMPT PARA O GEMINI (Gerar HTML)
        const prompt = `
            Você é um especialista em relatórios de transparência pública.
            Gere um relatório técnico e elegante em formato HTML (apenas o conteúdo dentro de <body>, sem tags html/head) sobre os investimentos em oncologia na Região ${regionName}.
            
            DADOS REAIS DO BANCO DE DADOS:
            ${dataContext}

            REGRAS DE FORMATAÇÃO:
            - Use tags <h1> para o título principal.
            - Use <h2> para seções.
            - Crie uma tabela HTML elegante com bordas para mostrar os dados por estado.
            - Escreva um parágrafo de análise interpretando os dados (qual estado investiu mais, a disparidade regional, etc).
            - Adicione uma conclusão sobre a importância desses investimentos.
            - Use CSS inline para deixar o relatório bonito (fonte Arial, cores sóbrias, tabela zebrada).
            - NÃO INVENTE DADOS. Use estritamente os números fornecidos.

            Use de Base o seguinte Modelo pro texto:

            Relatório de Investimentos em Oncologia na Região ... (TITULO)

            Visão Geral dos investimentos (SUBTITULO)
            ...

            
            Investimento Total (SUBTITULO)
            O investimento total em oncologia na Região ... foi de R$ ...

            Dados por Estado (SUBTITULO)
            (Tabela com colunas de Estado, Valor insvestido, Quantidade de Contratos)

            Análise Dos Dados (SUBTITULO)
            ...

            Conclusão (SUBTITULO)
            ...

        `;

        // 3. CHAMADA AO GEMINI
        const result = await model.generateContent(prompt);
        const htmlContent = result.response.text();

        // Limpeza básica caso o Gemini devolva markdown ```html ... ```
        const cleanHtml = htmlContent.replace(/```html|```/g, '');

        // Adiciona um wrapper HTML básico para o PDF
        const finalHtml = `
            <html>
                <head>
                    <style>
                        body { font-family: Helvetica, Arial, sans-serif; padding: 40px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #0D4B55; color: white; }
                        tr:nth-child(even) { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    ${cleanHtml}
                    <br/><br/>
                    <hr/>
                    <p style="font-size: 12px; color: gray; text-align: center;">
                        Relatório gerado automaticamente pelo OncoMap em ${new Date().toLocaleDateString()}.
                    </p>
                </body>
            </html>
        `;

        // 4. GERAR PDF
        const options = { format: 'A4', printBackground: true };
        const file = { content: finalHtml };

        pdf.generatePdf(file, options).then(pdfBuffer => {
            // 5. ENVIAR PARA O FRONTEND
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=relatorio-${regionName}.pdf`);
            res.send(pdfBuffer);
        });

    } catch (error) {
        console.error("Erro ao gerar relatório PDF:", error);
        res.status(500).json({ error: "Erro ao gerar PDF." });
    }
};

module.exports = { generateRegionReport };