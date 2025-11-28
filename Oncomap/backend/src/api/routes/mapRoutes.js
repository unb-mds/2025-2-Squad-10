// backend/src/api/routes/mapRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../../config/database'); 

// Mapeamento de quais estados pertencem a qual região (para o filtro SQL)
const regionMap = {
    'sudeste': ['SP', 'RJ', 'MG', 'ES'],
    'sul': ['PR', 'SC', 'RS'],
    'nordeste': ['BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA'],
    'norte': ['AM', 'RR', 'AP', 'PA', 'TO', 'RO', 'AC'],
    'centro-oeste': ['MT', 'MS', 'GO', 'DF']
};

// Mapeamento auxiliar: UF -> Código IBGE (2 dígitos)
// Necessário para o Frontend encontrar o estado quando clicar no mapa
const ufToCode = {
    'RO': '11', 'AC': '12', 'AM': '13', 'RR': '14', 'PA': '15', 'AP': '16', 'TO': '17',
    'MA': '21', 'PI': '22', 'CE': '23', 'RN': '24', 'PB': '25', 'PE': '26', 'AL': '27',
    'SE': '28', 'BA': '29', 'MG': '31', 'ES': '32', 'RJ': '33', 'SP': '35', 'PR': '41',
    'SC': '42', 'RS': '43', 'MS': '50', 'MT': '51', 'GO': '52', 'DF': '53'
};

// Mapeamento auxiliar: Código IBGE -> Nome Completo do Estado
const codeToName = {
    '11': 'Rondônia', '12': 'Acre', '13': 'Amazonas', '14': 'Roraima', '15': 'Pará', '16': 'Amapá', '17': 'Tocantins',
    '21': 'Maranhão', '22': 'Piauí', '23': 'Ceará', '24': 'Rio Grande do Norte', '25': 'Paraíba', '26': 'Pernambuco', '27': 'Alagoas',
    '28': 'Sergipe', '29': 'Bahia', '31': 'Minas Gerais', '32': 'Espírito Santo', '33': 'Rio de Janeiro', '35': 'São Paulo', '41': 'Paraná',
    '42': 'Santa Catarina', '43': 'Rio Grande do Sul', '50': 'Mato Grosso do Sul', '51': 'Mato Grosso', '52': 'Goiás', '53': 'Distrito Federal'
};

router.get('/regiao/:regiaoSlug', async (req, res) => {
    const { regiaoSlug } = req.params;
    const chaveRegiao = regiaoSlug.toLowerCase().trim();
    const estadosDaRegiao = regionMap[chaveRegiao];

    console.log(`[Backend] Consultando Banco de Dados para região: ${chaveRegiao}`);

    if (!estadosDaRegiao) {
        return res.status(400).json({ error: "Região inválida ou desconhecida." });
    }

    try {
        // 1. Busca todos os municípios da região que tenham valores > 0
        const query = `
            SELECT 
                municipality_name as nome,
                municipality_ibge_code as codarea,
                state_uf as uf,
                SUM(COALESCE(extracted_value, 0) + COALESCE(extracted_value_txt, 0)) as total_investido
            FROM mentions
            WHERE state_uf = ANY($1) 
            GROUP BY municipality_name, municipality_ibge_code, state_uf
            HAVING SUM(COALESCE(extracted_value, 0) + COALESCE(extracted_value_txt, 0)) > 0
            ORDER BY state_uf, total_investido DESC
        `;

        const result = await db.query(query, [estadosDaRegiao]);
        const linhas = result.rows;

        // 2. AGRUPAMENTO (A Mágica acontece aqui)
        // Transformamos a lista plana de cidades em uma lista hierárquica de Estados -> Cidades
        const estadosAgrupados = {};

        // Inicializa os estados da região (para aparecerem no menu mesmo se não tiverem dados)
        estadosDaRegiao.forEach(uf => {
            const codigo = ufToCode[uf];
            estadosAgrupados[codigo] = {
                codarea: codigo,
                nome: codeToName[codigo] || uf,
                investimentos: [] // Aqui entrarão as cidades
            };
        });

        let totalGeralRegiao = 0;

        // Preenche com os dados do banco
        linhas.forEach(row => {
            const codEstado = ufToCode[row.uf];
            const valorNumerico = parseFloat(row.total_investido);
            totalGeralRegiao += valorNumerico;

            if (estadosAgrupados[codEstado]) {
                // Adiciona a cidade dentro da lista de "investimentos" do estado
                // O Frontend chama a lista de cidades de 'investimentos'
                estadosAgrupados[codEstado].investimentos.push({
                    nome: row.nome,
                    valor: valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                });
            }
        });

        // Transforma o objeto em array
        const arrayEstados = Object.values(estadosAgrupados);

        const resposta = {
            regiao: chaveRegiao.toUpperCase(),
            investimentosGerais: [
                { 
                    nome: "Total Detectado na Região", 
                    valor: totalGeralRegiao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                }
            ],
            // Agora 'municipios' contém a lista de ESTADOS, cada um com suas cidades dentro
            municipios: arrayEstados 
        };

        res.json(resposta);

    } catch (error) {
        console.error('[Erro SQL]', error);
        res.json({ 
            regiao: chaveRegiao.toUpperCase(), 
            investimentosGerais: [{ nome: "Erro ao buscar dados", valor: "R$ 0,00" }], 
            municipios: [] 
        });
    }
});

module.exports = router;