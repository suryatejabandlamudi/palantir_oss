'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Clean, flat markers for professional look
const createFlatMarker = (color: string) => {
    return L.divIcon({
        className: 'flat-marker-icon',
        html: `<div class="marker-dot ${color}"></div><div class="marker-label ${color}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

interface Location {
    lat: number;
    lng: number;
    city: string;
    country: string;
    ip: string;
}

interface ThreatMapProps {
    home: Location;
    attacker: Location;
}

export default function ThreatMap({ home, attacker }: ThreatMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="h-full w-full bg-zinc-100 animate-pulse rounded-lg" />;

    const centerLat = (home.lat + attacker.lat) / 2;
    const centerLng = (home.lng + attacker.lng) / 2;

    const homeIcon = createFlatMarker('green');
    const attackerIcon = createFlatMarker('red');

    return (
        <>
            <style jsx global>{`
                .marker-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: white;
                    border: 3px solid currentColor;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .marker-dot.green { color: #10b981; }
                .marker-dot.red { color: #ef4444; }

                /* Clean path animation */
                .leaflet-overlay-pane path {
                    stroke-dasharray: 10;
                    animation: dash 30s linear infinite;
                }
                @keyframes dash {
                    to { stroke-dashoffset: -1000; }
                }
            `}</style>

            <MapContainer
                center={[centerLat, centerLng]}
                zoom={2}
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
                className="h-full w-full bg-zinc-50"
                style={{ height: '100%', width: '100%' }}
            >
                {/* Light / Positron Tiles for Professional Data Look */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <Marker position={[home.lat, home.lng]} icon={homeIcon}>
                    <Popup className="font-sans text-xs">
                        <strong className="text-zinc-900 block mb-1">Origin</strong>
                        {home.city}, {home.country}
                    </Popup>
                </Marker>

                <Marker position={[attacker.lat, attacker.lng]} icon={attackerIcon}>
                    <Popup className="font-sans text-xs">
                        <strong className="text-red-600 block mb-1">Anomaly</strong>
                        {attacker.city}, {attacker.country}
                    </Popup>
                </Marker>

                <Polyline
                    positions={[
                        [home.lat, home.lng],
                        [attacker.lat, attacker.lng]
                    ]}
                    pathOptions={{
                        color: '#ef4444',
                        weight: 2,
                        opacity: 0.8,
                        dashArray: '5, 10'
                    }}
                />
            </MapContainer>
        </>
    );
}
