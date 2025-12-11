'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
    Activity,
    ShieldAlert,
    Clock,
    User,
    Network
} from 'lucide-react';
import { ActionCenter } from '@/components/sec-001/ActionCenter';
import IdentityGraph from '@/components/sec-001/IdentityGraph';
import AgentReasoning from '@/components/sec-001/AgentReasoning';

const ThreatMap = dynamic(() => import('@/components/sec-001/ThreatMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-zinc-50 animate-pulse rounded-lg" />
});

export default function Sec001WarRoom() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/agent/sec-001');
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error("Failed to fetch forensic data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !data) {
        return (
            <div className="h-screen w-full bg-white text-zinc-900 flex items-center justify-center font-sans">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Loading Incidence Response...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 p-6 font-sans">

            {/* Header / Nav */}
            <header className="mb-6 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border border-red-200">
                            Generic-001
                        </span>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Impossible Travel Detection</h1>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><Clock size={12} /> Detected 2m ago</span>
                        <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                        <span className="flex items-center gap-1"><User size={12} /> Assigned: Nexus AI</span>
                        <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                        <span className="text-zinc-400 font-mono">ID: #992-AX-1</span>
                    </div>
                </div>

                <div className="flex gap-8 pr-4">
                    <div className="text-right">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Velocity</div>
                        <div className="text-2xl font-bold text-zinc-900 font-mono tracking-tight">
                            {data.velocity.speed_mph.toLocaleString()} <span className="text-sm text-zinc-400 font-sans">mph</span>
                        </div>
                    </div>
                    <div className="text-right pl-8 border-l border-zinc-200">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Risk Score</div>
                        <div className="text-2xl font-bold text-red-600 font-mono tracking-tight">
                            CRITICAL
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)] min-h-[600px]">

                {/* Left Column: Context (Maps & Graphs) */}
                <div className="col-span-8 flex flex-col gap-4">

                    {/* Map Panel */}
                    <div className="flex-[3] bg-white rounded-xl border border-zinc-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur border border-zinc-200 p-2 rounded shadow-sm">
                            <h3 className="text-xs font-bold text-zinc-700 flex items-center gap-2">
                                <Activity className="h-3 w-3 text-red-500" /> Geospatial Anomaly
                            </h3>
                        </div>
                        <ThreatMap home={data.home} attacker={data.attacker} />
                    </div>

                    {/* Graph Panel */}
                    <div className="flex-[2] bg-white rounded-xl border border-zinc-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur border border-zinc-200 p-2 rounded shadow-sm">
                            <h3 className="text-xs font-bold text-zinc-700 flex items-center gap-2">
                                <Network className="h-3 w-3 text-blue-500" /> Identity Graph
                            </h3>
                        </div>
                        <IdentityGraph
                            initialNodes={data.graphElements.filter((el: any) => !el.source)}
                            initialEdges={data.graphElements.filter((el: any) => el.source)}
                        />
                    </div>
                </div>

                {/* Right Column: Reasoning & Actions */}
                <div className="col-span-4 flex flex-col gap-4">
                    {/* Agent Reasoning (Scrollable) */}
                    <div className="flex-[3] overflow-hidden">
                        <AgentReasoning logs={data.agentThoughts} riskScore={98} />
                    </div>

                    {/* Action Center */}
                    <div className="flex-none">
                        <ActionCenter />
                    </div>
                </div>

            </div>
        </div>
    );
}
