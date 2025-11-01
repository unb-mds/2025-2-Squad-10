// Oncomap/backend/src/scripts/enrichment.js
// VERSÃO: PDF-Direto + Roteador de Chaves + Range de ID + Correção de Bug do DB
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');
const axios = require('axios');
require('dotenv').config();
const { get_encoding } = require("tiktoken");
const pdfParse = require('pdf-parse'); // Usaremos para ler os PDFs

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
    // Usando o modelo Pro, que tem a janela de 1M de tokens necessária para PDFs
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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- CONSTANTES DE CONTROLE ---
const MAX_TOKENS_PER_CHUNK = 800000; // Margem segura para janela de 1M
const MAX_RETRIES = 3; // Retries para erros FATAIS
const DELAY_BETWEEN_MENTIONS = 1000;
const DELAY_BETWEEN_CHUNKS = 1000;

const tokenizer = get_encoding("cl100k_base");

// --- FUNÇÕES (getGeminiPrompt, extractJsonFromString, splitTextIntoChunksByToken) ---

function getGeminiPrompt(textContent, mentionId, municipalityName) {
     return `
      **Tarefa:** VOCÊ É UM ANALISTA FINANCEIRO ESPECIALIZADO EM ORÇAMENTO PÚBLICO DE SAÚDE ONCOLÓGICA. Analise CUIDADOSAMENTE o seguinte texto extraído de um Diário Oficial Municipal brasileiro. Seu objetivo é:
      1. Identificar, extrair e somar TODOS os valores monetários (em Reais) que representem gastos ou investimentos DIRETAMENTE relacionados à área de ONCOLOGIA.
      2. Categorizar esses valores somados conforme as regras abaixo.
      3. Extrair informações contextuais RELEVANTES sobre esses gastos oncológicos, se claramente presentes.

      **Formatos de Valor a Procurar (Exemplos):** R$ 1.234,56, Valor: 1.234,56, custo total de 1.234,56, etc.

      **Formato OBRIGATÓRIO da Resposta:**
      Sua resposta deve ser **EXCLUSIVAMENTE um objeto JSON válido**, sem nenhum texto antes ou depois, e sem usar markdown (como \`\`\`json). A estrutura base é MANDATÓRIA, mas campos adicionais podem ser incluídos se relevantes.

      {
        "mention_id": ${mentionId},
        "municipality_name": "${municipalityName}",
        "total_gasto_oncologico": 0.00,  // MANDATÓRIO (Soma calculada por você)
        "medicamentos": 0.00,         // MANDATÓRIO
        "equipamentos": 0.00,         // MANDATÓRIO
        "estadia_paciente": 0.00,       // MANDATÓRIO
        "obras_infraestrutura": 0.00,  // MANDATÓRIO
        "servicos_saude": 0.00,         // MANDATÓRIO
        "outros_relacionados": 0.00,    // MANDATÓRIO
        "detalhes_extraidos": [
           {
              "valor_individual": 1234.56,
              "categoria_estimada": "Medicamentos",
              "empresa_contratada": "Nome da Empresa LTDA",
              "objeto_contrato": "Descrição breve do serviço/produto oncológico",
              "numero_processo": "123/2025"
           }
        ]
      }

      **Regras Detalhadas:**
      1.  **Foco Estrito em Oncologia:** Considere APENAS valores ligados a oncologia, câncer, quimioterapia, radioterapia, etc.
      2.  **Extração e Conversão Numérica:** Encontre TODOS os valores. Converta para float (ponto decimal).
      3.  **Categorização:** Siga as definições:
          * "medicamentos": Compra/fornecimento de quimioterápicos, imunoterápicos.
          * "equipamentos": Aquisição, aluguel, manutenção de equipamentos oncológicos.
          * "estadia_paciente": Custo de internação, diária de leito oncológico.
          * "obras_infraestrutura": Construção, reforma de instalações oncológicas.
          * "servicos_saude": Contratação de serviços/exames oncológicos (radioterapia, quimioterapia).
          * "outros_relacionados": Gastos oncológicos que não se encaixam acima.
      4.  **Soma Total:** Deve ser a soma exata das outras categorias. VERIFIQUE A SOMA.
      5.  **Detalhes Extraídos:** Adicione um objeto ao array para CADA valor encontrado. Se nenhum valor for encontrado, retorne um array vazio [].
      6.  **Nenhum Valor Encontrado:** JSON com valores numéricos zerados e array "detalhes_extraidos" vazio [].
      7.  **JSON Puro:** Apenas o JSON.

      **Texto para Análise:**
      """
      ${textContent}
      """
  `;
}

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


