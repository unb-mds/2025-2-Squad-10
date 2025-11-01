// Oncomap/backend/src/scripts/enrichment.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');
const axios = require('axios');
require('dotenv').config();
const { get_encoding } = require("tiktoken");

// --- 1. CONFIGURAÇÃO DO ROTEADOR DE CHAVES ---
const apiKeys = (process.env.GEMINI_API_KEYS || "")
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0);

if (apiKeys.length === 0) {
    console.error("❌ ERRO FATAL: Nenhuma GEMINI_API_KEYS encontrada no .env. Adicione-as separadas por vírgula.");
    process.exit(1);
}

let currentKeyIndex = 0;
let genAIInstance = null;
let modelInstance = null;

/**
 * Atualiza as instâncias globais para usar a chave de API atual.
 */
function updateModelInstance() {
    const currentKey = apiKeys[currentKeyIndex];
    console.log(`\n🔄 Inicializando/Atualizando instância da API. Usando Chave #${currentKeyIndex + 1} de ${apiKeys.length}.`);
    genAIInstance = new GoogleGenerativeAI(currentKey);
    modelInstance = genAIInstance.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
}

/**
 * Gira o ponteiro para a próxima chave na lista e atualiza a instância.
 */
function switchToNextKey() {
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    console.warn(`\n-> 🔑 Trocando para a Chave de API #${currentKeyIndex + 1}...\n`);
    updateModelInstance();
}

// Inicializa o primeiro modelo
updateModelInstance();
// --- FIM DO ROTEADOR DE CHAVES ---

// Função de atraso
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- CONSTANTES DE CONTROLE ---
const MAX_TOKENS_PER_CHUNK = 800000;
const MAX_RETRIES = 3; // Retries para erros FATAIS (não 429)
const DELAY_BETWEEN_MENTIONS = 1000; // Delay curto, pois o rate limit é tratado com troca de chave
const DELAY_BETWEEN_CHUNKS = 1000;

const tokenizer = get_encoding("cl100k_base");

