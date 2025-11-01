// Oncomap/backend/src/scripts/enrichment.js
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');
const axios = require('axios');
const pdfParse = require('pdf-parse'); // <- NOVA DEPENDÊNCIA
require('dotenv').config();

// --- Configurações ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Usando o 'flash' que sabemos que funciona e tem a janela de 1M de tokens
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); 

// --- Constantes ---
const MAX_RETRIES = 3;
// Pausa de 4 segundos entre requisições (15 RPM) - seguro para o nível gratuito
const DELAY_BETWEEN_REQUESTS = 4000; 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Prompt (O novo prompt granular do seu script de teste) ---
function getGeminiPrompt(textContent) {
  return `
      **Tarefa:** VOCÊ É UM ANALISTA FINANCEIRO ESPECIALIZADO EM ORÇAMENTO PÚBLICO DE SAÚDE ONCOLÓGICA. Analise CUIDADOSAMENTE o seguinte texto extraído de um Diário Oficial Municipal brasileiro. Seu objetivo é:
      1. Identificar, extrair e somar TODOS os valores monetários (em Reais) que representem gastos ou investimentos DIRETAMENTE relacionados à área de ONCOLOGIA.
      2. Categorizar esses valores somados conforme as regras abaixo.
      3. Extrair informações contextuais RELEVANTES sobre esses gastos oncológicos, se claramente presentes.

      **Formatos de Valor a Procurar (Exemplos):** R$ 1.234,56, Valor: 1.234,56, custo total de 1.234,56, etc.

      **Formato OBRIGATÓRIO da Resposta:**
      Sua resposta deve ser **EXCLUSIVAMENTE um objeto JSON válido**, sem nenhum texto antes ou depois, e sem usar markdown (como \`\`\`json). A estrutura base é MANDATÓRIA, mas campos adicionais podem ser incluídos se relevantes.

      {
        "total_gasto_oncologico": 0.00,  // MANDATÓRIO (Soma calculada por você)
        "medicamentos": 0.00,         // MANDATÓRIO
        "equipamentos": 0.00,         // MANDATÓRIO
        "estadia_paciente": 0.00,       // MANDATÓRIO
        "obras_infraestrutura": 0.00,  // MANDATÓRIO
        "servicos_saude": 0.00,         // MANDATÓRIO
        "outros_relacionados": 0.00,    // MANDATÓRIO
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
      1.  **Foco Estrito em Oncologia:** Considere APENAS valores ligados a oncologia, câncer, quimioterapia, radioterapia, etc.
      2.  **Extração e Conversão Numérica:** Encontre TODOS os valores. Converta para float (ponto decimal).
      3.  **Categorização:** Siga as definições:
          * "medicamentos": Compra/fornecimento de quimioterápicos, imunoterápicos.
          * "equipamentos": Aquisição, aluguel, manutenção de equipamentos oncológicos.
          * "estadia_paciente": Custo de internação, diária de leito oncológico.
          * "obras_infraestrutura": Construção, reforma de instalações oncológicas.
          * "servicos_saude": Contratação de serviços/exames oncológicos (radioterapia, quimioterapia).
          * "outros_relacionados": Gastos oncológicos que não se encaixam acima.
      4.  **Soma Total:** Deve ser a soma exata das outras categorias. VERIFIQUE A SOMA.
      5.  **Detalhes Extraídos:** Adicione um objeto ao array para CADA valor encontrado. Se nenhum valor for encontrado, retorne um array vazio [].
      6.  **Nenhum Valor Encontrado:** JSON com valores numéricos zerados e array "detalhes_extraidos" vazio [].
      7.  **JSON Puro:** Apenas o JSON.

      **Texto para Análise:**
      """
      ${textContent}
      """
  `;
}

/**
 * Função para extrair o JSON da resposta (vinda do script de teste)
 */
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
       try {
           JSON.parse(potentialJson);
           return potentialJson; // Retorna somente se for JSON válido
       } catch (e) {}
    }
    return null; 
}


