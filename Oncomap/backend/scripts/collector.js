// backend/src/collector.js

const axios = require('axios');
const db = require('../src/config/database');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function collectData() {
    console.log('✅ Iniciando o coletor de dados resiliente...');

    // --- MUDANÇA PRINCIPAL AQUI ---
    // Definimos a data de início da busca como uma string fixa.
    const sinceDate = '2022-01-01';
    // --- FIM DA MUDANÇA ---

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
            const updateStatusQuery = `
                UPDATE municipalities_status 
                SET last_processed_at = NOW() 
                WHERE ibge_code = $1;
            `;
            await db.query(updateStatusQuery, [city.ibge_code]);

            // --- A LÓGICA DE COLETA ORIGINAL COMEÇA AQUI ---
            const querystring = 'saude,quimioterapia,radioterapia,oncologia,oncológico';
            const searchUrl = `https://queridodiario.ok.org.br/api/gazettes?territory_ids=${city.ibge_code}&published_since=${sinceDate}&querystring=${querystring}&size=200`;

            console.log(`🔎 Processando: ${city.name} - ${city.state_uf}...`);
            const response = await axios.get(searchUrl);
            const gazettes = response.data.gazettes;

            if (gazettes && gazettes.length > 0) {
                console.log(`  -> ${gazettes.length} diários encontrados.`);
                for (const gazette of gazettes) {
                    const fullExcerpt = gazette.excerpts.join('\n\n---\n\n');
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
                        fullExcerpt, gazette.url
                    ]);
                }
            }
            // --- FIM DA LÓGICA ORIGINAL ---

            await delay(500);

        } catch (error) {
            const cityName = city ? city.name : 'cidade desconhecida';
            console.error(`❌ Erro ao processar a cidade ${cityName}:`, error.message);
            await delay(2000);
        }
    }
}

collectData().catch(error => {
    console.error("💥 Falha fatal no processo do coletor:", error);
});