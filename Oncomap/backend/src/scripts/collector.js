// Oncomap/backend/src/scripts/collector.js

const axios = require('axios');
// O caminho correto para o config, subindo um nível de 'scripts' para 'src'
const db = require('../config/database');

/**
 * Cria uma pausa (delay) no código.
 * @param {number} ms - O tempo em milissegundos para a pausa.
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Função principal para coletar dados da API do Querido Diário.
 */
async function collectData() {
    console.log('✅ Iniciando o coletor de dados resiliente...');

    // A data de início da busca
    const sinceDate = '2022-01-01';
    console.log(`ℹ️  Período de busca: de ${sinceDate} até hoje.`);

    while (true) {
        let city = null;

        try {
            // 1. Busca a próxima cidade que AINDA NÃO foi processada
            const nextCityQuery = `
                SELECT ibge_code, name, state_uf 
                FROM municipalities_status 
                WHERE last_processed_at IS NULL 
                LIMIT 1;
            `;
            const result = await db.query(nextCityQuery);

            // 2. Verifica se o trabalho acabou
            if (result.rows.length === 0) {
                console.log('🎉 Todas os municípios foram processados. Encerrando o coletor.');
                break; // Sai do loop 'while (true)'
            }
            
            city = result.rows[0];

            // 3. Imediatamente marca a cidade como "em processamento"
            // Isso evita que, se o script for reiniciado, ele tente processar esta cidade novamente.
            const updateStatusQuery = `
                UPDATE municipalities_status 
                SET last_processed_at = NOW() 
                WHERE ibge_code = $1;
            `;
            await db.query(updateStatusQuery, [city.ibge_code]);

            // 1. PALAVRAS-CHAVE
            const querystring = 'quimioterapia,radioterapia,oncologia,oncológico,"tratamento de câncer"';
            
            // Criamos um array com as palavras-chave para a busca manual no texto
            // Removemos aspas (para "tratamento de câncer") e quebramos pela vírgula
            const keywords = querystring.replace(/"/g, '').split(',');

            // 2. BUSCA NA API
            const searchUrl = `https://queridodiario.ok.org.br/api/gazettes?territory_ids=${city.ibge_code}&published_since=${sinceDate}&querystring=${querystring}&size=200`;

            console.log(`🔎 Processando: ${city.name} - ${city.state_uf}...`);
            const response = await axios.get(searchUrl);
            const gazettes = response.data.gazettes;

            if (gazettes && gazettes.length > 0) {
                console.log(`  -> ${gazettes.length} diários encontrados. Analisando o texto completo...`);

                // 3. LÓGICA DE ANÁLISE DE PÁGINA
                for (const gazette of gazettes) {
                    let contentToInsert = null; // O que vamos salvar no banco
                    
                    // 3.1. Verificamos se a API nos deu a URL do texto completo
                    if (gazette.source_text_url) {
                        try {
                            // 3.2. Baixamos o arquivo .txt completo
                            console.log(`    -> Baixando texto completo de: ${gazette.source_text_url}`);
                            const textResponse = await axios.get(gazette.source_text_url);
                            const fullText = textResponse.data;

                            // 3.3. Dividimos o texto em páginas.
                            const pages = fullText.split('\f');
                            
                            let allContexts = []; // Armazena os contextos encontrados neste diário

                            // 3.4. Iteramos pelas páginas para encontrar as palavras-chave
                            for (let i = 0; i < pages.length; i++) {
                                const pageContent = pages[i];
                                if (!pageContent) continue; // Pula páginas em branco

                                const pageContentLower = pageContent.toLowerCase();

                                // Verificamos se alguma de nossas palavras-chave está na página
                                const foundKeyword = keywords.find(key => pageContentLower.includes(key));

                                if (foundKeyword) {
                                    console.log(`    -> Palavra-chave "${foundKeyword}" encontrada na página ${i + 1} (de ${pages.length})`);

                                    // 3.5. Encontramos! Agora pegamos o contexto.
                                    const previousPageContent = (i > 0) ? pages[i - 1] : "Nenhuma (Esta é a primeira página)";
                                    
                                    // 3.6. Formatamos o bloco de contexto
                                    const contextBlock = `--- [CONTEXTO DA MENÇÃO (Palavra-chave: "${foundKeyword}")] ---\n\n--- PÁGINA ANTERIOR (Aprox. Pág. ${i}) ---\n${previousPageContent}\n\n--- PÁGINA DA MENÇÃO (Aprox. Pág. ${i + 1}) ---\n${pageContent}`;
                                    allContexts.push(contextBlock);
                                }
                            }

                            if (allContexts.length > 0) {
                                // Juntamos todos os contextos encontrados no mesmo diário
                                contentToInsert = allContexts.join('\n\n==================== [NOVA MENÇÃO NO MESMO DIÁRIO] ====================\n\n');
                            }

                        } catch (e) {
                            console.error(`    -> ❌ Erro ao baixar ou processar o texto completo (${gazette.source_text_url}): ${e.message}`);
                        }
                    }
                    
                    // 3.7. FALLBACK: Se não conseguimos o texto completo, usamos os excerpts originais
                    if (!contentToInsert) {
                        console.log(`    -> (Fallback) Não foi possível processar o texto completo ou nenhuma palavra-chave foi reencontrada. Usando excerpts originais.`);
                        contentToInsert = gazette.excerpts.join('\n\n---\n\n');
                    }

                    // 3.8. INSERÇÃO NO BANCO (com o novo conteúdo)
                    // Lembre-se que a coluna 'excerpt' DEVE ser do tipo TEXT no Supabase
                    const insertQuery = `
                        INSERT INTO mentions (
                            municipality_ibge_code, municipality_name, state_uf,
                            publication_date, edition, is_extra_edition, 
                            excerpt, source_url
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT (source_url) DO NOTHING;
                    `;
                    await db.query(insertQuery, [
                        gazette.territory_id, gazette.territory_name, gazette.state_code,
                        gazette.date, gazette.edition, gazette.is_extra_edition || false,
                        contentToInsert, // <-- USANDO O CONTEÚDO COMPLETO AQUI
                        gazette.url
                    ]);
                }
            }
            
            // Pausa para não sobrecarregar a API do Querido Diário
            await delay(500);

        } catch (error) {
            const cityName = city ? city.name : 'cidade desconhecida';
            console.error(`❌ Erro ao processar a cidade ${cityName}:`, error.message);
            
            // Se der erro (ex: falha de rede), espera um pouco mais e tenta a próxima cidade
            await delay(2000);
        }
    }
}

// Inicia a execução do coletor
collectData().catch(error => {
    console.error("💥 Falha fatal no processo do coletor:", error);
});