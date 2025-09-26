import { FaMapMarkedAlt, FaSearch, FaFilePdf, FaChartLine } from 'react-icons/fa';
import './HowItWorks.css';

// Um pequeno componente para cada item da grade para manter o código limpo
const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="feature-item">
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </div>
);

const HowItWorks = () => {
  return (
    // Usamos a tag <section> com o id para o link da navbar funcionar
    <section id="sobre" className="container">
      
      {/* --- Parte "Como Funciona" --- */}
      <h2>Como Funciona</h2>
      <div className="features-grid">
        <FeatureItem 
          icon={<FaMapMarkedAlt />} 
          title="Mapa do Brasil Interativo" 
          description="Navegue pelo mapa do Brasil e selecione regiões ou estados específicos." 
        />
        <FeatureItem 
          icon={<FaSearch />} 
          title="Pesquisa de Dados" 
          description="Acesse dados detalhados sobre investimentos em saúde oncológica." 
        />
        <FeatureItem 
          icon={<FaChartLine />} 
          title="Investimento" 
          description="Visualize gráficos e informações sobre os investimentos de forma clara." 
        />
        <FeatureItem 
          icon={<FaFilePdf />} 
          title="Gere um PDF" 
          description="Exporte os dados e visualizações em um relatório PDF para fácil compartilhamento." 
        />
      </div>

      {/* --- Parte "Sobre o Projeto" --- */}
      <div className="about-project-section">
        <h2>Sobre o Projeto</h2>
        <p>
          O OncoMap é uma plataforma interativa que tem como objetivo promover a transparência e o acesso a informações 
          sobre os investimentos públicos em saúde oncológica nos municípios brasileiros. A partir da extração de 
          dados publicados nos diários oficiais dos municípios, o OncoMap transforma dados brutos em informação 
          clara, intuitiva e acessível.
        </p>
        <p>
          Através de um mapa interativo do Brasil, é possível visualizar os dados de diferentes formas e em diferentes 
          níveis de detalhamento. Os dados são organizados e apresentados de forma a facilitar a compreensão dos 
          investimentos oncológicos distribuídos nos municípios, possibilitando identificar padrões, desigualdades 
          regionais e tendências ao longo do tempo.
        </p>
      </div>

    </section>
  );
};

export default HowItWorks;