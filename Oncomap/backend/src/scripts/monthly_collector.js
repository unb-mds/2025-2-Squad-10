// Oncomap/backend/src/scripts/monthly_collector.js

const axios = require('axios');
const db = require('../config/database'); // Garanta que o caminho está correto
require('dotenv').config();

// --- CONFIGURAÇÕES ---
const QD_API_URL = "https://queridodiario.ok.org.br/api/gazettes";
// Palavras-chave que o QD usará para filtrar os diários
const KEYWORDS_QUERYSTRING = 'quimioterapia,radioterapia,oncologia,oncológico,"tratamento de câncer"';
// Quantos dias para trás o script deve verificar
const LOOKBACK_DAYS = 30; 

// Função de atraso
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retorna a data de X dias atrás no formato AAAA-MM-DD
 * @param {number} days - O número de dias para olhar para trás.
 */
function getStartDate(days) {
    const data = new Date();
    data.setDate(data.getDate() - days);
    return data.toISOString().split('T')[0];
}

/**
 * Função principal do coletor mensal.
 */
async function runMonthlyCollector() {
    console.log('✅ Iniciando o coletor MENSAL...');
    const since = getStartDate(LOOKBACK_DAYS);

    try {
        console.log(`🔎 Buscando diários desde ${since} com as palavras-chave: "${KEYWORDS_QUERYSTRING}"`);

        // 1. Busca dados no Querido Diário
        // Não filtramos por município, buscamos em todos.
        // O 'size' é alto para tentar pegar tudo de uma vez.
        // Para um sistema mais robusto, seria necessário implementar paginação (offset).
        const response = await axios.get(QD_API_URL, {
            params: {
                querystring: KEYWORDS_QUERYSTRING,
                published_since: since,
                size: 500 // Aumente se 30 dias de diários do Brasil todo for mais que isso
            }
        });

        const gazettes = response.data.gazettes;

        if (!gazettes || gazettes.length === 0) {
            console.log('🎉 Nenhum diário novo com as palavras-chave encontrado no período.');
            return;
        }

        console.log(`ℹ️  Encontrados ${gazettes.length} diários relevantes para inserção.`);

        let insertedCount = 0;
        let skippedCount = 0;

        // 2. Itera e insere no banco
        // Usamos o padrão "um por um" dos seus outros scripts para consistência
        for (const gazette of gazettes) {
            
            // Este INSERT é crucial. Ele já salva o 'txt_url' e o 'source_url'.
            // Isso elimina a necessidade de rodar 'fill_missing_txt_urls.js' no fluxo mensal.
            const insertQuery = `
                INSERT INTO mentions (
                    municipality_ibge_code, municipality_name, state_uf,
                    publication_date, edition, is_extra_edition, 
                    excerpt, source_url, txt_url
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (source_url) DO NOTHING;
            `;
            
            const values = [
                gazette.territory_id,
                gazette.territory_name,
                gazette.state_code,
                gazette.date,
                gazette.edition,
                gazette.is_extra_edition || false,
                gazette.excerpts.join('\n\n---\n\n'), // Salva os excerpts da API
                gazette.url,                            // source_url (PDF)
                gazette.txt_url                         // txt_url (Texto)
            ];

            try {
                const result = await db.query(insertQuery, values);
                if (result.rowCount > 0) {
                    insertedCount++;
                    console.log(`  -> Inserido: Diário de ${gazette.territory_name} (ID: ${gazette.url})`);
                } else {
                    skippedCount++;
                }
            } catch (dbError) {
                console.error(`  -> ❌ Erro ao inserir diário ${gazette.url}:`, dbError.message);
            }
            
            // Pequena pausa para não sobrecarregar o banco
            await delay(50); 
        }

        console.log('\n🎉 Coleta mensal finalizada!');
        console.log(`  -> ${insertedCount} novos diários inseridos.`);
        console.log(`  -> ${skippedCount} diários já existentes (pulados).`);

    } catch (error) {
        console.error("💥 Erro fatal no coletor mensal:", error.message);
    }
}

runMonthlyCollector().catch(console.error);