// src/components/MapaPage/TabelaInfo.tsx

import { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../../style/Tabelainfo.css';
import type { FeatureCollection } from 'geojson';

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

export interface DadosInvestimentos {
  [key: string]: DadosRegiao;
}

interface TabelaInfoProps {
  dadosDaRegiao: DadosRegiao;
  onClose: () => void; // Esta função reseta tudo (Zoom total)
  estadoCodarea: string | null;
  onSelectState: (codarea: string) => void; 
  municipiosDoEstadoGeoJSON: FeatureCollection | null;
  setSearchedMunicipioName: (name: string | null) => void;
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const TabelaInfo = ({
  dadosDaRegiao,
  estadoCodarea,
  onSelectState,
  onClose,
  municipiosDoEstadoGeoJSON,
  setSearchedMunicipioName,
}: TabelaInfoProps) => {
  
  const [termoBuscaMunicipio, setTermoBuscaMunicipio] = useState<string>('');

  const dadosDoEstado = estadoCodarea
    ? dadosDaRegiao.municipios.find((m) => m.codarea === estadoCodarea)
    : null;

  const municipiosGeoFiltrados = useMemo(() => {
    if (!municipiosDoEstadoGeoJSON || termoBuscaMunicipio.length < 2) {
      return [];
    }
    return municipiosDoEstadoGeoJSON.features.filter((feature) =>
      feature.properties?.name.toLowerCase().includes(termoBuscaMunicipio.toLowerCase())
    );
  }, [municipiosDoEstadoGeoJSON, termoBuscaMunicipio]);

  const handleGerarPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(20);

    if (dadosDoEstado) {
      doc.text(`Relatório de Investimentos - ${dadosDoEstado.nome}`, 14, 22);
      doc.autoTable({
        startY: 30,
        head: [['Investimentos (Município)', 'Total Investido']],
        body: dadosDoEstado.investimentos.map((item) => [item.nome, item.valor]),
        headStyles: { fillColor: [0, 128, 128] },
      });
      doc.save(`relatorio_${dadosDoEstado.nome}.pdf`);
    } else {
      doc.text(`Relatório de Investimentos - ${dadosDaRegiao.regiao}`, 14, 22);
      doc.autoTable({
        startY: 30,
        head: [['Dados Gerais (Regional)', 'Total Investido']],
        body: dadosDaRegiao.investimentosGerais.map((item) => [item.nome, item.valor]),
        headStyles: { fillColor: [0, 128, 128] },
      });
      doc.save(`relatorio_${dadosDaRegiao.regiao}.pdf`);
    }
  };

  return (
    <div className="info-container">

      {dadosDoEstado ? (
        // ---------------------------------------------------
        // VISÃO DO ESTADO SELECIONADO
        // ---------------------------------------------------
        <div className="visao-estado">
          {/* AQUI: Volta para a Região */}
          <button className="close-button" onClick={() => onSelectState('')}>
             &larr; Voltar para a Região
          </button>
          
          <h2 className="titulo-estado">{dadosDoEstado.nome}</h2>

          <table className="tabela-investimentos">
            <thead>
              <tr>
                <th>Investimentos Gerais</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {dadosDoEstado.investimentos.length > 0 ? (
                dadosDoEstado.investimentos.map((item: Investimento, index: number) => (
                  <tr key={index}><td>{item.nome}</td><td>{item.valor}</td></tr>
                ))
              ) : (
                <tr><td colSpan={2}>Nenhum investimento geral cadastrado.</td></tr>
              )}
            </tbody>
          </table>

          <hr className="separator" />

          <div className="municipio-search-section">
            <h4>Pesquisar Município</h4>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Digite o nome..."
                className="search-bar"
                value={termoBuscaMunicipio}
                onChange={(e) => setTermoBuscaMunicipio(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearchedMunicipioName(termoBuscaMunicipio);
                }}
              />
              <button
                className="btn-pesquisar"
                onClick={() => setSearchedMunicipioName(termoBuscaMunicipio)}
              >
                Ir
              </button>
            </div>

            <ul className="municipio-search-results">
              {municipiosGeoFiltrados.map((municipio, index) => (
                <li
                  key={index}
                  onClick={() => setSearchedMunicipioName(municipio.properties?.name)}
                >
                  {municipio.properties?.name}
                </li>
              ))}
            </ul>
          </div>

          <button className="btn-pdf" onClick={handleGerarPDF}>
            Baixar PDF ({dadosDoEstado.nome})
          </button>
        </div>
      ) : (
        // ---------------------------------------------------
        // VISÃO DA REGIÃO
        // ---------------------------------------------------
        <div className="visao-regiao">
          {/* AQUI: Volta para o Mapa Geral (Brasil) */}
          <button className="close-button" onClick={onClose}>
             &larr; Voltar para o Mapa
          </button>

          <h2 className="titulo-estado">{dadosDaRegiao.regiao}</h2>

          <table className="tabela-investimentos">
            <thead>
              <tr><th>Dados Regionais</th><th>Total</th></tr>
            </thead>
             <tbody>
               {dadosDaRegiao.investimentosGerais.map((item: Investimento, idx: number) => (
                 <tr key={idx}><td>{item.nome}</td><td>{item.valor}</td></tr>
               ))}
             </tbody>
          </table>

          <div className="municipios-lista">
            <h3>Selecione um Estado</h3>
            <div className="grid-estados">
              {dadosDaRegiao.municipios.map((estado: MunicipioComInvestimentos) => (
                <div 
                  key={estado.codarea} 
                  className="card-estado"
                  onClick={() => onSelectState(estado.codarea)} 
                >
                  <span className="nome-estado">{estado.nome}</span>
                  <span className="seta-visual">➜</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-pdf" onClick={handleGerarPDF}>
            Baixar PDF da Região
          </button>
        </div>
      )}
    </div>
  );
};

export default TabelaInfo;