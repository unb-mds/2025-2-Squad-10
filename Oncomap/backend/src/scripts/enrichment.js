// backend/src/scripts/enrichment.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database'); // Ajuste o caminho
const axios = require('axios'); // Precisamos do axios para baixar o .txt
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// O prompt para o Gemini permanece o mesmo
function getGeminiPrompt(textContent) { 
    return `
        **Tarefa:** Analise o seguinte texto extraído de um Diário Oficial Municipal brasileiro. Seu objetivo é identificar e extrair TODOS os valores monetários (em Reais) que representem gastos ou investimentos DIRETAMENTE relacionados à área de ONCOLOGIA. Após identificar os valores, some-os e categorize-os de acordo com as regras abaixo.

        **Formato OBRIGATÓRIO da Resposta:**
        Sua resposta deve ser **EXCLUSIVAMENTE um objeto JSON válido**, sem nenhum texto antes ou depois, e sem usar markdown (como \`\`\`json). O formato deve ser EXATAMENTE este:

        {
          "total_gasto_oncologico": 0.00,
          "medicamentos": 0.00,
          "equipamentos": 0.00,
          "estadia_paciente": 0.00,
          "obras_infraestrutura": 0.00,
          "servicos_saude": 0.00,
          "outros_relacionados": 0.00
        }

        **Regras Detalhadas:**
        1.  **Foco em Oncologia:** Considere APENAS valores explicitamente ligados a oncologia, câncer, quimioterapia, radioterapia, medicamentos oncológicos, equipamentos para diagnóstico/tratamento de câncer, etc. Ignore outros gastos de saúde não relacionados.
        2.  **Formato Numérico:** Todos os valores no JSON devem ser números (float ou integer), usando ponto (.) como separador decimal. Não inclua "R$" ou separadores de milhar. Exemplo: 1500.50.
        3.  **Categorização:**
            * **"medicamentos":** Some aqui valores de compra de quimioterápicos, imunoterápicos, fármacos de suporte direto ao tratamento oncológico.
            * **"equipamentos":** Some valores de aquisição, aluguel ou manutenção de equipamentos usados em oncologia (ex: acelerador linear, mamógrafo, tomógrafo para radioterapia, PET-CT).
            * **"estadia_paciente":** Some valores explicitamente mencionados como custo de internação, diária de leito hospitalar, ou acomodação de pacientes oncológicos (menos comum em diários, mas inclua se encontrar).
            * **"obras_infraestrutura":** Some valores de construção, reforma ou ampliação de alas, centros ou hospitais oncológicos.
            * **"servicos_saude":** Some valores de contratação de serviços médicos oncológicos, exames de diagnóstico (patologia, imagem para oncologia), serviços de radioterapia/quimioterapia, transporte de pacientes oncológicos (TFD).
            * **"outros_relacionados":** Use como um "catch-all" para gastos claramente oncológicos que não se encaixam perfeitamente nas categorias acima (ex: campanhas de prevenção específicas de câncer, software de gestão oncológica, etc.).
            * **"total_gasto_oncologico":** Deve ser a SOMA EXATA de todas as outras categorias ('medicamentos + equipamentos + estadia_paciente + obras_infraestrutura + servicos_saude + outros_relacionados'). Se múltiplos valores forem encontrados para uma mesma categoria no texto, some-os antes de colocar no JSON.
        4.  **Nenhum Valor Encontrado:** Se o texto não contiver NENHUM valor monetário relacionado à oncologia, retorne o JSON com todos os campos zerados (0.00).
        5.  **Precisão e Validação:** Certifique-se de que o JSON retornado é válido. Se houver qualquer dúvida sobre a categorização de um valor, use o campo "outros_relacionados".
        6.  **Exclusão de Texto Adicional:** Não inclua nenhuma explicação, comentário ou texto adicional fora do objeto JSON. Apenas o JSON puro.

        **Texto para Análise:**
        """
        ${textContent}
        """
    `;
}

