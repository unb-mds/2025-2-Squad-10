import { useState } from 'react';
import MapaInterativo3D from "../components/MapaPage/mapa";
import Footer from "../components/Geral/footer";
import TabelaInfo from '../components/MapaPage/TabelaInfo'; // <-- Mude a importação
import { dadosDasRegioes } from '../data/dados_regioes'; // <-- Importe os dados
import './MapaPage.css';

const MapaPege = () => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    return(
        <div className="mapa-page-container">
            <div className={selectedRegion ? "content-wrapper region-selected" : "content-wrapper"}>
                <div className="map-area">
                    <MapaInterativo3D 
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion} 
                    />
                </div>
                
                {/* Se uma região estiver selecionada E existirem dados para ela... */}
                {selectedRegion && dadosDasRegioes[selectedRegion] && (
                    <div className="panel-area">
                        {/* ...renderize TabelaInfo com os dados corretos! */}
                        <TabelaInfo 
                            dadosDaRegiao={dadosDasRegioes[selectedRegion]} 
                            onClose={() => setSelectedRegion(null)} 
                        />
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default MapaPege;