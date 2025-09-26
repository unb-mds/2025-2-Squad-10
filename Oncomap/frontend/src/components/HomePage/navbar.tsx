import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import '../../style/Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <h1 className="navbar-logo">
          <Link to="/">OncoMap</Link>
        </h1>
        <nav className="navbar-nav">
          <ul>
            <li><HashLink to="/#inicio" smooth>Início</HashLink></li>
            <li><HashLink to="/#sobre" smooth>Sobre</HashLink></li>
            <li><HashLink to="/#quem-somos" smooth>Quem somos</HashLink></li>
          </ul>
        </nav>
        <Link to="/mapa" className="navbar-cta">Explorar</Link>
      </div>
    </header>
  );
};

export default Navbar;