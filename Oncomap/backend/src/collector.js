// backend/src/collector.js

// 2.1: Importações e Configurações Iniciais
const axios = require('axios');
const db = require('./config/database.js');

// Lista de municípios que queremos monitorar. 
// Para começar, vamos focar em alguns para testar.
const MUNICIPALITIES_TO_MONITOR = [
    { ibgeCode: '3304557', name: 'Rio de Janeiro', uf: 'RJ' },
    { ibgeCode: '3550308', name: 'São Paulo', uf: 'SP' },
    { ibgeCode: '2927408', name: 'Salvador', uf: 'BA' }
];

// Função de atraso para sermos "educados" com a API do Querido Diário
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// 2.2: A Função Principal de Coleta
async function collectData() {
    console.log('✅ Iniciando o processo de coleta de dados...');

    // O loop 'for...of' garante que processaremos uma cidade de cada vez, sequencialmente.
    for (const city of MUNICIPALITIES_TO_MONITOR) {
        try {
            const querystring = 'quimioterapia,radioterapia,oncologia,oncológico';
            const searchUrl = `https://queridodiario.ok.org.br/api/gazettes?territory_ids=${city.ibgeCode}&published_since=2024-01-01&querystring=${querystring}&size=100`;

            console.log(`🔎 Buscando diários para: ${city.name}...`);
            const response = await axios.get(searchUrl);
            const gazettes = response.data.gazettes;

            if (gazettes && gazettes.length > 0) {
                console.log(`  -> ${gazettes.length} diários encontrados. Processando...`);

                // Loop interno para processar cada diário encontrado para a cidade
                for (const gazette of gazettes) {
                    const fullExcerpt = gazette.excerpts.join('\n\n---\n\n'); // Junta os trechos em um só texto

                    // A query SQL para inserir os dados na nossa tabela 'mentions'
                    const insertQuery = `
                        INSERT INTO mentions (
                            municipality_ibge_code, municipality_name, state_uf,
                            publication_date, edition, is_extra_edition, 
                            excerpt, source_url
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT (source_url) DO NOTHING;
                    `;
                    // 'ON CONFLICT (source_url) DO NOTHING' é crucial: se já inserimos um diário
                    // com essa URL, ele simplesmente ignora, evitando duplicatas.

                    // Os valores a serem inseridos, na ordem correta dos '$'
                    const values = [
                        gazette.territory_id,
                        gazette.territory_name,
                        gazette.state_code,
                        gazette.date,
                        gazette.edition,
                        gazette.is_extra_edition || false, // Garante um valor booleano
                        fullExcerpt,
                        gazette.url
                    ];

                    await db.query(insertQuery, values);
                }
                console.log(`  -> Finalizado o processamento para ${city.name}.`);
            } else {
                console.log(`  -> Nenhum diário encontrado para ${city.name} no período.`);
            }

            // Pausa de meio segundo entre as requisições para cidades diferentes
            await delay(500);

        } catch (error) {
            console.error(`❌ Erro ao processar a cidade ${city.name}:`, error.message);
            await delay(2000); // Se der erro, espera um pouco mais antes de continuar
        }
    }

    console.log('🎉 Processo de coleta de dados finalizado com sucesso!');
}

// 2.3: Executando a Função
collectData().catch(error => {
    console.error("💥 Falha fatal no processo do coletor:", error);
});