async function enrichData() {
    console.log('✅ Iniciando script de enriquecimento (usando .txt com fallback para excerpt)...');
    
    // Busca menções não processadas, AGORA INCLUINDO txt_url
    const mentionsToProcess = await db.query(
        'SELECT id, excerpt, txt_url FROM mentions WHERE gemini_analysis IS NULL' 
    );

    if (mentionsToProcess.rows.length === 0) {
        // ... (mensagem de conclusão) ...
        return;
    }

    console.log(`ℹ️  Encontradas ${mentionsToProcess.rows.length} menções para processar.`);

    for (const [index, mention] of mentionsToProcess.rows.entries()) {
        console.log(`\n[${index + 1}/${mentionsToProcess.rows.length}] Processando menção ID: ${mention.id}...`);
        
        let textToAnalyze = null;
        let sourceUsed = 'excerpt'; // Para logar qual fonte foi usada

        try {
            // --- LÓGICA DE SELEÇÃO DA FONTE ---
            if (mention.txt_url) {
                try {
                    console.log(`  -> Tentando baixar .txt de: ${mention.txt_url}`);
                    const response = await axios.get(mention.txt_url);
                    textToAnalyze = response.data; // Pega o conteúdo de texto
                    sourceUsed = 'txt';
                    console.log(`  -> Sucesso ao baixar .txt (${(textToAnalyze.length / 1024).toFixed(2)} KB).`);
                } catch (txtDownloadError) {
                    console.warn(`  -> Aviso: Falha ao baixar .txt (${txtDownloadError.message}). Usando excerpt como fallback.`);
                    textToAnalyze = mention.excerpt; // Fallback para o excerpt
                }
            } else {
                console.log('  -> .txt URL não disponível. Usando excerpt.');
                textToAnalyze = mention.excerpt; // Usa o excerpt se não houver txt_url
            }
            // --- FIM DA LÓGICA DE SELEÇÃO ---

            // Garante que temos algum texto para analisar
            if (!textToAnalyze || textToAnalyze.trim() === '') {
                 console.warn('  -> Aviso: Fonte de texto vazia. Pulando análise.');
                 // Marca como processado com erro ou dados vazios para não tentar de novo
                 await db.query(
                    `UPDATE mentions SET gemini_analysis = $1, extracted_value = 0.00 WHERE id = $2`,
                    [JSON.stringify({ error: 'Texto fonte vazio', source: sourceUsed }), mention.id]
                 );
                 continue; // Pula para a próxima menção
            }

            // ---- ANÁLISE COM GEMINI ----
            // ATENÇÃO: Verificar tamanho do texto antes de enviar para o Gemini!
            // Uma versão mais robusta adicionaria lógica de chunking aqui se 'textToAnalyze' for muito grande.
            // Por simplicidade, vamos assumir que cabe (o que é provável para a maioria dos .txt).

            const prompt = getGeminiPrompt(textToAnalyze);
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // ... (Lógica para parsear o JSON e salvar no banco, igual à anterior) ...
            let analysisData;
            try {
                analysisData = JSON.parse(responseText);
            } catch (parseError) {
                // ... (Tratamento de erro de parse) ...
                analysisData = { error: 'JSON parse error', response: responseText, source: sourceUsed };
            }

            const totalValue = analysisData.total_gasto || 0.00;
            await db.query(
                `UPDATE mentions SET gemini_analysis = $1, extracted_value = $2 WHERE id = $3`,
                [JSON.stringify(analysisData), totalValue, mention.id]
            );

            console.log(`  -> Sucesso (fonte: ${sourceUsed})! Total extraído: R$ ${totalValue}`);

            await delay(500); // Mantém a pausa

        } catch (error) {
            // ... (Tratamento de erro fatal, igual ao anterior) ...
            console.error(`❌ ERRO FATAL ao processar a menção ID ${mention.id}:`, error.message);
            await delay(1000);
        }
    }

    console.log('🎉 Processo de enriquecimento de dados finalizado!');
}

enrichData().catch(console.error);