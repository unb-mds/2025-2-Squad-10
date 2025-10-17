// src/components/MapaPage/TabelaInfo.tsx

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../../style/Tabelainfo.css';

// --- INTERFACES (ATUALIZADAS) ---
export interface Investimento {
  nome: string;
  valor: string;
}
// 1. ATUALIZADO: Adicionado 'codarea'
export interface MunicipioComInvestimentos {
  codarea: string; 
  nome: string;
  investimentos: Investimento[];
}
// 2. ATUALIZADO: 'municipios' agora usa a nova interface
export interface DadosRegiao {
  regiao: string;
  investimentosGerais: Investimento[];
  municipios: MunicipioComInvestimentos[]; 
}
export interface DadosInvestimentos {
  [key: string]: DadosRegiao;
}

// --- PROPS (ATUALIZADAS) ---
interface TabelaInfoProps {
  dadosDaRegiao: DadosRegiao;
  onClose: () => void;
  // 3. ATUALIZADO: Renomeado para 'estadoCodarea' para clareza
  estadoCodarea: string | null; 
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

// --- COMPONENTE (ATUALIZADO) ---
const TabelaInfo = ({ dadosDaRegiao, onClose, estadoCodarea }: TabelaInfoProps) => {
  const [termoBusca, setTermoBusca] = useState<string>('');

  // --- LÓGICA DE BUSCA (CORRIGIDA) ---
  
  // 4. CORRIGIDO: A busca agora é pelo 'codarea'
  const dadosDoEstado = estadoCodarea
    ? dadosDaRegiao.municipios.find(m => m.codarea === estadoCodarea)
    : null;
  
  // --- FIM DA LÓGICA ---

  // O filtro (por nome) só é relevante se NENHUM estado estiver selecionado
  const municipiosFiltrados = !dadosDoEstado
    ? (dadosDaRegiao.municipios || []).filter((municipio) =>
        municipio.nome.toLowerCase().includes(termoBusca.toLowerCase())
      )
    : [];
  
  // PDF (Sem mudanças na lógica interna)
  const handleGerarPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(20);

    if (dadosDoEstado) {
      doc.text(`Relatório de Investimentos - ${dadosDoEstado.nome}`, 14, 22);
      doc.autoTable({
        startY: 30,
        head: [['Investimentos (Município)', 'Total Investido']],
        body: dadosDoEstado.investimentos.map(item => [item.nome, item.valor]),
        headStyles: { fillColor: [0, 128, 128] },
      });
    } else {
      doc.text(`Relatório de Investimentos - ${dadosDaRegiao.regiao}`, 14, 22);
      doc.autoTable({
        startY: 30,
        head: [['Dados Gerais (Regional)', 'Total Investido']],
        body: dadosDaRegiao.investimentosGerais.map(item => [item.nome, item.valor]),
        headStyles: { fillColor: [0, 128, 128] },
      });
      if (municipiosFiltrados.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text(`Lista de Municípios - ${dadosDaRegiao.regiao}`, 14, 22);
        doc.autoTable({
          startY: 30,
          head: [['Municípios Selecionados (Filtrados)']],
          body: municipiosFiltrados.map(m => [m.nome]),
        });
      }
    }
    doc.save(`relatorio_${dadosDoEstado ? dadosDoEstado.nome : dadosDaRegiao.regiao}.pdf`);
  };

  
  return (
    <div className="info-container">
      <button className="close-button" onClick={onClose}>✕</button>

      {/* A lógica de renderização condicional agora
          deve funcionar, pois 'dadosDoEstado' será encontrado
      */}
      {dadosDoEstado ? (
        
        // --- VISÃO DO ESTADO/MUNICÍPIO (NOVO) ---
        <div className="visao-estado">
          <h2 className="titulo-estado">{dadosDoEstado.nome}</h2>

          <table className="tabela-investimentos">
            <thead>
              <tr>
                <th>Investimentos Específicos</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {dadosDoEstado.investimentos.length > 0 ? (
                dadosDoEstado.investimentos.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nome}</td>
                    <td>{item.valor}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', padding: '10px' }}>
                    Nenhum investimento específico cadastrado para este município.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <button className="btn-pdf" onClick={handleGerarPDF} style={{ marginTop: '20px' }}>
            Baixar PDF de {dadosDoEstado.nome}
          </button>
        </div>

      ) : (

        // --- VISÃO DA REGIÃO (CÓDIGO ANTIGO) ---
        <div className="visao-regiao">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Pesquisar Município..."
              value={termoBusca}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTermoBusca(e.target.value)}
            />
          </div>

          <h2 className="titulo-estado">{dadosDaRegiao.regiao}</h2>

          <table className="tabela-investimentos">
            <thead>
              <tr>
                <th>Investimentos Gerais (Regional)</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {dadosDaRegiao.investimentosGerais.map((item, index) => (
                <tr key={index}>
                  <td>{item.nome}</td>
                  <td>{item.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="btn-pdf" onClick={handleGerarPDF}>
            Baixar PDF da Região
          </button>

          <div className="municipios-lista">
            <h3>Municípios</h3>
            {municipiosFiltrados.length > 0 ? (
              municipiosFiltrados.map((municipio) => (
                <details key={municipio.nome} className="municipio-item">
                  <summary>{municipio.nome}</summary>
                  {municipio.investimentos.length > 0 ? (
                    <table className="tabela-investimentos-municipio">
                      <thead>
                        <tr>
                          <th>Investimento</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {municipio.investimentos.map((inv, idx) => (
                          <tr key={idx}>
                            <td>{inv.nome}</td>
                            <td>{inv.valor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="sem-investimento">Nenhum investimento específico cadastrado para este município.</p>
                  )}
                </details>
              ))
            ) : (
              <p>Nenhum município encontrado com o termo "{termoBusca}".</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TabelaInfo;