
'use client';

import React from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// MapLibre style (Dark Matter equivalent)
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_VIEW_STATE = {
    longitude: -122.4194, // San Francisco
    latitude: 37.7749,
    zoom: 10,
    pitch: 45,
    bearing: 0
};

export default function GothamMap({ factories = [], trucks = [], missionLayers = [], onSelectObject }: any) {
    const layers = [
        // Factories (Red, Stationary)
        new ScatterplotLayer({
            id: 'factories',
            data: factories,
            pickable: true,
            opacity: 0.8,
            stroked: true,
            filled: true,
            radiusScale: 10,
            radiusMinPixels: 8,
            radiusMaxPixels: 30,
            lineWidthMinPixels: 2,
            getPosition: (d: any) => {
                if (d.properties?.latitude && d.properties?.longitude) {
                    return [Number(d.properties.longitude), Number(d.properties.latitude)];
                } else if (d.latitude && d.longitude) { // Handle un-nested
                    return [Number(d.longitude), Number(d.latitude)];
                }
                return [0, 0];
            },
            getFillColor: [239, 68, 68], // Red-500
            getLineColor: [255, 255, 255],
            onClick: ({ object }: any) => onSelectObject(object)
        }),

        // Trucks (Orange, Moving)
        new ScatterplotLayer({
            id: 'trucks',
            data: trucks,
            pickable: true,
            opacity: 0.9,
            stroked: true,
            filled: true,
            radiusScale: 10,
            radiusMinPixels: 5,
            radiusMaxPixels: 15,
            lineWidthMinPixels: 1,
            getPosition: (d: any) => {
                if (d.properties?.latitude && d.properties?.longitude) {
                    return [Number(d.properties.longitude), Number(d.properties.latitude)];
                } else if (d.latitude && d.longitude) {
                    return [Number(d.longitude), Number(d.latitude)];
                }
                return [0, 0];
            },
            getFillColor: [245, 158, 11], // Amber-500
            getLineColor: [0, 0, 0],
            onClick: ({ object }: any) => onSelectObject(object)
        }),

        // Mission Overlays (Zones)
        new GeoJsonLayer({
            id: 'mission-layers',
            data: missionLayers,
            pickable: true,
            stroked: true,
            filled: true,
            extruded: false,
            lineWidthScale: 20,
            lineWidthMinPixels: 2,
            getFillColor: [255, 0, 0, 50], // Red with transparency
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
