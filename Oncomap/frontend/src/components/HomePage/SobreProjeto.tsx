import { FaMapMarkedAlt, FaSearch, FaChartLine, FaFilePdf } from 'react-icons/fa';
import '../../style/SobreProjeto.css';


const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="feature-item">
    <div className="feature-icon">{icon}</div>
    <div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  </div>
);

const SobreProjeto = () => {
  return (
    <section id="sobre" className="container">
      <div className="about-layout">


        <div className="about-project-column">
          <h2>Sobre o Projeto</h2>
          <p>
            O OncoMap é uma plataforma interativa que tem como objetivo ampliar a transparência e o acesso a informações sobre os investimentos públicos em saúde oncológica nos municípios brasileiros. 
            A partir da integração de dados coletados pelo projeto Querido Diário — que reúne e organiza publicações dos diários oficiais municipais —, o OncoMap transforma informações fragmentadas e de difícil acesso em uma visualização clara, intuitiva e acessível.
          </p>
          <p>
            Por meio de um mapa interativo do Brasil, a ferramenta permite explorar como os recursos destinados à saúde oncológica estão distribuídos nos municípios, possibilitando identificar padrões, desigualdades regionais e tendências nos investimentos.
          </p>
        </div>

        
        <div className="how-it-works-column">
          <h2>COMO FUNCIONA</h2>
          <div className="features-grid">
            <FeatureItem 
              icon={<FaMapMarkedAlt />} 
              title="Mapa do Brasil Interativo" 
              description="Clique na região ou estado" 
            />
            <FeatureItem 
              icon={<FaSearch />} 
              title="Pesquisa de Dados" 
              description="Dos dados mais gerais aos mais específicos" 
            />
            <FeatureItem 
              icon={<FaChartLine />} 
              title="Investimento" 
              description="Levantamento do investimento no departamento oncológico de determinada região" 
            />
            <FeatureItem 
              icon={<FaFilePdf />} 
              title="Gere um PDF" 
              description="Gere um PDF com os dados de maior relevância para pesquisa" 
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default SobreProjeto;