import { FaPlayCircle } from 'react-icons/fa';
import {Link} from "react-router-dom";
import '../../style/Hero.css';

const Hero = () => {
  return (
    <section id="inicio" className="hero-section">
      <div className="hero-content">
        <h2 className="hero-subtitle">OncoMap - Mapa de Investimento em Saúde Oncológica</h2>
        <h1 className="hero-title">Transparência nos investimentos em saúde oncológica</h1>
        <p className="hero-description">Ajudamos a transformar dados dos diários oficiais municipais em informação acessível sobre investimentos em saúde oncológica.</p>
        
        
        <Link to="/mapa" className="hero-start-button">
          <FaPlayCircle className="hero-start-icon" />
          <span>Começar</span>
        </Link>
      </div>
    </section>
  );
};

export default Hero;