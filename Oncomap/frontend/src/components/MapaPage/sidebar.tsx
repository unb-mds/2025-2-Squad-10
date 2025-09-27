import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../../style/Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      
      <div
        className={isOpen ? 'sidebar-overlay open' : 'sidebar-overlay'}
        onClick={closeSidebar}
      />
      
      <aside className={isOpen ? 'sidebar open' : 'sidebar'}>
        <nav>
          <ul>
            <li>
              <NavLink to="/" onClick={closeSidebar}>
                Home
              </NavLink>
            </li>
            {/* Exemplo de futuro link */}
            {/* <li>
              <NavLink to="/outra-pagina" onClick={closeSidebar}>
                Outra Página
              </NavLink>
            </li> */}
          </ul>
        </nav>
      </aside>

      
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'} 
      </button>
    </>
  );
};

export default Sidebar;