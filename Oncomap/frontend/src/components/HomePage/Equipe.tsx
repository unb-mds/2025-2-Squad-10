import { FaGithub } from 'react-icons/fa';
import '../../style/Equipe.css';


const teamMembers = [
  { 
    name: 'Felype Carrijo', 
    role: 'Desenvolvedor', 
    img: 'https://placehold.co/300x200/2a2a2a/FFF?text=FC', 
    githubUrl: 'https://github.com' 
  },
  { 
    name: 'Artur Galdino', 
    role: 'Desenvolvedor', 
    img: 'https://i.imgur.com/eBOUX2i.png', 
    githubUrl: 'https://github.com' 
  },
  { 
    name: 'João Pedro', 
    role: 'Desenvolvedor', 
    img: 'https://placehold.co/300x200/e0e0e0/000?text=JP', 
    githubUrl: 'https://github.com' 
  },
  { 
    name: 'Gabriel Alexandroni', 
    role: 'Desenvolvedor', 
    img: 'https://placehold.co/300x200/c5e8c7/000?text=GA', 
    githubUrl: 'https://github.com' 
  },
  { 
    name: 'Luis Henrique', 
    role: 'Desenvolvedor', 
    img: 'https://placehold.co/300x200/2a2a2a/FFF?text=FC',
    githubUrl: 'https://github.com' 
  },
  { 
    name: 'Giovani Coelho', 
    role: 'Desenvolvedor', 
    img: 'https://placehold.co/300x200/2a2a2a/FFF?text=FC',
    githubUrl: 'https://github.com' 
  },
];


const CardsEquipe = ({ name, role, img, githubUrl }: typeof teamMembers[0]) => (
  <div className="team-card">
    <div className="team-image-container">
      <img src={img} alt={`Foto de ${name}`} />
    </div>
    <div className="team-info">
      <h3 className="team-name">{name}</h3>
      <p className="team-role">{role}</p>
      <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="github-button">
        <FaGithub style={{ marginRight: '5px' }} />
        GitHub
      </a>
    </div>
  </div>
);

// Componente principal da seção
const Equipe = () => {
  return (
    <section id="quem-somos" className="container">
      <h2 className="team-section-title">Equipe</h2>
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <CardsEquipe key={index} {...member} />
        ))}
      </div>
    </section>
  );
};

export default Equipe;