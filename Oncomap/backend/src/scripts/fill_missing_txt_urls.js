// backend/src/scripts/fill_missing_txt_urls.js

const axios = require('axios');
const db = require('../config/database'); // Ajuste o caminho se necessário
require('dotenv').config();

// Função de atraso
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Formata um objeto Date para 'AAAA-MM-DD'.
 */
function formatDate(date) {
    // Garante que estamos trabalhando com um objeto Date
    const d = new Date(date); 
    return d.toISOString().split('T')[0];
}

/**
 * Script para buscar e preencher APENAS os txt_urls que estão como NULL.
 */
async function fillMissingTxtUrls() {
    console.log('✅ Iniciando busca por txt_urls que estão como NULL...');

    // 1. Busca APENAS as menções com txt_url NULO
    // Selecionamos todos os dados necessários para a busca na API
    const mentionsToFill = await db.query(
        `SELECT id, municipality_ibge_code, publication_date, source_url 
         FROM mentions 
         WHERE txt_url IS NULL`
    );

    if (mentionsToFill.rows.length === 0) {
        console.log('🎉 Nenhuma menção com txt_url NULL encontrada. Tudo atualizado!');
        return;
    }

    console.log(`ℹ️  Encontradas ${mentionsToFill.rows.length} menções com txt_url NULL para verificar.`);

    // 2. Processa uma por uma
    for (const [index, mention] of mentionsToFill.rows.entries()) {
        // Verifica se os dados básicos existem para evitar erros
        if (!mention.municipality_ibge_code || !mention.publication_date || !mention.source_url) {
            console.warn(`\n[${index + 1}/${mentionsToFill.rows.length}] Pulando menção ID: ${mention.id} por dados incompletos (IBGE, data ou source_url ausente).`);
            continue; 
        }

        console.log(`\n[${index + 1}/${mentionsToFill.rows.length}] Verificando menção ID: ${mention.id}...`);

        try {
            // Formata a data para buscar na API apenas naquele dia específico
            const searchDate = formatDate(mention.publication_date);
            const searchUrl = `https://queridodiario.ok.org.br/api/gazettes?territory_ids=${mention.municipality_ibge_code}&published_since=${searchDate}&published_until=${searchDate}&size=50`;

            console.log(`  -> Buscando diários de ${searchDate} para ${mention.municipality_ibge_code}...`);
            const response = await axios.get(searchUrl);
            const gazettes = response.data.gazettes;

            let foundTxtUrl = null;

            // 3. Procura o diário correspondente pelo source_url (link do PDF)
            if (gazettes && gazettes.length > 0) {
                const matchingGazette = gazettes.find(g => g.url === mention.source_url);

                if (matchingGazette) {
                    foundTxtUrl = matchingGazette.txt_url; // Pega o txt_url (pode ser null)
                } else {
                    console.warn(`  -> Aviso: Diário com URL ${mention.source_url} não encontrado na API para ${searchDate}. txt_url permanecerá NULL.`);
                }
            } else {
                 console.warn(`  -> Aviso: Nenhum diário encontrado na API para ${mention.municipality_ibge_code} em ${searchDate}. txt_url permanecerá NULL.`);
            }

            // 4. ATUALIZA o banco de dados COM O RESULTADO (seja a URL ou NULL)
            // Isso garante que esta menção não será reprocessada por este script na próxima vez,
            // pois txt_url não será mais NULL (ele terá a URL ou continuará NULL, mas foi verificado).
            // ATENÇÃO: Se a API adicionar um .txt no futuro, este script não o pegará automaticamente depois.
            // Para isso, seria necessário rodar o script update_txt_urls.js completo periodicamente.
            await db.query(
                `UPDATE mentions SET txt_url = $1 WHERE id = $2 AND txt_url IS NULL`, // Condição extra para segurança
                [foundTxtUrl, mention.id]
            );

            if (foundTxtUrl) {
                console.log(`  -> Sucesso! txt_url encontrado e salvo.`);
            } else {
                console.log(`  -> Concluído. Nenhum txt_url fornecido pela API. O campo permanecerá NULL.`);
            }

            // 5. Atraso para não sobrecarregar a API
            await delay(500);

        } catch (error) {
            console.error(`❌ ERRO ao processar a menção ID ${mention.id}:`, error.message);
            await delay(1000); // Espera um pouco mais em caso de erro
        }
    }

    console.log('🎉 Processo de preenchimento de txt_urls NULL finalizado!');
}

fillMissingTxtUrls().catch(console.error);