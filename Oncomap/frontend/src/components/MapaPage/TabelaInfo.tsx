import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Tabelainfo.css'; // Mantenha a importação do seu CSS

// Tipos para os dados (vamos reutilizá-los)
interface Investimento {
  nome: string;
  valor: string;
}
export interface DadosRegiao {
  regiao: string;
  investimentos: Investimento[];
  municipios: string[];
}

// Tipos para as props que o componente vai receber
interface TabelaInfoProps {
  dadosDaRegiao: DadosRegiao;
  onClose: () => void;
}

// Estendendo a interface do jsPDF
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const TabelaInfo = ({ dadosDaRegiao, onClose }: TabelaInfoProps) => {
  const [termoBusca, setTermoBusca] = useState<string>('');

  // Agora usa os dados recebidos via props
  const municipiosFiltrados = dadosDaRegiao.municipios.filter((municipio) =>
    municipio.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const handleGerarPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(20);
    doc.text(`Relatório de Investimentos - ${dadosDaRegiao.regiao}`, 14, 22);
    doc.autoTable({
      startY: 30,
      head: [['Dados Gerais', 'Total Investido']],
      body: dadosDaRegiao.investimentos.map(item => [item.nome, item.valor]),
      headStyles: { fillColor: [0, 128, 128] },
    });
    if (municipiosFiltrados.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text(`Lista de Municípios - ${dadosDaRegiao.regiao}`, 14, 22);
      doc.autoTable({
        startY: 30,
        head: [['Municípios Selecionados']],
        body: municipiosFiltrados.map(m => [m]),
      });
    }
    doc.save(`relatorio_${dadosDaRegiao.regiao}.pdf`);
  };

  return (
    <div className="info-container">
      <button className="close-button" onClick={onClose}>✕</button>
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
        {/* O conteúdo da tabela continua o mesmo, mas agora usará 'dadosDaRegiao' */}
        <thead>
          <tr>
            <th>Total Investido</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="categoria-titulo" colSpan={2}>Dados Gerais</td>
          </tr>
          {dadosDaRegiao.investimentos.map((item, index) => (
            <tr key={index}>
              <td>{item.nome}</td>
              <td>{item.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn-pdf" onClick={handleGerarPDF}>
        Baixar PDF
      </button>

      <div className="municipios-lista">
        <h3>Municípios</h3>
        <ul>
          {municipiosFiltrados.map((municipio, index) => (
            <li key={index}>{municipio}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TabelaInfo;