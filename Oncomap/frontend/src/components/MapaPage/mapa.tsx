import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import L, { type Layer, type LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { regioesGeoJson } from '../../data/regioes';

// --- Tipagem e Constantes ---
interface GeoProperties {
  codarea?: string;
  regiao?: string;
  centroide?: [number, number];
  sigla?: string;
  id?: string;
  name?: string;
  [key:string]: any;
}
type GeoFeature = Feature<Geometry, GeoProperties>;

const INITIAL_VIEW = {
  center: [-15, -54] as L.LatLngTuple,
  zoom: 4.2,
};

const REGION_VIEWS = {
  norte: { center: [-5.5, -57] as L.LatLngTuple, zoom: 4.3 },
  nordeste: { center: [-9, -42] as L.LatLngTuple, zoom: 4.7 },
  centroOeste: { center: [-15, -54] as L.LatLngTuple, zoom: 4.6 },
  sudeste: { center: [-20.2, -45.5] as L.LatLngTuple, zoom: 5 },
  sul: { center: [-28, -52] as L.LatLngTuple, zoom: 5 },
};

// --- Props do Componente ---
interface MapProps {
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;
  selectedState: string | null;
  setSelectedState: (state: string | null) => void;
}

// --- Componente para Animação do Mapa ---
const ChangeView: React.FC<{ region: string | null }> = ({ region }) => {
  const map = useMap();

  useEffect(() => {
    if (region) {
      const { center, zoom } = REGION_VIEWS[region as keyof typeof REGION_VIEWS];
      map.flyTo(center, zoom, { duration: 0.8 });
    } else {
      map.flyTo(INITIAL_VIEW.center, INITIAL_VIEW.zoom, { duration: 0.8 });
    }
  }, [region, map]);

  return null;
};

// --- Componente Principal ---
const MapaInterativo: React.FC<MapProps> = ({
  selectedRegion, setSelectedRegion,
  selectedState, setSelectedState
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [hoveredObject, setHoveredObject] = useState<GeoFeature | null>(null);
  const [municipiosData, setMunicipiosData] = useState<FeatureCollection | null>(null);
  const [hoveredMunicipio, setHoveredMunicipio] = useState<GeoFeature | null>(null);

  const allStatesFeatures = useMemo<GeoFeature[]>(
    () => Object.values(regioesGeoJson).flatMap(r => r.features as GeoFeature[]),
    []
  );

  useEffect(() => {
    if (selectedState) {
      const codigoUF = selectedState;
      const nomeDoArquivo = `geojs-${codigoUF}-mun`;
      
      import(`../../data/municipios/${nomeDoArquivo}.json`)
        .then(module => setMunicipiosData(module.default || module))
        .catch(err => {
          console.error(`Falha ao carregar o arquivo de municípios: geojs-${codigoUF}-mun.json`, err);
          setMunicipiosData(null);
        });
    } else {
      setMunicipiosData(null);
    }
  }, [selectedState]);
  
  // Funções para a camada de ESTADOS
  const statesStyle = (feature?: GeoFeature) => {
    if (!feature) return {};
    let fillColor = '#0D4B55';
    const highlightColor = '#FF8C00';
    if (hoveredObject) {
      if (selectedRegion) {
        if (hoveredObject.properties.codarea === feature.properties.codarea) fillColor = highlightColor;
      } else {
        if (hoveredObject.properties.regiao === feature.properties.regiao) fillColor = highlightColor;
      }
    }
    return { fillColor, weight: 1, color: 'white', fillOpacity: 1 };
  };

  const onEachStateFeature = (feature: GeoFeature, layer: Layer) => {
    layer.on({
      mouseover: () => setHoveredObject(feature),
      mouseout: () => setHoveredObject(null),
      click: (event: LeafletMouseEvent) => {
        if (!selectedRegion) {
          setSelectedRegion(feature.properties.regiao || null);
        } else {
          if (map) {
            map.flyToBounds(event.target.getBounds(), { padding: [50, 50], duration: 0.8 });
          }
          setSelectedState(feature.properties.codarea || null);
        }
      },
    });
  };

  // Funções para a camada de MUNICÍPIOS
  const municipiosStyle = (feature?: GeoFeature) => {
    if (!feature) return {};
    const isHovered = hoveredMunicipio?.properties.id === feature.properties.id;
    return {
      weight: 1,
      color: 'white',
      fillColor: isHovered ? '#FF8C00' : '#0D4B55',
      fillOpacity: 1,
    };
  };

  const onEachMunicipioFeature = (feature: GeoFeature, layer: Layer) => {
    const municipioName = feature.properties.name || 'Nome não disponível';
    layer.bindTooltip(municipioName, { sticky: true });
    layer.on({
      mouseover: (event: LeafletMouseEvent) => {
        setHoveredMunicipio(feature);
        event.target.setStyle({ weight: 2, color: '#FF8C00' });
      },
      mouseout: (event: LeafletMouseEvent) => {
        setHoveredMunicipio(null);
        event.target.setStyle({ weight: 1, color: 'white' });
      },
    });
  };

  const dataForStatesLayer = selectedRegion 
    ? regioesGeoJson[selectedRegion as keyof typeof regioesGeoJson]
    : { type: 'FeatureCollection', features: allStatesFeatures };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer 
        center={INITIAL_VIEW.center} 
        zoom={INITIAL_VIEW.zoom} 
        style={{ height: '100%', width: '100%', backgroundColor: '#fff' }}
        ref={setMap}
        zoomControl={false}
        attributionControl={false}
      >
        {!selectedState && (
          <GeoJSON
            key={selectedRegion || 'brasil'}
            data={dataForStatesLayer as any}
            style={statesStyle}
            onEachFeature={onEachStateFeature}
          />
        )}

        {municipiosData && (
          <GeoJSON
            key={selectedState}
            data={municipiosData as any}
            style={municipiosStyle}
            onEachFeature={onEachMunicipioFeature}
          />
        )}
        
        <ChangeView region={selectedRegion} />
      </MapContainer>
    </div>
  );
};

export default MapaInterativo;