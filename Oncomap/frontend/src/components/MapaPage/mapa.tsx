import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import L, { type Layer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../style/MapaPage.css';
import { regioesGeoJson } from '../../data/regioes';
import localInvestimentos from '../../data/investimentos_fallback.json';
import { type DadosInvestimentos } from './TabelaInfo';

interface GeoProperties {
  codarea?: string;
  regiao?: string;
  centroide?: [number, number];
  sigla?: string;
  id?: string;
  name?: string;
  [key: string]: any;
}
type GeoFeature = Feature<Geometry, GeoProperties>;

const INITIAL_VIEW = {
  center: [-15, -54] as L.LatLngTuple,
  zoom: 4.2,
};

interface MapProps {
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;
  selectedState: string | null;
  setSelectedState: (state: string | null) => void;
  setDadosInvestimentos: (dados: DadosInvestimentos | null) => void;
  setMunicipiosData: (data: FeatureCollection | null) => void;
  searchedMunicipioName: string | null;
}

const ZoomOutButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="zoom-out-button-container">
    <button onClick={onClick} className="zoom-out-button">
      Voltar Zoom
    </button>
  </div>
);

const MapaInterativo: React.FC<MapProps> = ({
  selectedRegion,
  setSelectedRegion,
  selectedState,
  setSelectedState,
  setDadosInvestimentos,
  searchedMunicipioName,
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [hoveredObject, setHoveredObject] = useState<GeoFeature | null>(null);
  const [municipiosData, setMunicipiosData] = useState<FeatureCollection | null>(null);
  const [hoveredMunicipio, setHoveredMunicipio] = useState<GeoFeature | null>(null);
  const [loadingInvestimentos, setLoadingInvestimentos] = useState(true);

  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null); // ref para estados
  const municipiosLayerRef = useRef<L.GeoJSON | null>(null); // ref para municípios

  const allStatesFeatures = useMemo<GeoFeature[]>(
    () => Object.values(regioesGeoJson).flatMap((r) => r.features as GeoFeature[]),
    []
  );

  // Carregar investimentos
  useEffect(() => {
    async function fetchInvestimentos() {
      try {
        const response = await fetch('http://localhost:3001/api/map/investimentos');
        if (!response.ok) throw new Error(`Resposta não-ok: ${response.status}`);
        const data: DadosInvestimentos = await response.json();
        setDadosInvestimentos(data);
      } catch (error) {
        console.warn('Erro ao buscar dados do backend, usando fallback local:', error);
        setDadosInvestimentos(localInvestimentos as DadosInvestimentos);
      } finally {
        setLoadingInvestimentos(false);
      }
    }
    fetchInvestimentos();
  }, [setDadosInvestimentos]);

  // Corrigir tamanho do mapa ao mudar de estado/região
  useEffect(() => {
    if (map) setTimeout(() => map.invalidateSize(), 500);
  }, [map, selectedRegion, selectedState]);

  // Foco na região ou estado selecionado
  useEffect(() => {
    if (!map) return;
    if (selectedRegion && !selectedState && geoJsonLayerRef.current) {
      const bounds = geoJsonLayerRef.current.getBounds();
      if (bounds.isValid()) map.flyToBounds(bounds, { padding: [50, 50], duration: 1.0 });
    } else if (!selectedRegion && !selectedState) {
      map.flyTo(INITIAL_VIEW.center, INITIAL_VIEW.zoom, { duration: 1.0 });
    }
  }, [selectedRegion, selectedState, map]);

  // Carregar municípios do estado selecionado
  useEffect(() => {
    if (selectedState) {
      const codigoUF = selectedState;
      if (codigoUF === '53') {
        setMunicipiosData(null);
        return;
      }
      const nomeDoArquivo = `geojs-${codigoUF}-mun`;
      import(`../../data/municipios/${nomeDoArquivo}.json`)
        .then((module) => setMunicipiosData(module.default || module))
        .catch((_err) => {
          console.error(`Falha ao carregar o arquivo de municípios: geojs-${codigoUF}-mun.json`);
          setMunicipiosData(null);
        });
    } else {
      setMunicipiosData(null);
    }
  }, [selectedState]);

  // Função de resetar o zoom
  const handleResetView = () => {
    if (map) {
      if (selectedState) setSelectedState(null);
      else if (selectedRegion) setSelectedRegion(null);
    }
  };

  const statesStyle = (feature?: GeoFeature) => {
    if (!feature) return {};
    let fillColor = '#0D4B55';
    const highlightColor = '#FF8C00';

    if (selectedState) {
      return { fillColor: highlightColor, weight: 1, color: 'white', fillOpacity: 1 };
    }

    if (hoveredObject) {
      if (selectedRegion) {
        if (hoveredObject.properties.codarea === feature.properties.codarea)
          fillColor = highlightColor;
      } else {
        if (hoveredObject.properties.regiao === feature.properties.regiao)
          fillColor = highlightColor;
      }
    }
    return { fillColor, weight: 1, color: 'white', fillOpacity: 1 };
  };

  const onEachStateFeature = (feature: GeoFeature, layer: Layer) => {
    const stateName = feature.properties.name || 'Estado';
    layer.bindTooltip(stateName, { sticky: true });

    layer.on({
      mouseover: () => setHoveredObject(feature),
      mouseout: () => setHoveredObject(null),
      click: (event: any) => {
        if (!selectedRegion) {
          setSelectedRegion(feature.properties.regiao || null);
        } else if (map && !selectedState) {
          map.flyToBounds(event.target.getBounds(), { padding: [50, 50], duration: 0.8 });
          setSelectedState(feature.properties.codarea || null);
        }
      },
    });
  };

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
      mouseover: (event: any) => {
        setHoveredMunicipio(feature);
        event.target.setStyle({ weight: 2, color: '#FF8C00' });
      },
      mouseout: (event: any) => {
        setHoveredMunicipio(null);
        event.target.setStyle({ weight: 1, color: 'white' });
      },
    });
  };

  // --- NOVO USEEFFECT: DESTACAR MUNICÍPIO PESQUISADO (SEM ZOOM) ---
  useEffect(() => {
    if (!municipiosData || !municipiosLayerRef.current) return;

    const nomeBusca = searchedMunicipioName
      ? searchedMunicipioName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : null;

    municipiosLayerRef.current.eachLayer((layer: any) => {
      const nomeMunicipio = layer.feature?.properties?.name
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (nomeBusca && nomeMunicipio === nomeBusca) {
        layer.setStyle({
          color: '#FFD700',
          weight: 3,
          fillColor: '#FFB800',
          fillOpacity: 1,
        });
      } else {
        layer.setStyle(municipiosStyle(layer.feature));
      }
    });
  }, [searchedMunicipioName, municipiosData]);

  const dataForStatesLayer = useMemo(() => {
    if (selectedState) {
      const stateFeature = allStatesFeatures.find((f) => f.properties.codarea === selectedState);
      return stateFeature
        ? { type: 'FeatureCollection', features: [stateFeature] }
        : { type: 'FeatureCollection', features: [] };
    }
    if (selectedRegion) {
      return (
        regioesGeoJson[selectedRegion as keyof typeof regioesGeoJson] || {
          type: 'FeatureCollection',
          features: [],
        }
      );
    }
    return { type: 'FeatureCollection', features: allStatesFeatures };
  }, [selectedRegion, selectedState, allStatesFeatures]);

  if (loadingInvestimentos) {
    return <div className="mapa-loading">Carregando dados...</div>;
  }

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
        {/* CAMADA DE ESTADOS */}
        <GeoJSON
          ref={geoJsonLayerRef}
          key={`${selectedRegion || 'brasil'}-${selectedState || 'none'}`}
          data={dataForStatesLayer as any}
          style={statesStyle}
          onEachFeature={onEachStateFeature}
        />

        {/* CAMADA DE MUNICÍPIOS */}
        {municipiosData && (
          <GeoJSON
            ref={municipiosLayerRef}
            key={selectedState}
            data={municipiosData as any}
            style={municipiosStyle}
            onEachFeature={onEachMunicipioFeature}
          />
        )}

        {(selectedRegion || selectedState) && <ZoomOutButton onClick={handleResetView} />}
      </MapContainer>
    </div>
  );
};

export default MapaInterativo;
