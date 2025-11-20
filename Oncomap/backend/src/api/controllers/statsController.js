const db = require('../../config/database'); // Verifique se o caminho para sua config de DB está correto aqui

const getGeneralStats = async (req, res) => {
    try {
        // 1. Query para somar totais por ESTADO (UF)
        const statesQuery = `
            SELECT 
                state_uf,
                SUM(final_extracted_value) as total_value
            FROM mentions
            WHERE extracted_value IS NOT NULL
            GROUP BY state_uf
            ORDER BY total_value DESC;
        `;

        // 2. Query para somar totais por MUNICÍPIO
        const municipalitiesQuery = `
            SELECT 
                municipality_ibge_code,
                municipality_name,
                state_uf,
                SUM(final_extracted_value) as total_value
            FROM mentions
            WHERE extracted_value IS NOT NULL
            GROUP BY municipality_ibge_code, municipality_name, state_uf
            ORDER BY total_value DESC;
        `;

        // Executa as duas consultas em paralelo para ser mais rápido
        const [statesResult, municipalitiesResult] = await Promise.all([
            db.query(statesQuery),
            db.query(municipalitiesQuery)
        ]);

        // 3. Formatação dos dados para o Frontend
        
        // Transforma o array de estados em um objeto chave-valor para acesso rápido no mapa
        // Ex: { "SP": 50000.00, "RJ": 30000.00 }
        const statesData = {};
        statesResult.rows.forEach(row => {
            statesData[row.state_uf] = parseFloat(row.total_value);
        });

        // Formata a lista de municípios, garantindo que o valor seja numérico
        const municipalitiesData = municipalitiesResult.rows.map(row => ({
            ibge: row.municipality_ibge_code,
            name: row.municipality_name,
            uf: row.state_uf,
            total: parseFloat(row.total_value)
        }));

        // 4. Envia a resposta
        res.status(200).json({
            states: statesData,
            municipalities: municipalitiesData
        });

    } catch (error) {
        console.error("Erro ao buscar estatísticas gerais:", error);
        res.status(500).json({ error: "Erro interno ao processar estatísticas." });
    }
};

module.exports = {
    getGeneralStats
};