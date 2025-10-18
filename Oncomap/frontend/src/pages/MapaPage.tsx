// frontend/src/pages/MapaPege.tsx

import React, { useState } from 'react';
import MapaInterativo3D from "../components/MapaPage/mapa";
import Footer from "../components/Geral/footer";
import TabelaInfo from '../components/MapaPage/TabelaInfo';
import '../style/MapaPage.css';

// REMOVIDA A IMPORTAÇÃO LOCAL DE DADOS
// import { dadosDasRegioes } from '../data/dados_regioes';

// NOVO: Tipagem para os dados de investimento que virão do backend
interface Investimento {
  nome: string;
  valor: string;
}
interface DadosRegiao {
  regiao: string;
  investimentos: Investimento[];
  municipios: string[];
}
interface DadosInvestimentos {
  [key: string]: DadosRegiao;
}

const MapaPege = () => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [estadoSelecionado, setEstadoSelecionado] = useState<string | null>(null);
    
    // NOVO: Estado para armazenar os dados de investimento que o componente do mapa vai buscar
    const [dadosInvestimentos, setDadosInvestimentos] = useState<DadosInvestimentos | null>(null);

    return(
        <div className="mapa-page-container">
            <div className={selectedRegion ? "content-wrapper region-selected" : "content-wrapper"}>
                <div className="map-area">
                    <MapaInterativo3D 
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                        selectedState={estadoSelecionado}
                        setSelectedState={setEstadoSelecionado}
                        // NOVO: Passando a função para que o mapa possa atualizar os dados de investimento
                        setDadosInvestimentos={setDadosInvestimentos}
                    />
                </div>
                
                {/* LÓGICA ATUALIZADA: Usa o estado 'dadosInvestimentos' em vez da importação local */}
                {selectedRegion && dadosInvestimentos && dadosInvestimentos[selectedRegion] && (
                    <div className="panel-area">
                        <TabelaInfo 
                            dadosDaRegiao={dadosInvestimentos[selectedRegion]} 
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