// src/data/dadosRegioes.ts
import type { DadosRegiao } from '../components/MapaPage/TabelaInfo';

// Um objeto que mapeia o nome da região para seus dados
export const dadosDasRegioes: Record<string, DadosRegiao> = {
  norte: {
    regiao: 'Norte',
    investimentos: [
      { nome: 'Medicamentos', valor: 'R$ 15.200.000,00' },
      { nome: 'Equipamentos', valor: 'R$ 8.750.000,00' },
    ],
    municipios: ['Manaus', 'Belém', 'Porto Velho', 'Macapá', 'Rio Branco'],
  },
  nordeste: {
    regiao: 'Nordeste',
    investimentos: [
      { nome: 'Medicamentos', valor: 'R$ 35.800.000,00' },
      { nome: 'Infraestrutura', valor: 'R$ 52.100.000,00' },
    ],
    municipios: ['Salvador', 'Recife', 'Fortaleza', 'São Luís', 'Maceió'],
  },
  // Adicione aqui os dados para 'sul', 'sudeste' e 'centroOeste'
  sul: { 
    regiao: 'Sul',
    investimentos: [
      { nome: 'Medicamentos', valor: 'R$ 35.800.000,00' },
      { nome: 'Infraestrutura', valor: 'R$ 52.100.000,00' },
    ],
    municipios: ['Salvador', 'Recife', 'Fortaleza', 'São Luís', 'Maceió'],
  },
  sudeste: { 
    regiao: 'Sudeste',
    investimentos: [
      { nome: 'Medicamentos', valor: 'R$ 35.800.000,00' },
      { nome: 'Infraestrutura', valor: 'R$ 52.100.000,00' },
    ],
    municipios: ['Salvador', 'Recife', 'Fortaleza', 'São Luís', 'Maceió'],
    },
  centroOeste: { 
    regiao: 'Sudeste',
    investimentos: [
      { nome: 'Medicamentos', valor: 'R$ 35.800.000,00' },
      { nome: 'Infraestrutura', valor: 'R$ 52.100.000,00' },
    ],
    municipios: ['Salvador', 'Recife', 'Fortaleza', 'São Luís', 'Maceió'],
   },
};