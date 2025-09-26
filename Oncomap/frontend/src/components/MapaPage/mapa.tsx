import React, { useState, useMemo, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import type { Feature, Geometry } from 'geojson';
import type { MapViewState, PickingInfo, ViewStateChangeParameters } from '@deck.gl/core';
import { GeoJsonLayer } from '@deck.gl/layers';
import StaticMap from 'react-map-gl';
import type { StyleSpecification } from 'mapbox-gl';
import { regioesGeoJson } from '../../data/regioes';

// --- DEFINIÇÃO DE TIPOS ---
interface EstadoProperties {
  codarea: string;
  regiao?: string;
  centroide?: [number, number];
  [key: string]: any;
}
type EstadoFeature = Feature<Geometry, EstadoProperties>;

// --- TOKEN E ESTILO DE MAPA ---
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

const BLANK_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: 'Blank',
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#ffffff',
      },
    },
  ],
};

// --- ESTADOS DE VISUALIZAÇÃO DA CÂMERA ---
const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -54,
  latitude: -15,
  zoom: 3.2,
  minZoom: 3.2,
  maxZoom: 10,
  pitch: 45,
  bearing: 0,
};

const REGION_VIEW_STATES = {
  norte: { longitude: -65, latitude: -5, zoom: 4.2, pitch: 45 },
  nordeste: { longitude: -47, latitude: -8, zoom: 4.5, pitch: 45 },
  centroOeste: { longitude: -59, latitude: -15, zoom: 4.5, pitch: 45 },
  sudeste: { longitude: -50, latitude: -21, zoom: 4.9, pitch: 45 },
  sul: { longitude: -57, latitude: -28, zoom: 4.9, pitch: 45 },
};

// --- PROPS DO COMPONENTE ---
interface MapProps {
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;
}

// --- COMPONENTE PRINCIPAL ---
const MapaInterativo3D: React.FC<MapProps> = ({ selectedRegion, setSelectedRegion }) => {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [hoveredState, setHoveredState] = useState<EstadoFeature | null>(null);

  useEffect(() => {
    if (selectedRegion) {
      const newViewState = REGION_VIEW_STATES[selectedRegion as keyof typeof REGION_VIEW_STATES];
      setViewState(vs => ({ ...vs, ...newViewState, bearing: 0, transitionDuration: 800 }));
    } else {
      setViewState(vs => ({ ...vs, ...INITIAL_VIEW_STATE, transitionDuration: 800 }));
    }
  }, [selectedRegion]);

  const allStatesFeatures = useMemo<EstadoFeature[]>(
    () => Object.values(regioesGeoJson).flatMap(region => region.features as EstadoFeature[]),
    []
  );

  const layers = [
    new GeoJsonLayer({
      id: 'geojson-layer',
      data: selectedRegion
        ? regioesGeoJson[selectedRegion as keyof typeof regioesGeoJson].features
        : allStatesFeatures,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: 20000,
      lineWidthMinPixels: 1,
      getFillColor: f => {
        if (!hoveredState) return [13, 75, 85, 255];
        if (selectedRegion) {
          return hoveredState.properties.codarea === f.properties.codarea
            ? [255, 140, 0, 255] : [13, 75, 85, 255];
        } else {
          return hoveredState.properties.regiao === f.properties.regiao
            ? [255, 140, 0, 255] : [13, 75, 85, 255];
        }
      },
      getLineColor: [255, 255, 255, 255],
      getLineWidth: 1,
      updateTriggers: {
        getFillColor: [hoveredState, selectedRegion],
      },
      onHover: (info: PickingInfo<EstadoFeature>) => setHoveredState(info.object || null),
      onClick: (info: PickingInfo<EstadoFeature>) => {
        // Só permite clicar para selecionar uma região se já não houver uma selecionada
        if (!selectedRegion) {
          const region = info.object?.properties.regiao;
          if (region) {
            setSelectedRegion(region);
          }
        }
      },
    }),
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      
      {/* ================================================================== */}
      {/* --- BOTÃO DE VOLTAR ADICIONADO AQUI --- */}
      {/* Ele só aparece se 'selectedRegion' tiver um valor */}
      {selectedRegion && (
        <button
          // Ao clicar, chama a função para limpar a região selecionada
          onClick={() => setSelectedRegion(null)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1, // Garante que fique na frente do mapa
            padding: '10px 15px',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            fontWeight: 'bold',
          }}
        >
          Ver Brasil
        </button>
      )}
      {/* ================================================================== */}

      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        viewState={viewState}
        onViewStateChange={(params: ViewStateChangeParameters) => {
          setViewState(params.viewState as MapViewState);
        }}
      >
        <StaticMap
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={BLANK_MAP_STYLE}
        />
      </DeckGL>
    </div>
  );
};

export default MapaInterativo3D;