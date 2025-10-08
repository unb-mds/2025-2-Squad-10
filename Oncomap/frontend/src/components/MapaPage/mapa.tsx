import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import L, { Layer } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { regioesGeoJson } from '../../data/regioes';
import {siglaParaCodigoUF } from '../../data/mapeamentos';


// --- Tipagem e Constantes ---
interface GeoProperties {
  codarea: string;
  regiao?: string;
  centroide?: [number, number];
  sigla?: string;
  [key:string]: any;
}
type GeoFeature = Feature<Geometry, GeoProperties>;

const INITIAL_VIEW = {
  center: [-15, -54] as L.LatLngTuple,
  zoom: 4.2,
};

const REGION_VIEWS = {
  norte: { center: [-5, -60] as L.LatLngTuple, zoom: 4.8 },
  nordeste: { center: [-8, -42] as L.LatLngTuple, zoom: 5.4 },
  centroOeste: { center: [-15, -54] as L.LatLngTuple, zoom: 5.4 },
  sudeste: { center: [-20.5, -45.5] as L.LatLngTuple, zoom: 5.4 },
  sul: { center: [-28.5, -52] as L.LatLngTuple, zoom: 5.8 },
};

// --- Props do Componente ---
interface MapProps {
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;
  selectedState: string | null;
  setSelectedState: (state: string | null) => void;
}

// --- Componente para Animação do Mapa (Agora mais completo) ---
const ChangeView: React.FC<{ 
  region: string | null; 
  state: string | null;
  allStates: GeoFeature[];
}> = ({ region, state, allStates }) => {
  const map = useMap();

  useEffect(() => {
    // Nível 3: Zoom no Estado
    if (state) {
      const stateFeature = allStates.find(f => f.properties.sigla === state);
      if (stateFeature?.properties.centroide) {
        const [lon, lat] = stateFeature.properties.centroide;
        map.flyTo([lat, lon], 7, { duration: 0.8 });
      }
    } 
    // Nível 2: Zoom na Região
    else if (region) {
      const { center, zoom } = REGION_VIEWS[region as keyof typeof REGION_VIEWS];
      map.flyTo(center, zoom, { duration: 0.8 });
    } 
    // Nível 1: Visão do Brasil
    else {
      map.flyTo(INITIAL_VIEW.center, INITIAL_VIEW.zoom, { duration: 0.8 });
    }
  }, [region, state, map, allStates]);

  return null;
};

// --- Componente Principal ---
const MapaInterativo3D: React.FC<MapProps> = ({
  selectedRegion, setSelectedRegion,
  selectedState, setSelectedState
}) => {
  const [hoveredObject, setHoveredObject] = useState<GeoFeature | null>(null);
  const [municipiosData, setMunicipiosData] = useState<FeatureCollection | null>(null);

  const allStatesFeatures = useMemo<GeoFeature[]>(
    () => Object.values(regioesGeoJson).flatMap(r => r.features as GeoFeature[]),
    []
  );

  // Efeito para carregar dados dos municípios
  useEffect(() => {
    if (selectedState) {
      const codigoUF = siglaParaCodigoUF[selectedState];
      if (!codigoUF) {
          console.error(`Código UF para a sigla ${selectedState} não encontrado.`);
        return;
      }
      const nomeDoArquivo = `geojs-${codigoUF}-mun`;
      import(`../../data/municipios/${nomeDoArquivo}.json`)
        .then(module => {
          setMunicipiosData(module.default || module);
        })
        .catch(err => {
          console.error(`Falha ao carregar municípios para ${selectedState}`, err);
          setMunicipiosData(null);
        });
    } else {
      // Limpa os dados dos municípios ao voltar para a visão de região/Brasil
      setMunicipiosData(null);
    }
  }, [selectedState]);

  // Lógica de navegação de volta
  const handleBackClick = () => {
    if (selectedState) {
      setSelectedState(null);
    } else if (selectedRegion) {
      setSelectedRegion(null);
    }
  };

  // --- Funções de Estilo e Eventos para ESTADOS ---
  const statesStyle = (feature?: GeoFeature) => {
    if (!feature) return {};
    let fillColor = '#0D4B55'; // Cor Padrão
    const highlightColor = '#FF8C00'; // Cor de Destaque

    if (hoveredObject) {
      if (selectedRegion) { // Visão de Região
        if (hoveredObject.properties.codarea === feature.properties.codarea) {
          fillColor = highlightColor;
        }
      } else { // Visão do Brasil
        if (hoveredObject.properties.regiao === feature.properties.regiao) {
          fillColor = highlightColor;
        }
      }
    }
    
    return { fillColor, weight: 1, color: 'white', fillOpacity: 1 };
  };

  const onEachStateFeature = (feature: GeoFeature, layer: Layer) => {
    layer.on({
      mouseover: () => setHoveredObject(feature),
      mouseout: () => setHoveredObject(null),
      click: () => {
        if (!selectedRegion) {
          setSelectedRegion(feature.properties.regiao || null);
        } else {
          setSelectedState(feature.properties.sigla || null);
        }
      },
    });
  };

  const dataForStatesLayer = selectedRegion 
    ? regioesGeoJson[selectedRegion as keyof typeof regioesGeoJson]
    : { type: 'FeatureCollection', features: allStatesFeatures };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {(selectedRegion || selectedState) && (
        <button onClick={handleBackClick} style={{
          position: 'absolute', top: '20px', left: '20px', zIndex: 1000,
          padding: '10px 15px', cursor: 'pointer', borderRadius: '8px',
          border: '1px solid #ccc', backgroundColor: 'white', fontWeight: 'bold',
        }}>
          {selectedState ? 'Ver Região' : 'Ver Brasil'}
        </button>
      )}

      <MapContainer 
        center={INITIAL_VIEW.center} 
        zoom={INITIAL_VIEW.zoom} 
        style={{ height: '100%', width: '100%', backgroundColor: '#ffffff' }}
      >
        {/* <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        /> */}

        {/* Camada de Estados (visível apenas na visão Brasil/Região) */}
        {!selectedState && (
          <GeoJSON
            key={selectedRegion || 'brasil'}
            data={dataForStatesLayer as any}
            style={statesStyle}
            onEachFeature={onEachStateFeature}
          />
        )}

        {/* Camada de Municípios (visível apenas na visão de Estado) */}
        {municipiosData && (
          <GeoJSON
            key={selectedState}
            data={municipiosData as any}
            style={{
              weight: 0.5,
              color: '#666',
              fillColor: '#0D4B55',
              fillOpacity: 0.6
            }}
          />
        )}
        
        <ChangeView region={selectedRegion} state={selectedState} allStates={allStatesFeatures} />
      </MapContainer>
    </div>
  );
};

export default MapaInterativo3D;