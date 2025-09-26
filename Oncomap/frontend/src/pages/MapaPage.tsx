import { useState } from 'react'; // Importe useState
import MapaInterativo3D from "../components/MapaPage/mapa";
{/*import Footer from "../components/Geral/footer"/*};
{/*import InfoPanel from '../components/MapaPage/InfoPanel'; */}// Importe o painel que criamos
import '../style/MapaPage.css';

const MapaPege = () => {
    // --- MUDANÇA: O estado agora vive aqui! ---
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    return(
        <div className="mapa-page-container">
            {/* --- MUDANÇA: Adicionamos o "content-wrapper" e a classe dinâmica --- */}
            <div className={selectedRegion ? "content-wrapper region-selected" : "content-wrapper"}>
                <div className="map-area">
                    {/* --- MUDANÇA: Passamos o estado e a função para o componente do mapa --- */}
                    <MapaInterativo3D 
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion} 
                    />
                </div>
                
            
                
            </div>
        </div>
    );
};

export default MapaPege;