import api from './api'; 
import type { HealthResponse, DadosRegiao, MapData, AppStats } from '../types/apiTypes';

interface MapFilters {
  estado?: string;
  tipoCancer?: string;
  ano?: number;
}

export const mapService = {
  // 1. Health Check
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>('/api/health');
    return response.data;
  },

  // 2. Buscar dados do mapa (pontos de geolocalização)
  getMapData: async (filtros?: MapFilters): Promise<MapData[]> => {
    const response = await api.get<MapData[]>('/api/v1/map', { params: filtros });
    return response.data;
  },

  // 3. Estatísticas gerais
  getStats: async (): Promise<AppStats> => {
    const response = await api.get<AppStats>('/api/stats');
    return response.data;
  },

  // --- NOVA FUNÇÃO QUE ESTAVA FALTANDO ---
  getDadosRegiao: async (codRegiao: string): Promise<DadosRegiao> => {
    // Ex: transforma "Sudeste" em "sudeste" para a URL
    const regiaoSlug = codRegiao.toLowerCase().trim();
    const response = await api.get<DadosRegiao>(`/api/v1/map/regiao/${regiaoSlug}`);
    return response.data;
  }
};