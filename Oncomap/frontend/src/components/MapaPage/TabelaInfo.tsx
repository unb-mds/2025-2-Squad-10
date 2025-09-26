import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Tabelainfo.css';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


interface Investimento {
  nome: string;
  valor: string;
}

interface DadosEstado {
  estado: string;
  investimentos: Investimento[];
  municipios: string[];
}

// Dados de exemplo
const mockData: DadosEstado = {
  estado: 'Amazonas',
  investimentos: [
    { nome: 'Medicamentos', valor: 'R$ 15.200.000,00' },
    { nome: 'Equipamentos', valor: 'R$ 8.750.000,00' },
    { nome: 'Obras', valor: 'R$ 25.100.000,00' },
    { nome: 'Serviços de Saúde', valor: 'R$ 12.450.000,00' },
  ],
  municipios: [
    'Manaus', 'Borba', 'Coari', 'Parintins', 'Itacoatiara', 'Manacapuru',
    'Tefé', 'Tabatinga', 'Maués', 'Humaitá', 'Lábrea', 'Eirunepé'
  ],
};

const TabelaInfo = () => {
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [dados] = useState<DadosEstado>(mockData);

  const municipiosFiltrados = dados.municipios.filter((municipio) =>
    municipio.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const handleGerarPDF = () => {
    
    const doc = new jsPDF() as jsPDFWithAutoTable;

    doc.setFontSize(20);
    doc.text(`Relatório de Investimentos - ${dados.estado}`, 14, 22);


    doc.autoTable({
      startY: 30,
      head: [['Dados Gerais', 'Total Investido']],
      body: dados.investimentos.map(item => [item.nome, item.valor]),
      headStyles: { fillColor: [0, 128, 128] },
    });

    if (municipiosFiltrados.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text(`Lista de Municípios - ${dados.estado}`, 14, 22);
      
      doc.autoTable({
        startY: 30,
        head: [['Municípios Selecionados']],
        body: municipiosFiltrados.map(m => [m]),
      });
    }

    doc.save(`relatorio_${dados.estado}.pdf`);
  };

  return (
    <div className="info-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Pesquisar"
          value={termoBusca}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTermoBusca(e.target.value)}
        />
      </div>

      <h2 className="titulo-estado">{dados.estado}</h2>

      <table className="tabela-investimentos">
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
          {dados.investimentos.map((item, index) => (
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
