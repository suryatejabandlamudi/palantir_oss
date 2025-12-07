'use client';

import React, { useEffect, useState } from 'react';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Map, Layers, Search, Filter, Truck, Factory, Play, Square, Save, Radio } from 'lucide-react';
import { Button, Input } from '@nexus/ui';
import { api } from '@/lib/api';
import GothamMap from '@/components/GothamMap';

export default function GothamPage() {
    const [factories, setFactories] = useState<any[]>([]);
    const [trucks, setTrucks] = useState<any[]>([]);
    const [selectedObject, setSelectedObject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Mission State
    const [isMissionMode, setIsMissionMode] = useState(false);
    const [missionLayers, setMissionLayers] = useState<any[]>([]);
    const [missionTitle, setMissionTitle] = useState("Operation Guardian");

    // Live State
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    // Live Polling
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLive) {
            interval = setInterval(async () => {
                // Trigger simulation
                await fetch('http://localhost:8000/gotham/simulate', { method: 'POST' });
                // Reload data
                loadData();
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isLive]);

    async function loadData() {
        try {
            const types = await api.getObjectTypes();
            console.log("Loaded object types:", types);

            // Look for 'factory' and 'truck'
            const factoryType = types.find((t: any) => t.api_name === 'factory');
            const truckType = types.find((t: any) => t.api_name === 'truck');
            console.log("Found types:", { factoryType, truckType });

            if (factoryType) {
                const data = await api.getObjects(factoryType.id);
                console.log("Loaded factories:", data);
                setFactories(data);
            }
            if (truckType) {
                const data = await api.getObjects(truckType.id);
                console.log("Loaded trucks:", data);
                setTrucks(data);
            }
        } catch (e) {
            console.error("Failed to load Gotham data", e);
        } finally {
            setLoading(false);
        }
    }

    const handleAddZone = () => {
        // Mock adding a restricted zone polygon
        const newZone = {
            type: "Feature",
            properties: { name: "Restricted Zone", type: "zone" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-122.45, 37.75],
                    [-122.40, 37.75],
                    [-122.40, 37.80],
                    [-122.45, 37.80],
                    [-122.45, 37.75]
                ]]
            }
        };
        setMissionLayers([...missionLayers, newZone]);
    };

    const handleSaveMission = async () => {
        try {
            await fetch('http://localhost:8000/gotham/missions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: missionTitle,
                    status: "ACTIVE",
                    layers: missionLayers
                })
            });
            alert("Mission saved successfully!");
        } catch (e) {
            console.error("Failed to save mission", e);
        }
    };

    return (
        <WorkspaceLayout
            sidebar={
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800">
                        <Input placeholder="Search locations..." />
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        {isMissionMode ? (
                            <div className="mb-6 bg-blue-900/20 border border-blue-800 p-4 rounded">
                                <h3 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <Map className="w-3 h-3" />
                                    Mission Planning
                                </h3>
                                <Input
                                    value={missionTitle}
                                    onChange={(e) => setMissionTitle(e.target.value)}
                                    className="mb-3 text-sm"
                                />
                                <div className="space-y-2">
                                    <Button size="sm" className="w-full justify-start" onClick={handleAddZone}>
                                        <Square className="w-3 h-3 mr-2" />
                                        Draw Restricted Zone
                                    </Button>
                                    <Button size="sm" variant="primary" className="w-full justify-start" onClick={handleSaveMission}>
                                        <Save className="w-3 h-3 mr-2" />
                                        Save Mission Plan
                                    </Button>
                                </div>
                            </div>
                        ) : null}

                        <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Active Layers</h3>
                        <LayerItem name="Factories" active count={factories.length} icon={<Factory className="w-3 h-3" />} />
                        <LayerItem name="Trucks" active count={trucks.length} icon={<Truck className="w-3 h-3" />} />
                        {missionLayers.length > 0 && (
                            <LayerItem name="Mission Overlays" active count={missionLayers.length} icon={<Map className="w-3 h-3 text-red-400" />} />
                        )}

                        <h3 className="text-xs font-bold text-gray-400 mt-6 mb-3 uppercase tracking-wider">Objects</h3>
                        {loading ? (
                            <div className="text-xs text-gray-500">Loading geospatial data...</div>
                        ) : (
                            <div className="space-y-1">
                                {factories.slice(0, 5).map(p => (
                                    <ObjectItem key={p.id} title={p.title} type="Factory" onClick={() => setSelectedObject(p)} />
                                ))}
                                {trucks.slice(0, 5).map(v => (
                                    <ObjectItem key={v.id} title={v.title} type="Truck" onClick={() => setSelectedObject(v)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            }
            bottomPanel={
                <div className="h-full flex flex-col">
                    <div className="h-8 bg-[#1C2127] border-b border-gray-800 flex items-center px-4">
                        <span className="text-xs font-bold text-gray-400">SELECTED OBJECT DETAILS</span>
                    </div>
                    <div className="flex-1 p-4 overflow-auto bg-[#0D1117]">
                        {selectedObject ? (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-500 text-xs uppercase">Title</div>
                                    <div className="text-white font-bold">{selectedObject.title}</div>
                                </div>
                                {Object.entries(selectedObject.properties || {}).map(([k, v]: any) => (
                                    <div key={k}>
                                        <div className="text-gray-500 text-xs uppercase">{k}</div>
                                        <div className="text-gray-300">{v}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 italic">Select an object on the map or sidebar to view details</div>
                        )}
                    </div>
                </div>
            }
        >
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="h-12 border-b border-gray-800 flex items-center px-6 justify-between bg-[#111418]">
                    <h1 className="font-bold text-white flex items-center gap-2">
                        <Map className="w-4 h-4 text-emerald-500" />
                        Gotham: Supply Chain Control Tower
                    </h1>
                    <div className="flex gap-2">
                        <Button
                            variant={isLive ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => setIsLive(!isLive)}
                            className={isLive ? "animate-pulse" : ""}
                        >
                            <Radio className="w-3 h-3 mr-1" />
                            {isLive ? "LIVE FEED ON" : "GO LIVE"}
                        </Button>
                        <div className="w-px h-6 bg-gray-700 mx-2"></div>
                        <Button
                            variant={isMissionMode ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => setIsMissionMode(!isMissionMode)}
                        >
                            <Map className="w-3 h-3 mr-1" />
                            {isMissionMode ? "EXIT PLANNING" : "MISSION PLANNING"}
                        </Button>
                    </div>
                </div>

                {/* Map Visualization */}
                <div className="flex-1 bg-[#1a2332] relative overflow-hidden">
                    <GothamMap
                        factories={factories}
                        trucks={trucks}
                        missionLayers={missionLayers}
                        onSelectObject={setSelectedObject}
                    />

                    <div className="absolute bottom-4 right-4 bg-black/50 p-2 rounded text-xs text-gray-400 pointer-events-none flex items-center gap-2">
                        {isLive && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                        {isLive ? "Live Feed Active" : "Historical View"} • {factories.length} Factories • {trucks.length} Trucks
                    </div>
                </div>
            </div>
        </WorkspaceLayout>
    );
}

function LayerItem({ name, active, count, icon }: any) {
    return (
        <div className={`px-3 py-2 rounded text-sm mb-1 cursor-pointer transition-colors ${active ? 'bg-emerald-900/20 text-emerald-400' : 'text-gray-400 hover:bg-gray-800'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <span>{name}</span>
                </div>
                <span className="text-xs text-gray-600">{count}</span>
            </div>
        </div>
    );
}

function ObjectItem({ title, type, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className="px-3 py-2 rounded text-xs cursor-pointer text-gray-400 hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-between"
        >
            <span>{title}</span>
            <span className="text-[10px] text-gray-600 uppercase">{type}</span>
        </div>
    );
}

