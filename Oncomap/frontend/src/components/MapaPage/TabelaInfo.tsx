import { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../../style/Tabelainfo.css';
import type { FeatureCollection } from 'geojson';
import type { DadosRegiao, Investimento, MunicipioComInvestimentos } from '../../types/apiTypes';

interface TabelaInfoProps {
  dadosDaRegiao: DadosRegiao;
  onClose: () => void;
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

  // 1. Encontra os dados do estado selecionado
  const dadosDoEstado = estadoCodarea
    ? dadosDaRegiao.municipios.find((m) => String(m.codarea) === String(estadoCodarea))
    : null;

  // 2. Filtra as cidades na TABELA baseado na busca (O que estava faltando)
  const investimentosFiltrados = useMemo(() => {
    if (!dadosDoEstado) return [];
    
    // Se não tiver busca, retorna tudo
    if (!termoBuscaMunicipio) return dadosDoEstado.investimentos;

    // Se tiver busca, filtra pelo nome da cidade
    return dadosDoEstado.investimentos.filter(item => 
      item.nome.toLowerCase().includes(termoBuscaMunicipio.toLowerCase())
    );
  }, [dadosDoEstado, termoBuscaMunicipio]);

  // 3. Filtra as sugestões do GeoJSON (Autocomplete do input)
  const municipiosGeoFiltrados = useMemo(() => {
    if (!municipiosDoEstadoGeoJSON || termoBuscaMunicipio.length < 2) {
      return [];
    }
    return municipiosDoEstadoGeoJSON.features.filter((feature) =>
      feature.properties?.name?.toLowerCase().includes(termoBuscaMunicipio.toLowerCase())
    );
  }, [municipiosDoEstadoGeoJSON, termoBuscaMunicipio]);

  // Função auxiliar para quando clicar em uma sugestão
  const handleSelecionarSugestao = (nomeMunicipio: string) => {
    setTermoBuscaMunicipio(nomeMunicipio); // Atualiza o input e filtra a tabela
    setSearchedMunicipioName(nomeMunicipio); // Manda o mapa dar zoom
  };

  const handleGerarPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(20);

    if (dadosDoEstado) {
      doc.text(`Relatório - ${dadosDoEstado.nome}`, 14, 22);
      doc.autoTable({
        startY: 30,
        head: [['Município', 'Total Investido']],
        // Gera PDF apenas do que está visível/filtrado ou de tudo? 
        // Geralmente de tudo, mas aqui mantivemos 'dadosDoEstado.investimentos' original.
        body: dadosDoEstado.investimentos.map((item) => [item.nome, item.valor]),
        headStyles: { fillColor: [0, 128, 128] },
      });
      doc.save(`relatorio_${dadosDoEstado.nome}.pdf`);
    } else {
      doc.text(`Relatório Regional - ${dadosDaRegiao.regiao}`, 14, 22);
      doc.autoTable({
        startY: 30,
        head: [['Dados Gerais', 'Total']],
        body: dadosDaRegiao.investimentosGerais.map((item) => [item.nome, item.valor]),
        headStyles: { fillColor: [0, 128, 128] },
      });
      doc.save(`relatorio_${dadosDaRegiao.regiao}.pdf`);
    }
  };

  return (
    <div className="info-container">
      {dadosDoEstado ? (
        // --- VISÃO DO ESTADO ---
        <div className="visao-estado">
          <button className="close-button" onClick={() => onSelectState('')}>
             &larr; Voltar para a Região
          </button>
          
          <h2 className="titulo-estado">{dadosDoEstado.nome}</h2>

          {/* Área de Busca */}
          <div className="municipio-search-section">
            <h4>Pesquisar Município na Tabela</h4>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Digite o nome..."
                className="search-bar"
                value={termoBuscaMunicipio}
                onChange={(e) => setTermoBuscaMunicipio(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSelecionarSugestao(termoBuscaMunicipio);
                }}
              />
              {/* Botão X para limpar busca se quiser */}
              {termoBuscaMunicipio && (
                <button 
                  className="btn-limpar" 
                  onClick={() => {
                    setTermoBuscaMunicipio('');
                    setSearchedMunicipioName(null);
                  }}
                  style={{marginLeft: '5px', cursor: 'pointer'}}
                >
                  X
                </button>
              )}
            </div>

            {/* Lista de Sugestões (Autocomplete) */}
            {municipiosGeoFiltrados.length > 0 && (
              <ul className="municipio-search-results">
                {municipiosGeoFiltrados.slice(0, 5).map((municipio, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelecionarSugestao(municipio.properties?.name || '')}
                  >
                    {municipio.properties?.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <hr className="separator" />

          {/* TABELA DE DADOS (Agora Filtrada) */}
          <table className="tabela-investimentos">
            <thead>
              <tr>
                <th>Municípios</th>
                <th>Total Investido</th>
              </tr>
            </thead>
            <tbody>
              {investimentosFiltrados.length > 0 ? (
                investimentosFiltrados.map((item: Investimento, index: number) => (
                  <tr key={index}>
                    <td>{item.nome}</td>
                    <td>{item.valor}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>
                    {termoBuscaMunicipio 
                      ? `Nenhum município encontrado com "${termoBuscaMunicipio}"` 
                      : "Nenhum investimento identificado neste estado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <button className="btn-pdf" onClick={handleGerarPDF}>
            Baixar PDF ({dadosDoEstado.nome})
          </button>
        </div>
      ) : (
        // --- VISÃO DA REGIÃO ---
        <div className="visao-regiao">
          <button className="close-button" onClick={onClose}>
             &larr; Voltar para o Mapa
          </button>

          <h2 className="titulo-estado">{dadosDaRegiao.regiao}</h2>

          <table className="tabela-investimentos">
            <thead>
              <tr><th>Resumo Regional</th><th>Valor</th></tr>
            </thead>
             <tbody>
               {dadosDaRegiao.investimentosGerais.map((item: Investimento, idx: number) => (
                 <tr key={idx}><td>{item.nome}</td><td>{item.valor}</td></tr>
               ))}
             </tbody>
          </table>

          <div className="municipios-lista">
            <h3>Estados da Região</h3>
            <div className="grid-estados">
              {dadosDaRegiao.municipios.map((estado: MunicipioComInvestimentos) => (
                <div 
                  key={estado.codarea} 
                  className="card-estado"
                  onClick={() => onSelectState(String(estado.codarea))} 
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