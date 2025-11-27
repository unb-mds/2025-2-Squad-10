// src/components/MapaPage/TabelaInfo.tsx

// --- ALTERAÇÃO 1: Removido 'React' que não estava sendo usado ---
import { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../../style/Tabelainfo.css';
import type { FeatureCollection } from 'geojson';

// --- INTERFACES (sem alterações) ---
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
  onClose: () => void;
  estadoCodarea: string | null;
  municipiosDoEstadoGeoJSON: FeatureCollection | null;
  setSearchedMunicipioName: (name: string | null) => void;
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


const TabelaInfo = ({
  dadosDaRegiao,
  estadoCodarea,
  municipiosDoEstadoGeoJSON,
  setSearchedMunicipioName,
}: TabelaInfoProps) => {
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [termoBuscaMunicipio, setTermoBuscaMunicipio] = useState<string>('');

  const dadosDoEstado = estadoCodarea
    ? dadosDaRegiao.municipios.find(m => m.codarea === estadoCodarea)
    : null;

  const municipiosGeoFiltrados = useMemo(() => {
    if (!municipiosDoEstadoGeoJSON || termoBuscaMunicipio.length < 2) {
      return [];
    }
    return municipiosDoEstadoGeoJSON.features.filter(feature =>
      feature.properties?.name.toLowerCase().includes(termoBuscaMunicipio.toLowerCase())
    );
  }, [municipiosDoEstadoGeoJSON, termoBuscaMunicipio]);

  // Esta variável agora será usada na renderização
  const municipiosFiltrados = !dadosDoEstado
    ? (dadosDaRegiao.municipios || []).filter((municipio) =>
        municipio.nome.toLowerCase().includes(termoBusca.toLowerCase())
      )
    : [];

  const handleGerarPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable; // O type cast é usado aqui
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

      {dadosDoEstado ? (
        <div className="visao-estado">
          <h2 className="titulo-estado">{dadosDoEstado.nome}</h2>

          <table className="tabela-investimentos">
            <thead>
              <tr>
                <th>Investimentos Gerais do Estado</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {dadosDoEstado.investimentos.length > 0 ? (
                dadosDoEstado.investimentos.map((item, index) => (
                  <tr key={index}><td>{item.nome}</td><td>{item.valor}</td></tr>
                ))
              ) : (
                <tr><td colSpan={2}>Nenhum investimento geral cadastrado.</td></tr>
              )}
            </tbody>
          </table>

          <hr className="separator" />

          <div className="municipio-search-section">
            <h4>Pesquisar Município no Mapa</h4>

            <div className="search-input-group">
              <input
                type="text"
                placeholder="Pesquisar Município"
                className="search-bar"
                value={termoBuscaMunicipio}
                onChange={e => setTermoBuscaMunicipio(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchedMunicipioName(termoBuscaMunicipio);
                  }
                }}
              />
              <button
                className="btn-pesquisar"
                onClick={() => setSearchedMunicipioName(termoBuscaMunicipio)}
              >
                Pesquisar
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
            Baixar PDF de {dadosDoEstado.nome}
          </button>
        </div>
      ) : (
        <div className="visao-regiao">
          <div className="search-bar">
            {/* --- ALTERAÇÃO 3: Usando setTermoBusca no onChange --- */}
            <input
              type="text"
              placeholder="Pesquisar Estado..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>

          <h2 className="titulo-estado">{dadosDaRegiao.regiao}</h2>

          <table className="tabela-investimentos">
             {/* ... sua tabela de investimentos gerais ... */}
          </table>

          <button className="btn-pdf" onClick={handleGerarPDF}>
            Baixar PDF da Região
          </button>

          {/* --- ALTERAÇÃO 4: Usando a variável 'municipiosFiltrados' --- */}
          <div className="municipios-lista">
            <h3>Estados da Região</h3>
            {municipiosFiltrados.length > 0 ? (
              municipiosFiltrados.map((estado) => (
                <details key={estado.nome} className="municipio-item">
                  <summary>{estado.nome}</summary>
                  {/* ... detalhes dos investimentos do estado ... */}
                </details>
              ))
            ) : (
              <p>Nenhum estado encontrado com o termo "{termoBusca}".</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TabelaInfo;