/**
 * Processa o texto COMPLETO de um PDF com a API do Gemini.
 * (Adaptado do script de teste)
*/
async function processPdfWithGemini(textContent, mentionId) {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        console.log(`    -> Enviando texto (${(textContent.length / 1024).toFixed(1)} KB) para Gemini (Tentativa ${attempt + 1})...`);
        const prompt = getGeminiPrompt(textContent);
        const generationConfig = { responseMimeType: "application/json" };

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig
        });
        
         // A resposta já é um JSON, mas precisamos extrair o texto
        const rawResponseText = result.response.text(); 
        console.log(`    -> Resposta bruta recebida.`);
        
        // A API com responseMimeType: "application/json" já retorna o JSON como texto
        const jsonString = extractJsonFromString(rawResponseText);

        if (jsonString) {
          try {
            const analysis = JSON.parse(jsonString);
            if (typeof analysis.total_gasto_oncologico === 'number' && Array.isArray(analysis.detalhes_extraidos)) {
                 console.log(`    -> JSON válido extraído e validado.`);
                 return analysis; // Retorna o objeto JSON completo
            } else {
                 console.warn(`    -> Aviso: JSON extraído não possui a estrutura esperada.`);
                 return null;
            }
          } catch (parseError) {
            console.error(`    -> ❌ Erro ao analisar JSON (ID ${mentionId}): ${parseError.message}. Resposta bruta: ${rawResponseText}`);
            return null;
          }
        } else {
          console.error(`    -> ❌ Não foi possível extrair JSON da resposta (ID ${mentionId}). Resposta bruta: ${rawResponseText}`);
          return null;
        }

      } catch (error) {
        // Lógica de Rate Limit (vinda do script de teste)
        let isRateLimitError = false;
        if (error.status === 429 || (error.message && error.message.includes('429'))) isRateLimitError = true;
        if (error.message && (error.message.toLowerCase().includes('resource_exhausted'))) isRateLimitError = true;

        if (isRateLimitError) {
          attempt++;
          const waitTimeSeconds = Math.pow(2, attempt) * 5 + Math.random(); 
          console.warn(`    -> 🚦 Rate limit (Tentativa ${attempt}/${MAX_RETRIES}). Esperando ${waitTimeSeconds.toFixed(1)}s...`);
          await delay(waitTimeSeconds * 1000);
        } else {
          console.error(`    -> ❌ ERRO FATAL no processamento LLM (ID ${mentionId}):`, error.message);
          return null; // Falha irrecuperável
        }
      }
    } // Fim do while
    console.error(`    -> ❌ Excedido número máximo de retries (${MAX_RETRIES}) para Rate Limit (ID ${mentionId}).`);
    return null; // Falha após retries
}

/**
 * Função Principal de Enriquecimento (v7 - Lógica de Teste Migrada + Divisão de Carga)
 */
