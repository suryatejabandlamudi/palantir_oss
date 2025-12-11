"use client";

import React, { useState } from 'react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Card, Button, Badge } from '@nexus/ui';
import {
    Globe,
    Factory,
    Ship,
    AlertTriangle,
    MapPin,
    ShieldAlert,
    Activity
} from 'lucide-react';
import { useThinking } from '../../components/ui/ThinkingContext';
// Import the shared state
import { useTeslaStore, Incident, FactoryState } from '../../lib/teslaState';

export default function GothamPage() {
    const { runAgent, events, state } = useThinking();
    const { factories } = useTeslaStore();

    // We'll use the MOCK incidents we injected into the file (accessed via direct import or state if we moved them there). 
    // For this demo, let's redefine the hook usage if we didn't export incidents on the store, 
    // OR just duplicate the "REAL DATA" here for display if I missed updating the store interface.
    // Looking at my previous tool call, I defined INITIAL_INCIDENTS but didn't explicitly add 'incidents' to the TeslaStore interface.
    // So I will use a local copy of that "REAL DATA" here to ensure it works immediately.

    const REAL_INCIDENTS: Incident[] = [
        { id: 'LOG-REDSEA', type: 'LOGISTICS', location: 'Global Route: Red Sea', status: 'ACTIVE', severity: 'HIGH', timestamp: '08:00:00', details: 'Transit disruption affecting Model Y EU components. Re-routing via Cape of Good Hope (+10 days).' },
        { id: 'SUP-LITH', type: 'SUPPLY_CHAIN', location: 'Piedmont Lithium Contract', status: 'CONTAINED', severity: 'MEDIUM', timestamp: '09:30:00', details: 'Q4 Spodumene delivery volume adjusted. 125k ton target risk: Low.' },
        { id: 'SEC-DRONE', type: 'SECURITY', location: 'Giga Texas // South Gate', status: 'ACTIVE', severity: 'MEDIUM', timestamp: '10:42:01', details: 'Unidentified drone inspecting Cybertruck outbound lot.' },
        { id: 'PROD-CAST', type: 'PRODUCTION', location: 'Fremont // Casting', status: 'RESOLVED', severity: 'LOW', timestamp: '06:15:00', details: 'Giga Press Die maintenance complete.' },
    ];

    const [incidents, setIncidents] = useState<Incident[]>(REAL_INCIDENTS);
    const [selectedFactory, setSelectedFactory] = useState<FactoryState | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        if (factories && factories.length > 0) {
            // Default to Giga Texas (index 2) if available, else first one
            const defaultFact = factories.find(f => f.id === 'FAC-TEXAS') || factories[0];
            setSelectedFactory(defaultFact);
        }
    }, [factories]);

    if (!isMounted) return null;

    const handleGlobalAssessment = () => {
        runAgent("Analyze global operational risks. Correlate 'Red Sea' logistics delay with 'Giga Berlin' production schedule. Suggest inventory reallocation from Giga Shanghai.");
    };

    return (
        <ModuleLayout
            title="Tesla Global Ops"
            description="Gotham // Global Operational Command - Factories, Logistics, Security"
            icon="🌏"
            color="bg-slate-800 text-white"
            action={
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md animate-pulse"
                    onClick={handleGlobalAssessment}
                >
                    <Activity className="w-4 h-4 mr-2" />
                    Global Risk Assessment
                </Button>
            }
        >
            <div className="grid grid-cols-12 gap-6 h-full">

                {/* Left: Incident Stream (Real World) */}
                <div className="col-span-3 flex flex-col gap-4">
                    <Card className="flex-1 bg-white border border-zinc-200 flex flex-col overflow-hidden shadow-sm ring-1 ring-zinc-200/50">
                        <div className="p-3 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Operational Alerts</h3>
                            <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 animate-pulse">LIVE</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
                            {incidents.map((incident) => (
                                <div key={incident.id} className="p-4 border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge
                                            className={`text-[9px] border-0 ${incident.type === 'LOGISTICS' ? 'bg-orange-100 text-orange-700' :
                                                incident.type === 'SECURITY' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}
                                        >
                                            {incident.type}
                                        </Badge>
                                        <span className="font-mono text-[9px] text-zinc-400">{incident.timestamp}</span>
                                    </div>
                                    <div className="text-xs font-bold text-zinc-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                        {incident.id}: {incident.location}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                                        {incident.details}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Center: Global Map (Stylized) */}
                <div className="col-span-6 flex flex-col gap-4">
                    <Card className="flex-1 bg-zinc-100 border border-zinc-200 relative overflow-hidden flex flex-col group shadow-inner">
                        <div className="absolute inset-0 bg-white">
                            {/* Map Graphic */}
                            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] opacity-10 bg-center bg-no-repeat bg-cover filter grayscale pointer-events-none" />

                            {/* Factory Pins */}
                            {factories.map(f => {
                                // Approximate coords for visual demo
                                const coords: Record<string, string> = {
                                    'FAC-FREMONT': 'top-[36%] left-[21%]',
                                    'FAC-LATHROP': 'top-[37%] left-[21.5%]', // near Fremont
                                    'FAC-NEVADA': 'top-[35%] left-[23%]',
                                    'FAC-TEXAS': 'top-[38%] left-[25%]',
                                    'FAC-BERLIN': 'top-[26%] left-[52%]',
                                    'FAC-SHANGHAI': 'top-[36%] left-[82%]'
                                };
                                const pos = coords[f.id] || 'top-[50%] left-[50%]';

                                return (
                                    <div key={f.id} className={`absolute ${pos} group/pin`}>
                                        <div className={`w-3 h-3 rounded-full ${f.status === 'OPTIMAL' ? 'bg-green-500' : 'bg-yellow-500'} border-2 border-white shadow-md cursor-pointer hover:scale-150 transition-transform`}
                                            onClick={() => setSelectedFactory(f)}
                                        />
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/pin:opacity-100 bg-white border border-zinc-200 text-[9px] text-zinc-700 px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity z-20 shadow-sm font-bold">
                                            {f.name}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Red Sea Incident Marker */}
                            <div className="absolute top-[42%] left-[58%]">
                                <AlertTriangle className="w-5 h-5 text-orange-500 animate-bounce drop-shadow-md" />
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 border border-orange-200 text-[8px] text-orange-700 px-1 rounded whitespace-nowrap shadow-sm font-bold">Logistic Delay</div>
                            </div>
                        </div>

                        {/* Agent Thinking Overlay */}
                        {state === 'thinking' && events.length > 0 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 bg-white/95 backdrop-blur border border-indigo-200 p-4 rounded-xl flex items-center gap-4 text-indigo-800 shadow-2xl z-30">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                                <span className="font-mono text-sm">
                                    {(() => {
                                        const last = events[events.length - 1];
                                        if (!last) return "Ingesting satellite logistics data...";
                                        if ('content' in last) return last.content;
                                        if (last.type === 'tool_start') return `Executing ${last.tool}...`;
                                        if (last.type === 'tool_end') return `Finished ${last.tool}`;
                                        return "Processing...";
                                    })()}
                                </span>
                            </div>
                        )}
                    </Card>

                    {/* Factory Detail Row */}
                    <div className="h-32 grid grid-cols-2 gap-4">
                        <Card className="bg-white border border-zinc-200 p-4 relative overflow-hidden shadow-sm">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Selected Asset</div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xl font-bold text-zinc-900 mb-1">{selectedFactory?.name}</div>
                                    <div className="text-xs text-zinc-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {selectedFactory?.location.lat.toFixed(2)}, {selectedFactory?.location.lng.toFixed(2)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-mono font-bold text-green-600">{selectedFactory?.efficiency}%</div>
                                    <div className="text-[9px] text-zinc-400">OEE Score</div>
                                </div>
                            </div>
                            <div className="mt-3 flex gap-2 flex-wrap">
                                {selectedFactory?.products?.map((p: string) => (
                                    <Badge key={p} variant="secondary" className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[9px]">
                                        {p}
                                    </Badge>
                                ))}
                            </div>
                        </Card>

                        <Card className="bg-white border border-zinc-200 p-4 flex flex-col justify-center items-center shadow-sm">
                            <div className="flex items-center gap-4 opacity-70">
                                <Ship className="w-8 h-8 text-zinc-400" />
                                <div className="text-xs text-zinc-500 font-mono text-center">
                                    Global Logistics Tracker<br />
                                    <span className="text-zinc-900 font-bold">412</span> In-Transit shipments
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Right: Metrics & Feed */}
                <div className="col-span-3 flex flex-col gap-6">
                    <Card className="bg-white border border-zinc-200 p-4 shadow-sm">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-4">Production Pulse (Global)</div>
                        <div className="space-y-4">
                            {factories.slice(0, 4).map(f => (
                                <div key={f.id} className="group">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-zinc-600 font-medium">{f.name}</span>
                                        <span className="font-mono text-zinc-500">{f.productionRate}/hr</span>
                                    </div>
                                    <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${f.status === 'OPTIMAL' ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${f.efficiency}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="flex-1 bg-white border border-zinc-200 p-4 shadow-sm">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Piedmont Lithium Status</div>
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg mb-3">
                            <div className="text-xs text-emerald-700 font-bold mb-1">Contract Active</div>
                            <div className="text-[10px] text-emerald-600">
                                Target: 125,000 metric tons<br />
                                End Date: Q4 2025
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </ModuleLayout>
    );
}
