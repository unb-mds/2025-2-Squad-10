import { NavLink } from 'react-router-dom';
import '../../style/Sidebar.css'; // Mantenha o CSS para estilização (será ajustado abaixo)

const HomeButton = () => {
  return (
    // Usa NavLink para navegação interna, garantindo o estilo ativo se necessário
    <NavLink to="/" className="home-button-link" aria-label="Ir para a página inicial">
      {/* Ícone da Home (Casa) */}
      <span className="home-icon">⌂</span> 
    </NavLink>
  );
};

export default HomeButton;