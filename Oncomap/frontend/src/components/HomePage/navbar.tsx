import { useState } from 'react'; 
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import '../../style/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);


  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <h2 className="navbar-logo">
          <Link to="/" onClick={handleLinkClick}>OncoMap</Link>
        </h2>

        <nav className={menuOpen ? "navbar-nav active" : "navbar-nav"}>
          <ul>
            <li>
              <HashLink to="/#inicio" smooth onClick={handleLinkClick}>
                Início
              </HashLink>
            </li>
            <li>
              <HashLink to="/#sobre" smooth onClick={handleLinkClick}>
                Sobre
              </HashLink>
            </li>
            <li>
              <HashLink to="/#quem-somos" smooth onClick={handleLinkClick}>
                Quem somos
              </HashLink>
            </li>
          </ul>
          
          <Link to="/mapa" className="navbar-cta" onClick={handleLinkClick}>
            Explorar
          </Link>
        </nav>

        
        <button
          className={menuOpen ? "navbar-toggle active" : "navbar-toggle"}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;