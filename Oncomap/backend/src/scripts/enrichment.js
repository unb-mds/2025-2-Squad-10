// backend/src/scripts/enrichment.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database'); // Ajuste o caminho
const axios = require('axios');
require('dotenv').config();

// Configuração do cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

// Função de atraso
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função getGeminiPrompt permanece a mesma
function getGeminiPrompt(textContent) {
    // ... (cole o prompt refinado aqui) ...
    return `
        **Tarefa:** VOCÊ É UM ANALISTA FINANCEIRO ESPECIALIZADO EM ORÇAMENTO PÚBLICO DE SAÚDE. Analise CUIDADOSAMENTE o seguinte texto extraído de um Diário Oficial Municipal brasileiro. Seu objetivo é identificar, extrair e somar TODOS os valores monetários (em Reais) que representem gastos ou investimentos DIRETAMENTE relacionados à área de ONCOLOGIA. Categorize os valores somados conforme as regras.

        **Formatos de Valor a Procurar (Exemplos):**
        * R$ 1.234,56
        * R$1.234,56
        * Valor: 1.234,56
        * Custo total de 1.234,56
        * Valor adjudicado: R$ 1.234,56
        * (Procure por números com vírgula decimal próximos a palavras como "valor", "custo", "total", "R$")

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
        1.  **Foco Estrito em Oncologia:** Considere APENAS valores explicitamente ligados a oncologia, câncer, quimioterapia, radioterapia, medicamentos oncológicos, equipamentos para diagnóstico/tratamento de câncer, etc. Ignore outros gastos de saúde mencionados que não sejam oncológicos. SEJA PRECISO.
        2.  **Extração e Conversão Numérica:** Encontre TODOS os valores relevantes no texto. Converta-os para números (float), usando ponto (.) como separador decimal. Remova "R$" e separadores de milhar. Some todos os valores encontrados para cada categoria.
        3.  **Categorização (Revise com Atenção):**
            * "medicamentos": Compra/fornecimento de quimioterápicos, imunoterápicos, fármacos de suporte oncológico.
            * "equipamentos": Aquisição, aluguel, manutenção de equipamentos oncológicos (acelerador linear, mamógrafo, PET-CT, etc.).
            * "estadia_paciente": Custo de internação, diária de leito, acomodação de pacientes oncológicos.
            * "obras_infraestrutura": Construção, reforma, ampliação de instalações oncológicas.
            * "servicos_saude": Contratação de serviços médicos/exames oncológicos, radioterapia, quimioterapia, transporte (TFD).
            * "outros_relacionados": Gastos oncológicos que não se encaixam acima (campanhas, software, etc.).
            * "total_gasto_oncologico": SOMA EXATA de todas as outras categorias calculada por você. VERIFIQUE A SOMA.
        4.  **Nenhum Valor Encontrado:** Se, após análise cuidadosa, o texto não contiver NENHUM valor monetário ligado à oncologia, retorne o JSON com todos os campos zerados (0.00).
        5.  **JSON Puro:** A resposta DEVE ser apenas o JSON, começando com { e terminando com }.

        **Texto para Análise:**
        """
        ${textContent}
        """
    `;
}


// Função extractJsonFromString permanece a mesma
function extractJsonFromString(text) {
    // ... (código da função de limpeza) ...
    if (!text) return null;
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        const cleanedText = text.replace(/^```json\s*/, '').replace(/```$/, '');
        if (cleanedText.startsWith('{') && cleanedText.endsWith('}')) {
             return cleanedText.trim();
        }
        return null;
    }
    return text.substring(startIndex, endIndex + 1).trim();
}


/**
 * Processa uma única menção, incluindo lógica de retry para rate limits (429).
 */
