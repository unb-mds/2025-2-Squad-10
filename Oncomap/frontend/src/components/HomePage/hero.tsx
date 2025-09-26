import { FaPlayCircle } from 'react-icons/fa';
import { HashLink } from 'react-router-hash-link';
import '../../style/Hero.css';

const Hero = () => {
  return (
    <section id="inicio" className="hero-section">
      <div className="hero-content">
        <p className="hero-subtitle">OncoMap - Mapa de Investimento em Saúde Oncológica</p>
        <h1 className="hero-title">Transparência nos investimentos em saúde oncológica</h1>
        <p className="hero-description">Ajudamos a transformar dados dos diários oficiais municipais em informação acessível sobre investimentos em saúde oncológica.</p>
        
        {/* Este link leva para a próxima seção da página */}
        <HashLink to="/#sobre" smooth className="hero-start-button">
          <FaPlayCircle className="hero-start-icon" />
          <span>Começar</span>
        </HashLink>
      </div>
    </section>
  );
};

export default Hero;