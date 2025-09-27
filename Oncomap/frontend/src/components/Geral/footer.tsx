import '../../style/Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        
        <div className="footer-column">
          <h4>Informações</h4>
          <ul>
            {/* Estes links são para as seções da HomePage */}
            <li><a href="/#inicio">Início</a></li>
            <li><a href="/#sobre">Sobre o projeto</a></li>
            <li><a href="/#quem-somos">Quem somos</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Contato</h4>
          <p>
            Phone: +55 (XX) XXXX-XXXX<br />
            Email: contato@oncomap.com<br />
            Address: Rua Fictícia, 123
          </p>
        </div>

        <div className="footer-column">
          <h4>Siga-nos</h4>
          <ul>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Onco Mapa</h4>
          <p>Mapa Interativo de Incidência e Mortalidade por Câncer.</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© ONCOMAP 2024. All rights reserved.</p>
        <p>Contact us: +55 (XX) XXXX-XXXX</p>
      </div>
    </footer>
  );
};

export default Footer;