// Função getGeminiPrompt (seu prompt original, sem alterações)
function getGeminiPrompt(textContent) {
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

// Função extractJsonFromString (sem alterações)
function extractJsonFromString(text) {
    if (!text) return null;
    const match = text.match(/\{[\s\S]*\}/);
    let potentialJson = null;
    if (match) {
        potentialJson = match[0].trim();
    } else {
        potentialJson = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }
    if (potentialJson && potentialJson.startsWith('{') && potentialJson.endsWith('}')) {
       try { JSON.parse(potentialJson); return potentialJson; } catch (e) {}
    }
    return null;
}

// Função splitTextIntoChunksByToken (sem alterações)
function splitTextIntoChunksByToken(text, maxTokens, tokenizerInstance) {
    const chunks = [];
    const tokens = tokenizerInstance.encode(text);
    if (tokens.length <= maxTokens) return [text];
    let startIndex = 0;
    while (startIndex < tokens.length) {
        const endIndex = Math.min(startIndex + maxTokens, tokens.length);
        const chunkTokens = tokens.slice(startIndex, endIndex);
        const chunkText = tokenizerInstance.decode(chunkTokens);
        chunks.push(chunkText);
        startIndex = endIndex;
    }
    return chunks;
}


/**
 * processSingleChunk - MODIFICADO COM A NOVA LÓGICA DE PARADA
 */
async function processSingleChunk(chunkText, mentionId, chunkIndex, totalChunks) {
     let attempt = 0; // Tentativas de erro FATAL (ex: 500, 400)
     let keysRotatedThisChunk = 0; // Contador de rotação de chaves para ESTE chunk

    while (attempt < MAX_RETRIES) {
        try {
            console.log(`    -> [Chunk ${chunkIndex + 1}/${totalChunks}] Enviando chunk (Chave #${currentKeyIndex + 1}, Tentativa ${attempt + 1})...`);
            const prompt = getGeminiPrompt(chunkText);
            const generationConfig = { responseMimeType: "application/json" };
            
            // USA A INSTÂNCIA DO MODELO GLOBAL
            const result = await modelInstance.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig
            });

            const rawResponseText = result.response.text();
            console.log(`    -> [Chunk ${chunkIndex + 1}/${totalChunks}] Resposta recebida (Chave #${currentKeyIndex + 1}).`);

            const jsonString = extractJsonFromString(rawResponseText);
            if (jsonString) {
                try {
                    const chunkAnalysis = JSON.parse(jsonString);
                    // Retorna os dados com sucesso
                    return {
                        medicamentos: parseFloat(chunkAnalysis.medicamentos) || 0,
                        equipamentos: parseFloat(chunkAnalysis.equipamentos) || 0,
                        estadia_paciente: parseFloat(chunkAnalysis.estadia_paciente) || 0,
                        obras_infraestrutura: parseFloat(chunkAnalysis.obras_infraestrutura) || 0,
                        servicos_saude: parseFloat(chunkAnalysis.servicos_saude) || 0,
                        outros_relacionados: parseFloat(chunkAnalysis.outros_relacionados) || 0,
                    };
                } catch (parseError) { /* ... (log erro parse) ... */ return null; }
            } else { /* ... (log erro extração) ... */ return null; }
        
        } catch (error) {
            // Verifica se é um erro de Rate Limit
            let isRateLimitError = (error.status === 429 || (error.message && (error.message.toLowerCase().includes('resource_exhausted') || error.message.toLowerCase().includes('rate limit'))));

            if (isRateLimitError) {
                // --- LÓGICA DE ROTAÇÃO E PARADA ---
                console.warn(`    -> 🚦 Rate limit atingido na Chave #${currentKeyIndex + 1} (Chunk ${chunkIndex + 1}/${totalChunks}).`);
                
                if (keysRotatedThisChunk >= apiKeys.length - 1) {
                    // Já tentamos TODAS as chaves para este chunk e todas falharam.
                    console.error(`    -> ❌ FALHA TOTAL: Todas as ${apiKeys.length} chaves de API estão em rate limit. Abortando o script.`);
                    // Lança um erro especial que será pego no nível mais alto
                    throw new Error("ALL_KEYS_RATE_LIMITED"); 
                } else {
                    // Ainda temos chaves para tentar
                    switchToNextKey(); // Troca para a próxima chave
                    keysRotatedThisChunk++;
                }
                // --- FIM DA LÓGICA ---
            } else {
                // ... (lógica de erro fatal, igual à anterior) ...
                console.error(`    -> ❌ ERRO FATAL no chunk ${chunkIndex + 1}/${totalChunks} (ID ${mentionId}):`, error.message);
                attempt++;
                if (attempt < MAX_RETRIES) { /* ... (delay e log) ... */ } 
                else { return null; }
            }
        }
    } // Fim do while
    console.error(`    -> ❌ Excedido retries para chunk ${chunkIndex + 1}/${totalChunks} (ID ${mentionId}).`);
    return null;
}


/**
 * Função principal do script - MODIFICADA PARA RANGE E BATCHING
 */
