"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardTitle, CardContent } from '@nexus/ui';
import { Badge } from '@nexus/ui';
import { Button } from '@nexus/ui';
import { useThinking } from '../ui/ThinkingContext';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);
const Polyline = dynamic(
    () => import('react-leaflet').then((mod) => mod.Polyline),
    { ssr: false }
);

// Fix Leaflet icon issues in Next.js
// We might need to configure this, but for now let's try standard approach or use div icons
// For simplicity in this artifact, we assume standard markers work or will fallback to simple squares if images missing

const SUPPLIERS = [
    { id: 'sup1', name: 'Panasonic Grid Components', lat: 34.6937, lng: 135.5023, status: 'Delayed', type: 'Supplier' }, // Osaka
    { id: 'sup2', name: 'Lithium Corp Chile', lat: -23.646, lng: -70.395, status: 'Normal', type: 'Supplier' }, // Antofagasta
    { id: 'fac1', name: 'Gigafactory Nevada', lat: 39.530, lng: -119.444, status: 'Critical', type: 'Factory' }, // Nevada
];

const ROUTES = [
    { from: 'sup1', to: 'fac1', risk: 'High', delay: '4 Days' },
    { from: 'sup2', to: 'fac1', risk: 'Low', delay: 'On Time' },
];

import { api } from '@/lib/api';

export default function ControlTower() {
    const [isMounted, setIsMounted] = useState(false);
    // Removed global agent dependency for this local simulation to avoid type errors
    // const { setThinking, setExecuting, setIdle } = useThinking(); 

    const [simState, setSimState] = useState<'normal' | 'crisis' | 'resolved'>('normal');
    const [simMessage, setSimMessage] = useState("");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!isMounted) setIsMounted(true);
    }, [isMounted]);

    // Helper to find coords
    const getCoords = (id: string) => {
        const s = SUPPLIERS.find(s => s.id === id);
        return s ? [s.lat, s.lng] as [number, number] : [0, 0] as [number, number];
    };

    const runSimulation = async () => {
        setSimState('normal');
        setSimMessage("Analyzing Supply Chain Risks...");

        // Simulate a sequence of AI "thoughts" and actions
        setTimeout(() => setSimMessage("Scanning Global News Feeds..."), 1000);

        setTimeout(() => {
            setSimMessage("Evaluating Logistics Impact: Typhoon #19...");
        }, 2500);

        setTimeout(() => {
            setSimMessage("Optimizing Logistics Network...");
            setSimState('crisis'); // Visual flair
        }, 4000);

        // Wait a moment for "Crisis" visualization then resolve with AI fix
        setTimeout(() => {
            setSimState('resolved');
            setSimMessage("Optimization Complete. Rerouting initialized.");
        }, 6000);

        // Result is purely visual in this demo component
    };

    if (!isMounted) {
        return <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Control Tower Map...</div>;
    }

    return (
        <Card className="className='w-full h-full border-slate-200">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Supply Chain Control Tower</span>
                    <div className="flex gap-2 items-center">
                        {simState === 'crisis' && <Badge variant="destructive" className="animate-pulse">CRITICAL ALERT</Badge>}
                        {simState === 'resolved' && <Badge variant="default" className="bg-green-600">OPTIMIZED</Badge>}
                        <Button onClick={runSimulation} size="sm" variant="secondary" className="ml-2 hover:bg-blue-50">
                            Simulate AI Response
                        </Button>
                        <Badge variant="outline">Global View</Badge>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[600px] relative z-0">
                <MapContainer
                    center={[20, -160]}
                    zoom={2}
                    className="h-full w-full rounded-b-lg z-0"
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {SUPPLIERS.map(s => (
                        <Marker key={s.id} position={[s.lat, s.lng]}>
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold text-sm">{s.name}</h3>
                                    <div className="text-xs text-slate-500">{s.type}</div>
                                    <div className={`mt-1 text-xs font-semibold ${s.status === 'Delayed' || s.status === 'Critical' ? 'text-red-600' : 'text-green-600'}`}>
                                        Status: {s.status}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {ROUTES.map((r, i) => (
                        <Polyline
                            key={i}
                            positions={[getCoords(r.from), getCoords(r.to)]}
                            pathOptions={{
                                color: r.risk === 'High' ? '#ef4444' : '#22c55e',
                                weight: 3,
                                dashArray: r.risk === 'High' ? '5, 10' : undefined,
                                opacity: 0.7
                            }}
                        >
                            <Popup>
                                <div className="text-xs">
                                    <strong>Route:</strong> {r.from} ➔ {r.to}<br />
                                    <strong>Risk:</strong> {r.risk}<br />
                                    <strong>Est. Delay:</strong> {r.delay}
                                </div>
                            </Popup>
                        </Polyline>
                    ))}

                </MapContainer>

                {/* Overlay Stats */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg z-[400] max-w-xs">
                    <h4 className="font-bold text-sm border-b pb-2 mb-2">Live Alerts</h4>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                            <div>
                                <span className="font-semibold block">Shipment Delayed (Osaka)</span>
                                <span className="text-slate-500">Typhoon warning in Pacific route. Impact: 4 days.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                            <div>
                                <span className="font-semibold block">Port Congestion (LA)</span>
                                <span className="text-slate-500">Wait times increased by 12 hours.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