async function processSingleChunk(chunkText, mentionId, municipalityName, chunkIndex, totalChunks) {
     let attempt = 0;
     let keysRotatedThisChunk = 0;

    while (attempt < MAX_RETRIES) {
        try {
            console.log(`    -> [Chunk ${chunkIndex + 1}/${totalChunks}] Enviando chunk (Chave #${currentKeyIndex + 1}, Tentativa ${attempt + 1})...`);
            // Passa os dados extras para o prompt
            const prompt = getGeminiPrompt(chunkText, mentionId, municipalityName);
            const generationConfig = { responseMimeType: "application/json" };
            
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
                    // Valida a estrutura básica
                    if (typeof chunkAnalysis.total_gasto_oncologico !== 'number' || !Array.isArray(chunkAnalysis.detalhes_extraidos)) {
                         console.warn(`    -> Aviso: JSON extraído não possui a estrutura esperada.`);
                         return null;
                    }
                    return chunkAnalysis; // Retorna o objeto JSON completo
                } catch (parseError) { 
                    console.error(`    -> ❌ Erro ao analisar JSON do chunk:`, parseError.message);
                    return null; 
                }
            } else { 
                console.error(`    -> ❌ Não foi possível extrair JSON do chunk.`);
                return null; 
            }
        
        } catch (error) {
            let isRateLimitError = (error.status === 429 || (error.message && (error.message.toLowerCase().includes('resource_exhausted') || error.message.toLowerCase().includes('rate limit'))));

            if (isRateLimitError) {
                console.warn(`    -> 🚦 Rate limit atingido na Chave #${currentKeyIndex + 1} (Chunk ${chunkIndex + 1}/${totalChunks}).`);
                
                if (keysRotatedThisChunk >= apiKeys.length - 1) {
                    console.error(`    -> ❌ FALHA TOTAL: Todas as ${apiKeys.length} chaves de API estão em rate limit. Abortando o script.`);
                    throw new Error("ALL_KEYS_RATE_LIMITED"); 
                } else {
                    switchToNextKey();
                    keysRotatedThisChunk++;
                }
            } else {
                console.error(`    -> ❌ ERRO FATAL no chunk ${chunkIndex + 1}/${totalChunks} (ID ${mentionId}):`, error.message);
                if (error.response && error.response.data) { console.error('       Detalhes API:', JSON.stringify(error.response.data, null, 2)); }
                attempt++;
                if (attempt < MAX_RETRIES) {
                    await delay(Math.pow(2, attempt) * 1000);
                } else {
                    console.error(`       -> Desistindo deste chunk após ${MAX_RETRIES} tentativas.`);
                    return null;
                }
            }
        }
    } // Fim do while
    console.error(`    -> ❌ Excedido retries para chunk ${chunkIndex + 1}/${totalChunks} (ID ${mentionId}).`);
    return null;
}

/**
 * Função principal do script - MODIFICADA PARA LER PDF
 */
