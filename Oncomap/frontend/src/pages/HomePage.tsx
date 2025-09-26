import Navbar from '../components/HomePage/navbar';
import Hero from '../components/HomePage/hero'
import Footer from '../components/Geral/footer'; // Reutilizando o footer
import '../style/HomePage.css'; // Estilos globais da página
import SobreProjeto from '../components/HomePage/SobreProjeto';
import Equipe from '../components/HomePage/Equipe'

const HomePage = () => {
  return (
    <div className="homepage">
      <Navbar />
      <Hero />

      <main className="main-content-card">
        <SobreProjeto /> 
        <Equipe/>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;