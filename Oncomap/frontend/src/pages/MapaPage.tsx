// src/pages/MapaPage.tsx
import React, { useState } from 'react';
import MapaInterativo3D from "../components/MapaPage/mapa";
import Footer from "../components/Geral/footer";
// Importamos os 'types' que TabelaInfo exporta
import TabelaInfo, { type DadosRegiao, type DadosInvestimentos } from '../components/MapaPage/TabelaInfo';
import '../style/MapaPage.css';

const MapaPege: React.FC = () => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    
    // ATUALIZADO: Renomeamos o estado para 'estadoCodarea' para ficar claro
    const [estadoCodarea, setEstadoCodarea] = useState<string | null>(null);
    
    const [dadosInvestimentos, setDadosInvestimentos] = useState<DadosInvestimentos | null>(null);
    const [loadingDados, setLoadingDados] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const getRegiaoData = (): DadosRegiao | null => {
        if (!selectedRegion || !dadosInvestimentos) return null;
        const chaveNormalizada = selectedRegion.trim().toLowerCase();
        const keys = Object.keys(dadosInvestimentos);
        const matchKey = keys.find(k => k.toLowerCase() === chaveNormalizada);
        return matchKey ? dadosInvestimentos[matchKey] : null;
    };

    const dadosDaRegiao = getRegiaoData();

    return (
        <div className="mapa-page-container">
            <div className={selectedRegion ? "content-wrapper region-selected" : "content-wrapper"}>
                <div className="map-area">
                
                    {/* ATUALIZADO: Passamos as props com os nomes corretos */}
                    <MapaInterativo3D 
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                        selectedState={estadoCodarea}      // Passa o código do estado
                        setSelectedState={setEstadoCodarea}  // Passa a função de setar o código
                        setDadosInvestimentos={(dados: DadosInvestimentos | null) => { // Tipado 'dados'
                          setDadosInvestimentos(dados); 
                          setLoadingDados(false);
                          setFetchError(null);
                        }}
                    />
                </div>

                <div className="panel-area">
                  {loadingDados && (
                    <div style={{ padding: 20, color: '#333' }}>
                      <strong>Carregando dados de investimentos...</strong>
                    </div>
                  )}
                  {!loadingDados && !dadosInvestimentos && (
                    <div style={{ padding: 20, color: '#b00' }}>
                      <strong>Não foi possível obter os dados de investimentos.</strong>
                      <div style={{ marginTop: 8 }}>
                        {fetchError ? <span>{fetchError}</span> : <span>Verifique o backend ou o arquivo local.</span>}
                      </div>
                    </div>
                  )}

                  {dadosDaRegiao && (
                    <div style={{ width: '100%' }}>
                    
                      {/* ATUALIZADO: Passamos a prop 'estadoCodarea' */}
                      <TabelaInfo
                        dadosDaRegiao={dadosDaRegiao}
                        
                        // Passamos o código do estado que veio do mapa
                        estadoCodarea={estadoCodarea}
                        
                        onClose={() => {
                          setEstadoCodarea(null); // Limpa o código do estado
                          setSelectedRegion(null); 
                        }}
                      />
                    </div>
                  )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default MapaPege;