async function enrichData(startId, endId) {
    console.log('✅ Iniciando script de enriquecimento (v7 - Roteador de Chaves + Range)...');
    console.log(`🎯 Processando menções no intervalo de ID: ${startId} a ${endId}`);

    process.on('exit', () => tokenizer.free());
    process.on('uncaughtException', () => tokenizer.free());

    let totalProcessadasComSucesso = 0;
    let totalProcessadasComFalha = 0;
    let totalChunked = 0;

    // Loop de lotes (batches)
    while (true) {
        let mentionsToProcess = null;
        try {
            // Busca o próximo lote de 100 menções no range que não foram processadas
            mentionsToProcess = await db.query(
                `SELECT id, excerpt, txt_url 
                 FROM mentions 
                 WHERE id >= $1 AND id <= $2
                 AND gemini_analysis IS NULL 
                 ORDER BY id ASC 
                 LIMIT 100`, // Processa em lotes de 100
                [startId, endId]
            );
        } catch(dbError) {
            console.error("❌ Erro fatal ao buscar menções no banco. Abortando.", dbError.message);
            throw dbError; // Lança o erro para parar o script
        }

        if (mentionsToProcess.rows.length === 0) {
            console.log('🎉 Nenhuma menção nova para processar *neste intervalo*. Trabalho concluído.');
            break; // Sai do loop 'while(true)'
        }
        
        console.log(`\nℹ️  Encontrado lote de ${mentionsToProcess.rows.length} menções para processar (Começando pelo ID ${mentionsToProcess.rows[0].id})...`);

        let successCount = 0;
        let failureCount = 0;
        let chunkedCount = 0;

        for (const [index, mention] of mentionsToProcess.rows.entries()) {
            console.log(`\n[Lote: ${index + 1}/${mentionsToProcess.rows.length}] Iniciando processamento da menção ID: ${mention.id}...`);

            let textToAnalyze = null;
            let sourceUsed = 'excerpt';
            let finalAnalysisData = {};
            let finalCalculatedTotal = 0.00;
            let success = false;

            try {
                // --- LÓGICA DE SELEÇÃO DA FONTE (txt ou excerpt) ---
                if (mention.txt_url) {
                     try {
                        const response = await axios.get(mention.txt_url);
                        textToAnalyze = response.data;
                        sourceUsed = 'txt';
                    } catch (txtDownloadError) {
                         console.warn(`  -> Aviso: Falha ao baixar .txt (${txtDownloadError.message}). Usando excerpt como fallback.`);
                         textToAnalyze = mention.excerpt;
                    }
                } else { textToAnalyze = mention.excerpt; }

                if (!textToAnalyze || textToAnalyze.trim() === '') {
                     console.warn('  -> Aviso: Fonte de texto vazia. Marcando como falha.');
                     finalAnalysisData = { error: 'Fonte de texto (excerpt/txt) vazia.', source: sourceUsed, chunked: false };
                     success = false;
                     // Não continua, vai direto para o bloco de salvar
                } else {
                    // --- LÓGICA DE CHUNKING POR TOKEN ---
                    let tokenCount = 0;
                    try {
                        tokenCount = tokenizer.encode(textToAnalyze).length;
                    } catch (encodeError) {
                         console.error(`  -> ❌ Erro ao tokenizar texto (ID: ${mention.id}). Pulando.`, encodeError.message);
                         finalAnalysisData = { error: `Erro ao tokenizar: ${encodeError.message}`, source: sourceUsed, chunked: false };
                         success = false;
                         // Não continua, vai direto para o bloco de salvar
                    }

                    // Só processa se a tokenização deu certo
                    if (!finalAnalysisData.error) {
                        if (tokenCount > MAX_TOKENS_PER_CHUNK) {
                            chunkedCount++;
                            console.log(`  -> Texto muito longo (${tokenCount} tokens > ${MAX_TOKENS_PER_CHUNK}). Dividindo em chunks...`);
                            const chunks = splitTextIntoChunksByToken(textToAnalyze, MAX_TOKENS_PER_CHUNK, tokenizer);
                            console.log(`     -> Dividido em ${chunks.length} chunks.`);

                            const aggregatedResults = {
                                medicamentos: 0, equipamentos: 0, estadia_paciente: 0,
                                obras_infraestrutura: 0, servicos_saude: 0, outros_relacionados: 0,
                                chunks_processed: 0, chunks_failed: 0
                            };

                            for (let i = 0; i < chunks.length; i++) {
                                // processSingleChunk agora pode lançar um erro fatal
                                const chunkResult = await processSingleChunk(chunks[i], mention.id, i, chunks.length);
                                if (chunkResult) {
                                    // ... (lógica de agregação dos resultados do chunk) ...
                                } else { aggregatedResults.chunks_failed++; }
                                if (i < chunks.length - 1) await delay(DELAY_BETWEEN_CHUNKS);
                            }

                            finalCalculatedTotal = /* ... (soma das categorias) ... */
                            finalAnalysisData = { /* ... (objeto de resultado agregado) ... */ };
                            success = aggregatedResults.chunks_failed === 0;

                        } else {
                            // --- Processamento Normal (Texto Curto) ---
                            console.log(`  -> Texto curto (${tokenCount} tokens <= ${MAX_TOKENS_PER_CHUNK}). Processando diretamente...`);
                            // processSingleChunk agora pode lançar um erro fatal
                            const result = await processSingleChunk(textToAnalyze, mention.id, 0, 1);
                            if (result) {
                                finalCalculatedTotal = /* ... (soma das categorias) ... */
                                finalAnalysisData = { /* ... (objeto de resultado) ... */ };
                                success = true;
                            } else {
                                 finalAnalysisData = { error: 'Falha no processamento do texto curto', source: sourceUsed, approx_tokens: tokenCount };
                                 finalCalculatedTotal = 0.00;
                                 success = false;
                            }
                        }
                    } // Fim do if (tokenização deu certo)
                } // Fim do if (texto não estava vazio)

                // ---- Salvar no Banco ----
                await db.query(
                    `UPDATE mentions SET gemini_analysis = $1, extracted_value = $2 WHERE id = $3`,
                    [JSON.stringify(finalAnalysisData), finalCalculatedTotal, mention.id]
                );

                if(success){
                     console.log(`  -> Sucesso final (fonte: ${sourceUsed}${finalAnalysisData.chunked ? ', chunked' : ''})! Total calculado: R$ ${finalCalculatedTotal.toFixed(2)}`);
                     successCount++;
                } else {
                      console.error(`  -> Falha final no processamento da menção ID ${mention.id} (ver logs de chunk/erro acima).`);
                      failureCount++;
                }

            } catch (error) {
                // --- CAPTURA O ERRO FATAL DE RATE LIMIT ---
                if (error.message === "ALL_KEYS_RATE_LIMITED") {
                    console.error("Erro pego no loop principal: ALL_KEYS_RATE_LIMITED. Relançando para parar o script.");
                    throw error; // Lança o erro novamente para ser pego pelo catch principal do script
                }
                
                // Trata outros erros inesperados para esta menção específica
                console.error(`❌ ERRO INESPERADO no loop principal da menção ID ${mention.id}:`, error.message);
                 await db.query(
                     `UPDATE mentions SET gemini_analysis = $1, extracted_value = 0.00 WHERE id = $2`,
                     [JSON.stringify({ error: `Erro inesperado: ${error.message}`, source: sourceUsed, chunked: false }), mention.id]
                 );
                 failureCount++;
            }

            await delay(DELAY_BETWEEN_MENTIONS);
        } // Fim do loop FOR

        console.log(`\n📊 Lote de ${mentionsToProcess.rows.length} finalizado!`);
        console.log(`   - Sucessos neste lote: ${successCount}`);
        console.log(`   - Falhas neste lote: ${failureCount}`);
        console.log(`   - Chunked neste lote: ${chunkedCount}`);
        
        totalProcessadasComSucesso += successCount;
        totalProcessadasComFalha += failureCount;
        totalChunked += chunkedCount;
        
        // Pausa curta antes de buscar o próximo lote
        await delay(5000); 

    } // Fim do loop WHILE(true)

    console.log(`\n🎉 Processo de enriquecimento finalizado para o intervalo de IDs!`);
    console.log(`   - TOTAL de Sucessos: ${totalProcessadasComSucesso}`);
    console.log(`   - TOTAL de Falhas: ${totalProcessadasComFalha}`);
    console.log(`   - TOTAL de Menções com Chunking: ${totalChunked}`);

    tokenizer.free(); // Libera a memória do tokenizer
}

// --- 5. INÍCIO DA EXECUÇÃO (COM ARGUMENTOS) ---

// Pega os argumentos da linha de comando
const args = process.argv.slice(2); // Pula "node" e "script.js"
const startId = parseInt(args[0], 10);
const endId = parseInt(args[1], 10);

// Validação dos argumentos
if (isNaN(startId) || isNaN(endId)) {
    console.error("❌ Erro: Por favor, forneça um ID inicial e um ID final.");
    console.log("   Exemplo: node src/scripts/enrichment.js 1 500");
    process.exit(1);
}
if (startId > endId) {
    console.error("❌ Erro: O ID inicial deve ser menor ou igual ao ID final.");
    process.exit(1);
}

// Executa a função principal com os IDs
enrichData(startId, endId).catch(error => {
    // Pega o erro fatal de rate limit
    if (error.message === "ALL_KEYS_RATE_LIMITED") {
        console.error("\n🚫 PROCESSO INTERROMPIDO: Todas as chaves de API atingiram o limite de taxa. Tente novamente mais tarde.");
    } else {
        console.error("\n💥 Falha fatal e inesperada no processo do coletor:", error);
    }
    tokenizer.free(); // Garante que o tokenizer seja liberado
    process.exit(1); // Sai com código de erro
});