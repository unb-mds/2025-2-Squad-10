// src/pages/Teste.tsx
import  { useState } from 'react';
import MapaInterativo3D from '../components/MapaPage/mapa'; // Verifique se o caminho está correto

// Se quiser adicionar o painel e o footer, importe-os também
// import InfoPanel from '../components/MapaPage/InfoPanel';
// import Footer from '../components/Geral/footer';

// Importe o CSS se quiser o layout animado
import '../style/MapaPage.css';

const TestePage = () => {
  // 1. Crie o estado que o componente do mapa precisa
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  return (
        <div className="map-area">
          {/* 2. Passe o estado e a função como props para o mapa */}
          <MapaInterativo3D
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
          />
        </div>
  );
};

export default TestePage;