// backend/src/scripts/update_txt_urls.js

const axios = require('axios');
const db = require('../config/database'); // Ajuste o caminho se necessário
require('dotenv').config();

// Função de atraso
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Formata um objeto Date para 'AAAA-MM-DD'.
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Script para buscar e atualizar os txt_urls das menções existentes.
 */
async function updateTxtUrls() {
    console.log('✅ Iniciando busca por txt_urls ausentes...');

    // 1. Busca todas as menções que AINDA NÃO têm um txt_url
    const mentionsToUpdate = await db.query(
        `SELECT id, municipality_ibge_code, publication_date, source_url 
         FROM mentions 
         WHERE txt_url IS NULL`
    );

    if (mentionsToUpdate.rows.length === 0) {
        console.log('🎉 Nenhuma menção precisa de atualização de txt_url.');
        return;
    }

    console.log(`ℹ️  Encontradas ${mentionsToUpdate.rows.length} menções para atualizar.`);

    // 2. Processa uma por uma
    for (const [index, mention] of mentionsToUpdate.rows.entries()) {
        console.log(`\n[${index + 1}/${mentionsToUpdate.rows.length}] Processando menção ID: ${mention.id}...`);

        try {
            // Formata a data para a busca na API (busca apenas naquele dia específico)
            const searchDate = formatDate(new Date(mention.publication_date));
            const searchUrl = `https://queridodiario.ok.org.br/api/gazettes?territory_ids=${mention.municipality_ibge_code}&published_since=${searchDate}&published_until=${searchDate}&size=50`; // Size alto para garantir pegar todos do dia

            console.log(`  -> Buscando diários de ${searchDate} para ${mention.municipality_ibge_code}...`);
            const response = await axios.get(searchUrl);
            const gazettes = response.data.gazettes;

            let foundTxtUrl = null;

            // 3. Encontra o diário correspondente na resposta da API
            if (gazettes && gazettes.length > 0) {
                const matchingGazette = gazettes.find(g => g.url === mention.source_url);

                if (matchingGazette) {
                    foundTxtUrl = matchingGazette.txt_url; // Pode ser null ou a URL
                } else {
                    console.warn(`  -> Aviso: Diário com URL ${mention.source_url} não encontrado na resposta da API para ${searchDate}.`);
                }
            } else {
                 console.warn(`  -> Aviso: Nenhum diário encontrado na API para ${mention.municipality_ibge_code} em ${searchDate}.`);
            }

            // 4. Atualiza o banco de dados
            // Atualizamos mesmo se foundTxtUrl for null, para marcar como "verificado".
            // Se for null, ficará null. Se tiver a URL, ela será salva.
            await db.query(
                `UPDATE mentions SET txt_url = $1 WHERE id = $2`,
                [foundTxtUrl, mention.id]
            );

            if (foundTxtUrl) {
                console.log(`  -> Sucesso! txt_url encontrado e salvo.`);
            } else {
                console.log(`  -> Concluído. Nenhum txt_url foi fornecido pela API para este diário.`);
            }

            // 5. Atraso
            await delay(500);

        } catch (error) {
            console.error(`❌ ERRO ao processar a menção ID ${mention.id}:`, error.message);
            // Mesmo com erro, esperamos antes de tentar o próximo
            await delay(1000);
        }
    }

    console.log('🎉 Processo de atualização de txt_urls finalizado!');
}

updateTxtUrls().catch(console.error);