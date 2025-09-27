import { useState } from 'react';
import MapaInterativo3D from "../components/MapaPage/mapa";
import Footer from "../components/Geral/footer";
import TabelaInfo from '../components/MapaPage/TabelaInfo';
import { dadosDasRegioes } from '../data/dados_regioes';
import '../style/MapaPage.css';

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
                
                {selectedRegion && dadosDasRegioes[selectedRegion] && (
                    <div className="panel-area">
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