async function processMention(mention, maxRetries = 3) {
    let textToAnalyze = null;
    let sourceUsed = 'excerpt';
    let attempt = 0;

    // Lógica para obter o texto (txt ou excerpt)
     if (mention.txt_url) {
        try {
            console.log(`  -> Tentando baixar .txt de: ${mention.txt_url}`);
            const response = await axios.get(mention.txt_url);
            textToAnalyze = response.data;
            sourceUsed = 'txt';
            console.log(`  -> Sucesso ao baixar .txt (${(textToAnalyze?.length / 1024)?.toFixed(2)} KB).`);
        } catch (txtDownloadError) {
             console.warn(`  -> Aviso: Falha ao baixar .txt (${txtDownloadError.message}). Usando excerpt como fallback.`);
             textToAnalyze = mention.excerpt;
        }
    } else {
         console.log('  -> .txt URL não disponível. Usando excerpt.');
         textToAnalyze = mention.excerpt;
    }

    if (!textToAnalyze || textToAnalyze.trim() === '') {
        console.warn('  -> Aviso: Fonte de texto vazia. Pulando análise.');
        await db.query(
           `UPDATE mentions SET gemini_analysis = $1, extracted_value = 0.00 WHERE id = $2`,
           [JSON.stringify({ error: 'Texto fonte vazio', source: sourceUsed }), mention.id]
        );
        return true; // Indica que foi processado (pulado) com sucesso
    }

    // Loop de tentativas para a chamada ao Gemini
    while (attempt < maxRetries) {
        try {
            const prompt = getGeminiPrompt(textToAnalyze);
            const result = await model.generateContent(prompt);
            const rawResponseText = result.response.text();
            const jsonString = extractJsonFromString(rawResponseText);

            let analysisData = {};
            let calculatedTotal = 0.00;

            if (jsonString) {
                try {
                    analysisData = JSON.parse(jsonString);
                    calculatedTotal =
                        (parseFloat(analysisData.medicamentos) || 0) +
                        (parseFloat(analysisData.equipamentos) || 0) +
                        (parseFloat(analysisData.estadia_paciente) || 0) +
                        (parseFloat(analysisData.obras_infraestrutura) || 0) +
                        (parseFloat(analysisData.servicos_saude) || 0) +
                        (parseFloat(analysisData.outros_relacionados) || 0);
                    analysisData.total_gasto_oncologico_calculado = parseFloat(calculatedTotal.toFixed(2));
                } catch (parseError) {
                    console.error('❌ Erro ao analisar o JSON (após limpeza). JSON extraído:', jsonString);
                    analysisData = { error: 'JSON parse error after cleaning', extractedJson: jsonString, rawResponse: rawResponseText, source: sourceUsed };
                }
            } else {
                 console.error('❌ Não foi possível extrair um JSON válido da resposta do Gemini. Resposta bruta:', rawResponseText);
                 analysisData = { error: 'No valid JSON extracted', rawResponse: rawResponseText, source: sourceUsed };
            }

            await db.query(
                `UPDATE mentions SET gemini_analysis = $1, extracted_value = $2 WHERE id = $3`,
                [JSON.stringify(analysisData), calculatedTotal, mention.id]
            );

            console.log(`  -> Sucesso (fonte: ${sourceUsed})! Total calculado: R$ ${calculatedTotal.toFixed(2)}`);
            return true; // Sucesso, sai do loop de tentativas

        } catch (error) {
            // **NOVO: Tratamento Específico do Erro 429**
            // Verifica se é um erro da API e se o status é 429
            // (A estrutura exata do erro pode variar um pouco com o SDK, ajuste se necessário)
            if (error.message && error.message.includes('429')) {
                attempt++;
                console.warn(`🚦 Rate limit atingido (Tentativa ${attempt}/${maxRetries}). Esperando para tentar novamente...`);
                // Extrai o tempo de espera sugerido da mensagem ou usa um padrão
                const retryMatch = error.message.match(/Please retry in (\d+\.?\d*)s/);
                const waitTimeSeconds = retryMatch ? parseFloat(retryMatch[1]) + 1 : Math.pow(2, attempt) * 5; // Pega o tempo sugerido +1s ou usa backoff exponencial (5s, 10s, 20s)
                
                console.log(`   -> Aguardando ${waitTimeSeconds.toFixed(1)} segundos.`);
                await delay(waitTimeSeconds * 1000);
                // O loop 'while' continuará para a próxima tentativa
            } else {
                // Se for outro tipo de erro, registra e desiste desta menção
                console.error(`❌ ERRO FATAL (não 429) ao processar a menção ID ${mention.id}:`, error.message);
                // Poderia marcar no banco com um erro específico se quisesse
                return false; // Indica falha, sai do loop de tentativas
            }
        }
    }
     // Se chegou aqui, excedeu o número máximo de retries para erro 429
     console.error(`❌ Excedido número máximo de retries (${maxRetries}) para a menção ID ${mention.id} devido a rate limits.`);
     return false; // Indica falha
}


/**
 * Função principal do script de enriquecimento.
 */
async function enrichData() {
    console.log('✅ Iniciando script de enriquecimento (v3 - com retry para 429)...');

    const mentionsToProcess = await db.query(
        'SELECT id, excerpt, txt_url FROM mentions WHERE gemini_analysis IS NULL'
    );

    if (mentionsToProcess.rows.length === 0) {
        console.log('🎉 Nenhum dado novo para processar.');
        return;
    }

    console.log(`ℹ️  Encontradas ${mentionsToProcess.rows.length} menções para processar.`);

    let successCount = 0;
    let failureCount = 0;

    for (const [index, mention] of mentionsToProcess.rows.entries()) {
        console.log(`\n[${index + 1}/${mentionsToProcess.rows.length}] Iniciando processamento da menção ID: ${mention.id}...`);

        const success = await processMention(mention); // Chama a função que contém a lógica de retry

        if(success) {
            successCount++;
        } else {
            failureCount++;
        }

        // **Ajuste no Delay Padrão**
        // Aumenta a pausa padrão entre menções *diferentes* para ajudar a evitar o limite de tokens/min
        await delay(1500); // Ex: 1.5 segundos entre cada menção
    }

    console.log(`\n🎉 Processo de enriquecimento finalizado!`);
    console.log(`   - Sucesso: ${successCount}`);
    console.log(`   - Falhas (após retries): ${failureCount}`);
}

enrichData().catch(console.error);