// src/pages/MapaPage.tsx

// --- ALTERAÇÃO 1: Removido 'useEffect' da importação ---
import React, { useState } from 'react';
import MapaInterativo from "../components/MapaPage/mapa";
import Footer from "../components/Geral/footer";
import TabelaInfo, { type DadosRegiao, type DadosInvestimentos } from '../components/MapaPage/TabelaInfo';
import '../style/MapaPage.css';
import type { FeatureCollection } from 'geojson';

const MapaPege: React.FC = () => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [estadoCodarea, setEstadoCodarea] = useState<string | null>(null);
    const [dadosInvestimentos, setDadosInvestimentos] = useState<DadosInvestimentos | null>(null);
    const [loadingDados, setLoadingDados] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    
    const [municipiosData, setMunicipiosData] = useState<FeatureCollection | null>(null);
    const [searchedMunicipioName, setSearchedMunicipioName] = useState<string | null>(null);

    const handleSetSelectedRegion = (region: string | null) => {
        setSelectedRegion(region);
        setEstadoCodarea(null);
        setSearchedMunicipioName(null);
    };
    
    const handleSetEstadoCodarea = (codarea: string | null) => {
        setEstadoCodarea(codarea);
        setSearchedMunicipioName(null);
    }

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
                    <MapaInterativo
                        selectedRegion={selectedRegion}
                        setSelectedRegion={handleSetSelectedRegion}
                        selectedState={estadoCodarea}
                        setSelectedState={handleSetEstadoCodarea}
                        setDadosInvestimentos={(dados: DadosInvestimentos | null) => {
                          setDadosInvestimentos(dados);
                          setLoadingDados(false); // Esta linha já estava correta
                          // Adicionamos a lógica de erro aqui também
                          if (!dados) {
                            setFetchError("Falha ao carregar os dados de investimentos.");
                          }
                        }}
                        setMunicipiosData={setMunicipiosData}
                        searchedMunicipioName={searchedMunicipioName}
                    />
                </div>

                <div className="panel-area">
                  {/* --- ALTERAÇÃO 2: Usando as variáveis de estado para feedback --- */}
                  {loadingDados && (
                    <div className="panel-message">
                      <strong>Carregando dados...</strong>
                    </div>
                  )}

                  {fetchError && !loadingDados && (
                    <div className="panel-message error">
                      <strong>Erro ao carregar dados.</strong>
                      <span>{fetchError}</span>
                    </div>
                  )}

                  {/* A TabelaInfo só aparece se os dados existirem */}
                  {!loadingDados && !fetchError && dadosDaRegiao && (
                    <div style={{ width: '100%' }}>
                      <TabelaInfo
                        dadosDaRegiao={dadosDaRegiao}
                        estadoCodarea={estadoCodarea}
                        onClose={() => {
                          setEstadoCodarea(null);
                          setSelectedRegion(null);
                          setSearchedMunicipioName(null);
                        }}
                        municipiosDoEstadoGeoJSON={municipiosData}
                        setSearchedMunicipioName={setSearchedMunicipioName}
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