async function enrichData(startId, endId) {
    console.log('✅ Iniciando script de enriquecimento (v8 - PDF-Direto + Roteador + Range)...');
    console.log(`🎯 Processando menções no intervalo de ID: ${startId} a ${endId}`);

    process.on('exit', () => tokenizer.free());
    process.on('uncaughtException', () => tokenizer.free());

    let totalProcessadasComSucesso = 0;
    let totalProcessadasComFalha = 0;
    let totalChunked = 0;

    while (true) {
        let mentionsToProcess = null;
        try {
            // MODIFICADO: Seleciona source_url (link do PDF) e municipality_name
            mentionsToProcess = await db.query(
                `SELECT id, source_url, municipality_name 
                 FROM mentions 
                 WHERE id >= $1 AND id <= $2
                 AND gemini_analysis IS NULL 
                 AND source_url IS NOT NULL -- Garante que só peguemos registros com link de PDF
                 ORDER BY id ASC 
                 LIMIT 100`, // Processa em lotes de 100
                [startId, endId]
            );
        } catch(dbError) {
            console.error("❌ Erro fatal ao buscar menções no banco. Abortando.", dbError.message);
            throw dbError;
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
            console.log(`\n[Lote: ${index + 1}/${mentionsToProcess.rows.length}] Iniciando processamento da menção ID: ${mention.id} (${mention.municipality_name})...`);

            let textToAnalyze = null;
            let sourceUsed = 'pdf'; // Agora a fonte é sempre 'pdf'
            let finalAnalysisData = {};
            let finalCalculatedTotal = 0.00;
            let success = false;

            try {
                // --- NOVA LÓGICA DE EXTRAÇÃO DIRETA DO PDF ---
                // A query já filtrou por source_url IS NOT NULL
                
                // 1. Baixar o PDF
                console.log(`  -> Baixando PDF de: ${mention.source_url}`);
                const response = await axios.get(mention.source_url, { 
                    responseType: 'arraybuffer',
                    timeout: 15000 // Timeout de 15 segundos para download
                });
                const pdfBuffer = response.data;
                
                // 2. Parsear o PDF
                console.log(`  -> PDF baixado. Extraindo texto...`);
                const data = await pdfParse(pdfBuffer);
                textToAnalyze = data.text;
                console.log(`  -> Texto extraído (${textToAnalyze.length} caracteres).`);
                
                // --- FIM DA NOVA LÓGICA ---

                if (!textToAnalyze || textToAnalyze.trim() === '') {
                     console.warn('  -> Aviso: Texto extraído do PDF está vazio. Marcando como falha.');
                     finalAnalysisData = { error: 'Texto extraído do PDF estava vazio.', source: sourceUsed, chunked: false };
                     success = false;
                } else {
                    let tokenCount = 0;
                    try {
                        tokenCount = tokenizer.encode(textToAnalyze).length;
                    } catch (encodeError) {
                         console.error(`  -> ❌ Erro ao tokenizar texto (ID: ${mention.id}). Pulando.`, encodeError.message);
                         finalAnalysisData = { error: `Erro ao tokenizar: ${encodeError.message}`, source: sourceUsed, chunked: false };
                         success = false;
                    }

                    if (!finalAnalysisData.error) {
                        if (tokenCount > MAX_TOKENS_PER_CHUNK) {
                            chunkedCount++;
                            console.log(`  -> Texto muito longo (${tokenCount} tokens > ${MAX_TOKENS_PER_CHUNK}). Dividindo em chunks...`);
                            const chunks = splitTextIntoChunksByToken(textToAnalyze, MAX_TOKENS_PER_CHUNK, tokenizer);
                            console.log(`     -> Dividido em ${chunks.length} chunks.`);

                            // Objeto para agregar resultados dos chunks
                            const aggregatedResults = {
                                total_gasto_oncologico: 0,
                                medicamentos: 0, equipamentos: 0, estadia_paciente: 0,
                                obras_infraestrutura: 0, servicos_saude: 0, outros_relacionados: 0,
                                detalhes_extraidos: [],
                                chunks_processed: 0, chunks_failed: 0
                            };

                            for (let i = 0; i < chunks.length; i++) {
                                const chunkResult = await processSingleChunk(chunks[i], mention.id, mention.municipality_name, i, chunks.length);
                                if (chunkResult) {
                                    // Agrega os valores numéricos
                                    aggregatedResults.medicamentos += chunkResult.medicamentos;
                                    aggregatedResults.equipamentos += chunkResult.equipamentos;
                                    aggregatedResults.estadia_paciente += chunkResult.estadia_paciente;
                                    aggregatedResults.obras_infraestrutura += chunkResult.obras_infraestrutura;
                                    aggregatedResults.servicos_saude += chunkResult.servicos_saude;
                                    aggregatedResults.outros_relacionados += chunkResult.outros_relacionados;
                                    
                                    // Concatena os arrays de detalhes
                                    if(Array.isArray(chunkResult.detalhes_extraidos)) {
                                        aggregatedResults.detalhes_extraidos.push(...chunkResult.detalhes_extraidos);
                                    }
                                    aggregatedResults.chunks_processed++;
                                } else { 
                                    aggregatedResults.chunks_failed++; 
                                }
                                if (i < chunks.length - 1) await delay(DELAY_BETWEEN_CHUNKS);
                            }

                            // Calcula o total final
                            finalCalculatedTotal = aggregatedResults.medicamentos + aggregatedResults.equipamentos +
                                 aggregatedResults.estadia_paciente + aggregatedResults.obras_infraestrutura +
                                 aggregatedResults.servicos_saude + aggregatedResults.outros_relacionados;
                            
                            aggregatedResults.total_gasto_oncologico = parseFloat(finalCalculatedTotal.toFixed(2));
                                 
                            finalAnalysisData = {
                                ...aggregatedResults,
                                source: sourceUsed,
                                chunked: true,
                                total_chunks: chunks.length,
                                approx_tokens: tokenCount
                            };
                            success = aggregatedResults.chunks_failed === 0;

                        } else {
                            // --- Processamento Normal (Texto Curto) ---
                            console.log(`  -> Texto curto (${tokenCount} tokens <= ${MAX_TOKENS_PER_CHUNK}). Processando diretamente...`);
                            const result = await processSingleChunk(textToAnalyze, mention.id, mention.municipality_name, 0, 1);
                            
                            if (result) {
                                // O total já deve vir calculado do prompt
                                finalCalculatedTotal = result.total_gasto_oncologico; 
                                finalAnalysisData = {
                                     ...result,
                                     source: sourceUsed,
                                     chunked: false,
                                     approx_tokens: tokenCount
                                };
                                success = true;
                            } else {
                                 finalAnalysisData = { error: 'Falha no processamento do texto curto', source: sourceUsed, approx_tokens: tokenCount };
                                 finalCalculatedTotal = 0.00;
                                 success = false;
                            }
                        }
                    } 
                }

                // ---- Salvar no Banco (VERSÃO CORRIGIDA) ----
                // Garante que $1 = JSON (texto), $2 = NÚMERO
                await db.query(
                    `UPDATE mentions SET gemini_analysis = $1, extracted_value = $2 WHERE id = $3`,
                    [JSON.stringify(finalAnalysisData), finalCalculatedTotal, mention.id]
                );
                // **** FIM DA CORREÇÃO ****

                if(success){
                     console.log(`  -> Sucesso final (fonte: ${sourceUsed}${finalAnalysisData.chunked ? ', chunked' : ''})! Total calculado: R$ ${finalCalculatedTotal.toFixed(2)}`);
                     successCount++;
                } else {
                      console.error(`  -> Falha final no processamento da menção ID ${mention.id} (ver logs de chunk/erro acima).`);
                      failureCount++;
                }

            } catch (error) {
                if (error.message === "ALL_KEYS_RATE_LIMITED") {
                    console.error("Erro pego no loop principal: ALL_KEYS_RATE_LIMITED. Relançando para parar o script.");
                    throw error;
                }
                
                console.error(`❌ ERRO INESPERADO no loop principal da menção ID ${mention.id}:`, error.message);
                 try {
                     await db.query(
                         `UPDATE mentions SET gemini_analysis = $1, extracted_value = 0.00 WHERE id = $2`,
                         [JSON.stringify({ error: `Erro inesperado: ${error.message}`, source: sourceUsed, chunked: false }), mention.id]
                     );
                 } catch (dbError) {
                     console.error(`❌ ERRO AO SALVAR ERRO NO BANCO para ID ${mention.id}:`, dbError.message);
                 }
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
        
        await delay(5000); 

    } // Fim do loop WHILE(true)

    console.log(`\n🎉 Processo de enriquecimento finalizado para o intervalo de IDs!`);
    console.log(`   - TOTAL de Sucessos: ${totalProcessadasComSucesso}`);
    console.log(`   - TOTAL de Falhas: ${totalProcessadasComFalha}`);
    console.log(`   - TOTAL de Menções com Chunking: ${totalChunked}`);

    tokenizer.free();
}

// --- 5. INÍCIO DA EXECUÇÃO (COM ARGUMENTOS) ---
const args = process.argv.slice(2);
const startId = parseInt(args[0], 10);
const endId = parseInt(args[1], 10);

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
    if (error.message === "ALL_KEYS_RATE_LIMITED") {
        console.error("\n🚫 PROCESSO INTERROMPIDO: Todas as chaves de API atingiram o limite de taxa. Tente novamente mais tarde.");
    } else {
        console.error("\n💥 Falha fatal e inesperada no processo do coletor:", error);
    }
    tokenizer.free();
    process.exit(1);
});