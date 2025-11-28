export interface HealthResponse {
  message: string;
}

// --- NOVOS TIPOS ADICIONADOS PARA A TABELA INFO ---

export interface Investimento {
  nome: string;
  valor: string;
}

export interface MunicipioComInvestimentos {
  codarea: string;
  nome: string;
  investimentos: Investimento[];
}

export interface DadosRegiao {
  regiao: string;
  investimentosGerais: Investimento[];
  municipios: MunicipioComInvestimentos[];
}

// Se o seu mapService antigo usava esses, mantenha-os:
export interface MapData {
  id: string | number;
  latitude: number;
  longitude: number;
  nome?: string;
  [key: string]: any;
}

export interface AppStats {
  totalCases: number;
  lastUpdate: string;
}