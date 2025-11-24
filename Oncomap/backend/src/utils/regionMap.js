// Mapeamento manual: Região -> Lista de Siglas de Estados
const REGION_TO_STATES = {
    'norte': ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
    'nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    'centro-oeste': ['DF', 'GO', 'MT', 'MS'],
    'sudeste': ['ES', 'MG', 'RJ', 'SP'],
    'sul': ['PR', 'RS', 'SC']
};

// Função auxiliar para pegar estados
const getStatesByRegion = (regionName) => {
    const key = regionName.toLowerCase().replace('-', '').replace(' ', '');
    // Normaliza chaves como 'centrooeste' ou 'centro-oeste'
    if (key === 'centrooeste') return REGION_TO_STATES['centro-oeste'];
    return REGION_TO_STATES[key] || [];
};

module.exports = { getStatesByRegion };