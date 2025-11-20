'use client';

import React from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// MapLibre style (Dark Matter equivalent)
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_VIEW_STATE = {
    longitude: 103.8198, // Singapore
    latitude: 1.3521,
    zoom: 3,
    pitch: 0,
    bearing: 0
};

export default function GothamMap({ ports, vessels, missionLayers = [], onSelectObject }: any) {
    const layers = [
        new ScatterplotLayer({
            id: 'ports',
            data: ports,
            pickable: true,
            opacity: 0.8,
            stroked: true,
            filled: true,
            radiusScale: 6,
            radiusMinPixels: 5,
            radiusMaxPixels: 20,
            lineWidthMinPixels: 1,
            getPosition: (d: any) => {
                if (!d.properties?.coordinates) return [0, 0];
                const [lat, lon] = d.properties.coordinates.split(',').map(Number);
                return [lon, lat];
            },
            getFillColor: [16, 185, 129], // Emerald-500
            getLineColor: [0, 0, 0],
            onClick: ({ object }: any) => onSelectObject(object)
        }),
        new ScatterplotLayer({
            id: 'vessels',
            data: vessels,
            pickable: true,
            opacity: 0.8,
            stroked: true,
            filled: true,
            radiusScale: 6,
            radiusMinPixels: 3,
            radiusMaxPixels: 10,
            lineWidthMinPixels: 1,
            getPosition: (d: any) => {
                // Use real coordinates if available, else random for demo
                if (d.latitude && d.longitude) {
                    return [Number(d.longitude), Number(d.latitude)];
                }
                return [103.8 + (Math.random() - 0.5) * 20, 1.3 + (Math.random() - 0.5) * 20];
            },
            getFillColor: [59, 130, 246], // Blue-500
            getLineColor: [0, 0, 0],
            onClick: ({ object }: any) => onSelectObject(object)
        }),
        new GeoJsonLayer({
            id: 'mission-layers',
            data: missionLayers,
            pickable: true,
            stroked: true,
            filled: true,
            extruded: false,
            lineWidthScale: 20,
            lineWidthMinPixels: 2,
            getFillColor: [255, 0, 0, 100], // Red with transparency
            getLineColor: [255, 0, 0, 255],
            getRadius: 100,
            getLineWidth: 1,
            getElevation: 30
        })
    ];

    return (
        <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={layers}
            getTooltip={({ object }: any) => object && object.title}
        >
            <Map reuseMaps mapStyle={MAP_STYLE} />
        </DeckGL>
    );
}
