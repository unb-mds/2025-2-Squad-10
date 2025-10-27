// backend/src/scripts/enrichment.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database'); // Ajuste o caminho
const axios = require('axios');
require('dotenv').config();
const { get_encoding } = require("tiktoken"); // <-- NOVA IMPORTAÇÃO

// Configuração do cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' }); // Corrigido

// Função de atraso
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- CONSTANTES DE CONTROLE (ATUALIZADAS) ---
// Limite de tokens por chunk. O Gemini 1.5 tem 1M, mas usamos uma margem GRANDE
// para acomodar o prompt, a resposta e diferenças na tokenização.
const MAX_TOKENS_PER_CHUNK = 800000; // 800k Tokens (ajuste se necessário)
const MAX_RETRIES = 3;
const DELAY_BETWEEN_MENTIONS = 1500;
const DELAY_BETWEEN_CHUNKS = 1000;
// --- FIM DAS CONSTANTES ---

// Instância do Tokenizer (cl100k_base é usado por GPT-4/3.5, uma boa aproximação)
// NOTA: Esta tokenização é uma APROXIMAÇÃO da usada pelo Gemini.
const tokenizer = get_encoding("cl100k_base");

// Função getGeminiPrompt permanece a mesma
function getGeminiPrompt(textContent) {
    // ... (cole o prompt refinado v3 aqui) ...
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
 * **NOVO:** Divide o texto em chunks baseados em contagem de tokens.
 */
function splitTextIntoChunksByToken(text, maxTokens, tokenizerInstance) {
    const chunks = [];
    // Codifica o texto inteiro em tokens (array de números)
    const tokens = tokenizerInstance.encode(text);

    if (tokens.length <= maxTokens) {
        // Se couber em um chunk, não precisa dividir
        return [text];
    }

    let startIndex = 0;
    while (startIndex < tokens.length) {
        const endIndex = Math.min(startIndex + maxTokens, tokens.length);
        // Pega o pedaço de tokens
        const chunkTokens = tokens.slice(startIndex, endIndex);
        // Decodifica os tokens de volta para texto
        const chunkText = tokenizerInstance.decode(chunkTokens);
        chunks.push(chunkText);
        startIndex = endIndex;
    }
    return chunks;
}


// Função processSingleChunk permanece a mesma (já estava modularizada)
async function processSingleChunk(chunkText, mentionId, chunkIndex, totalChunks) {
    // ... (código igual ao da versão anterior, com retry para 429) ...
     let attempt = 0;
    while (attempt < MAX_RETRIES) {
        try {
            console.log(`    -> [Chunk ${chunkIndex + 1}/${totalChunks}] Enviando chunk para Gemini (Tentativa ${attempt + 1})...`);
            const prompt = getGeminiPrompt(chunkText);
            const result = await model.generateContent(prompt);
            const rawResponseText = result.response.text();
            console.log(`    -> [Chunk ${chunkIndex + 1}/${totalChunks}] Resposta bruta recebida.`);

            const jsonString = extractJsonFromString(rawResponseText);
            if (jsonString) {
                try {
                    const chunkAnalysis = JSON.parse(jsonString);
                    // Retorna apenas os dados válidos, ignoramos o total do chunk
                    return {
                        medicamentos: parseFloat(chunkAnalysis.medicamentos) || 0,
                        equipamentos: parseFloat(chunkAnalysis.equipamentos) || 0,
                        estadia_paciente: parseFloat(chunkAnalysis.estadia_paciente) || 0,
                        obras_infraestrutura: parseFloat(chunkAnalysis.obras_infraestrutura) || 0,
                        servicos_saude: parseFloat(chunkAnalysis.servicos_saude) || 0,
                        outros_relacionados: parseFloat(chunkAnalysis.outros_relacionados) || 0,
                    };
                } catch (parseError) {
                    console.error(`    -> ❌ Erro ao analisar JSON do chunk ${chunkIndex + 1}/${totalChunks}.`, parseError.message);
                    return null;
                }
            } else {
                 console.error(`    -> ❌ Não foi possível extrair JSON do chunk ${chunkIndex + 1}/${totalChunks}.`);
                 return null;
            }
        // Tratamento de erro 429 para o chunk
        } catch (error) {
            if (error.message && error.message.includes('429')) {
                attempt++;
                console.warn(`    -> 🚦 Rate limit no chunk ${chunkIndex + 1}/${totalChunks} (Tentativa ${attempt}/${MAX_RETRIES}). Esperando...`);
                const retryMatch = error.message.match(/Please retry in (\d+\.?\d*)s/);
                const waitTimeSeconds = retryMatch ? parseFloat(retryMatch[1]) + 1 : Math.pow(2, attempt) * 5;
                console.log(`       -> Aguardando ${waitTimeSeconds.toFixed(1)} segundos.`);
                await delay(waitTimeSeconds * 1000);
            } else {
                console.error(`    -> ❌ ERRO FATAL no chunk ${chunkIndex + 1}/${totalChunks} (Menção ID ${mentionId}):`, error.message);
                return null; // Falha irrecuperável para este chunk
            }
        }
    }
    console.error(`    -> ❌ Excedido retries para chunk ${chunkIndex + 1}/${totalChunks} (Menção ID ${mentionId}).`);
    return null; // Falha após retries
}


/**
 * Função principal do script de enriquecimento (v5 - com chunking por token).
 */
async function enrichData() {
    console.log('✅ Iniciando script de enriquecimento (v5 - com chunking por token)...');

    // Libera a memória do tokenizer ao final (ou em caso de erro não tratado)
    process.on('exit', () => tokenizer.free());
    process.on('uncaughtException', () => tokenizer.free());

    const mentionsToProcess = await db.query(
        'SELECT id, excerpt, txt_url FROM mentions WHERE gemini_analysis IS NULL'
    );

    if (mentionsToProcess.rows.length === 0) { /* ... */ tokenizer.free(); return; }
    console.log(`ℹ️  Encontradas ${mentionsToProcess.rows.length} menções para processar.`);

    let successCount = 0;
    let failureCount = 0;
    let chunkedCount = 0;

    for (const [index, mention] of mentionsToProcess.rows.entries()) {
        console.log(`\n[${index + 1}/${mentionsToProcess.rows.length}] Iniciando processamento da menção ID: ${mention.id}...`);

        let textToAnalyze = null;
        let sourceUsed = 'excerpt';
        let finalAnalysisData = {};
        let finalCalculatedTotal = 0.00;
        let success = false;

        try {
            // --- LÓGICA DE SELEÇÃO DA FONTE (txt ou excerpt) ---
            if (mention.txt_url) { /* ... código para baixar .txt ... */ 
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
                 // ... (código para pular menção vazia, marcando erro) ...
                 console.warn('  -> Aviso: Fonte de texto vazia. Pulando análise.');
                 await db.query(/*...*/); // Marca com erro
                 failureCount++;
                 continue;
            }

            // --- **NOVO: LÓGICA DE CHUNKING POR TOKEN** ---
            let tokenCount = 0;
            try {
                // Conta os tokens ANTES de decidir se precisa de chunking
                tokenCount = tokenizer.encode(textToAnalyze).length;
            } catch (encodeError) {
                 console.error(`  -> ❌ Erro ao tokenizar texto para contagem (ID: ${mention.id}). Pulando.`, encodeError.message);
                  await db.query( /*...*/); // Marca com erro de tokenização
                  failureCount++;
                  continue;
            }


            if (tokenCount > MAX_TOKENS_PER_CHUNK) {
                chunkedCount++;
                console.log(`  -> Texto muito longo (${tokenCount} tokens > ${MAX_TOKENS_PER_CHUNK}). Dividindo em chunks...`);
                // Chama a nova função de split por token
                const chunks = splitTextIntoChunksByToken(textToAnalyze, MAX_TOKENS_PER_CHUNK, tokenizer);
                console.log(`     -> Dividido em ${chunks.length} chunks.`);

                const aggregatedResults = { /* ... inicializa zerado ... */ 
                    medicamentos: 0, equipamentos: 0, estadia_paciente: 0,
                    obras_infraestrutura: 0, servicos_saude: 0, outros_relacionados: 0,
                    chunks_processed: 0, chunks_failed: 0
                };

                for (let i = 0; i < chunks.length; i++) {
                    const chunkResult = await processSingleChunk(chunks[i], mention.id, i, chunks.length);
                    if (chunkResult) { /* ... soma nos aggregatedResults ... */ 
                        aggregatedResults.medicamentos += chunkResult.medicamentos;
                        aggregatedResults.equipamentos += chunkResult.equipamentos;
                        aggregatedResults.estadia_paciente += chunkResult.estadia_paciente;
                        aggregatedResults.obras_infraestrutura += chunkResult.obras_infraestrutura;
                        aggregatedResults.servicos_saude += chunkResult.servicos_saude;
                        aggregatedResults.outros_relacionados += chunkResult.outros_relacionados;
                        aggregatedResults.chunks_processed++;
                    } else { aggregatedResults.chunks_failed++; }
                    if (i < chunks.length - 1) await delay(DELAY_BETWEEN_CHUNKS);
                }

                // Calcula total e monta o objeto final
                finalCalculatedTotal = /* ... soma das categorias ... */
                     aggregatedResults.medicamentos + aggregatedResults.equipamentos +
                     aggregatedResults.estadia_paciente + aggregatedResults.obras_infraestrutura +
                     aggregatedResults.servicos_saude + aggregatedResults.outros_relacionados;
                finalAnalysisData = { /* ... monta objeto final com aggregatedResults ... */ 
                    ...aggregatedResults,
                    total_gasto_oncologico_calculado: parseFloat(finalCalculatedTotal.toFixed(2)),
                    source: sourceUsed,
                    chunked: true,
                    total_chunks: chunks.length,
                    approx_tokens: tokenCount // Salva a contagem de tokens aproximada
                };
                success = aggregatedResults.chunks_failed === 0;

            } else {
                // --- Processamento Normal (Texto Curto) ---
                console.log(`  -> Texto curto (${tokenCount} tokens <= ${MAX_TOKENS_PER_CHUNK}). Processando diretamente...`);
                const result = await processSingleChunk(textToAnalyze, mention.id, 0, 1);
                if (result) { /* ... calcula total e monta objeto final ... */ 
                    finalCalculatedTotal = result.medicamentos + result.equipamentos + result.estadia_paciente +
                                          result.obras_infraestrutura + result.servicos_saude + result.outros_relacionados;
                    finalAnalysisData = { /* ... monta objeto final com result ... */ 
                         ...result,
                         total_gasto_oncologico_calculado: parseFloat(finalCalculatedTotal.toFixed(2)),
                         source: sourceUsed,
                         chunked: false,
                         approx_tokens: tokenCount // Salva a contagem de tokens aproximada
                    };
                    success = true;
                } else { /* ... monta objeto de erro ... */ 
                     finalAnalysisData = { error: 'Falha no processamento do texto curto', source: sourceUsed, approx_tokens: tokenCount };
                     finalCalculatedTotal = 0.00;
                     success = false;
                }
            }
             // --- FIM DA LÓGICA DE CHUNKING ---


            // ---- Salvar no Banco ----
            await db.query(
                `UPDATE mentions SET gemini_analysis = $1, extracted_value = $2 WHERE id = $3`,
                [JSON.stringify(finalAnalysisData), finalCalculatedTotal, mention.id]
            );

            if(success){ /* ... log de sucesso ... */ 
                 console.log(`  -> Sucesso final (fonte: ${sourceUsed}${finalAnalysisData.chunked ? ', chunked' : ''})! Total calculado: R$ ${finalCalculatedTotal.toFixed(2)}`);
                 successCount++;
            } else { /* ... log de falha ... */ 
                  console.error(`  -> Falha final no processamento da menção ID ${mention.id} (ver logs de chunk/erro acima).`);
                  failureCount++;
            }

        } catch (error) { /* ... tratamento de erro inesperado ... */ 
            console.error(`❌ ERRO INESPERADO no loop principal da menção ID ${mention.id}:`, error.message);
             await db.query(/*...*/); // Salva erro genérico
             failureCount++;
        }

        await delay(DELAY_BETWEEN_MENTIONS);
    } // Fim do loop FOR principal

    console.log(`\n🎉 Processo de enriquecimento finalizado!`);
    console.log(`   - Menções Processadas com Sucesso: ${successCount}`);
    console.log(`   - Menções com Falha: ${failureCount}`);
    console.log(`   - Menções que Precisaram de Chunking: ${chunkedCount}`);

    // Libera a memória do tokenizer explicitamente
    tokenizer.free();
}

enrichData().catch(console.error);