async function enrichData() {

    // --- LÓGICA DE DIVISÃO DE CARGA (MODULO) ---
    // Pega os argumentos da linha de comando: node enrichment.js [workerId] [totalWorkers]
    // Ex: node enrichment.js 0 3  (Worker 0 de 3)
    const workerId = parseInt(process.argv[2] || 0);
    const totalWorkers = parseInt(process.argv[3] || 1);

    if (totalWorkers < 1) totalWorkers = 1;
    if (workerId < 0 || workerId >= totalWorkers) {
        console.error(`ID de worker inválido (${workerId}). Deve estar entre 0 e ${totalWorkers - 1}.`);
        return;
    }

    console.log(`✅ Iniciando script de ENRIQUECIMENTO (v7)`);
    console.log(`--- Worker ${workerId} de ${totalWorkers} ---`);
    console.log(`--- Processando menções onde id % ${totalWorkers} = ${workerId} ---`);

    // --- Query SQL ATUALIZADA com a lógica de Módulo ---
    // A query agora só processa menções que:
    // 1. Não foram analisadas (gemini_analysis IS NULL)
    // 2. Têm um link de PDF (source_url IS NOT NULL)
    // 3. Pertencem a este worker (id % totalWorkers = workerId)
    const mentionsToProcess = await db.query(
        `SELECT id, municipality_name, source_url
         FROM mentions
         WHERE gemini_analysis IS NULL
           AND source_url IS NOT NULL
           AND id % $1 = $2`,
        [totalWorkers, workerId] // Passa os parâmetros para a query
    );

    if (mentionsToProcess.rows.length === 0) {
        console.log('🎉 Nenhuma menção nova para este worker processar.');
        return;
    }

    console.log(`ℹ️  Encontradas ${mentionsToProcess.rows.length} menções para este worker.`);

    let successCount = 0;
    let failureCount = 0;

    for (const [index, mention] of mentionsToProcess.rows.entries()) {
        console.log(`\n--- [${index + 1}/${mentionsToProcess.rows.length}] Processando Menção ID: ${mention.id} (${mention.municipality_name}) ---`);
        let pdfText = '';
        let finalJsonResult = {};
        let analysisResult = null;
        let success = false;

        // 1. Baixar e Parsear o PDF (Lógica do Teste)
        try {
          console.log(`  -> Baixando PDF de: ${mention.source_url}`);
          const response = await axios.get(mention.source_url, { responseType: 'arraybuffer' });
          const pdfBuffer = response.data;
          console.log(`  -> PDF baixado. Extraindo texto...`);
          const data = await pdfParse(pdfBuffer);
          pdfText = data.text;
          console.log(`  -> Texto extraído (${pdfText.length} caracteres).`);
        } catch (error) {
          console.error(`❌ Erro ao baixar ou parsear PDF para menção ID ${mention.id}:`, error.message);
          finalJsonResult = { error: `Erro download/parse PDF: ${error.message}` };
          pdfText = null; 
        }

        // 2. Processamento com LLM (Só executa se pdfText for válido)
        if (pdfText && pdfText.trim() !== '') {
            analysisResult = await processPdfWithGemini(pdfText, mention.id);
            if (analysisResult && typeof analysisResult.total_gasto_oncologico === 'number') {
                finalJsonResult = analysisResult;
                success = true;
            } else {
                 finalJsonResult = { error: "Falha no processamento da LLM ou resultado inválido.", raw_response: analysisResult };
            }
        } else if (!finalJsonResult.error) {
           console.warn(`  -> Aviso: Texto extraído do PDF está vazio. Pulando análise LLM.`);
           finalJsonResult = { error: "Texto extraído do PDF estava vazio." };
        }
        
        // 3. Salvar no Banco (Seja sucesso ou erro)
        const totalValue = finalJsonResult.total_gasto_oncologico || 0.00;
        await db.query(
            `UPDATE mentions SET gemini_analysis = $1, extracted_value = $2 WHERE id = $3`,
            [JSON.stringify(finalJsonResult), totalValue, mention.id]
        );

        if (success) {
            console.log(`  -> SUCESSO! Total: R$ ${totalValue.toFixed(2)}. Salvo no banco.`);
            successCount++;
        } else {
            console.error(`  -> FALHA no processamento da menção ID ${mention.id}. Erro: ${finalJsonResult.error}. Salvo no banco.`);
            failureCount++;
        }

        await delay(DELAY_BETWEEN_REQUESTS); // Pausa entre menções
    } // Fim do loop FOR

    console.log(`\n🎉 Enriquecimento finalizado para o Worker ${workerId}!`);
    console.log('--- Resumo deste Worker ---');
    console.log(`   - Sucessos: ${successCount}`);
    console.log(`   - Falhas: ${failureCount}`);
}

enrichData().catch(console.error); // Chama a função principal