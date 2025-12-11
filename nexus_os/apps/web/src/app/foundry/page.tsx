"use client";

import React, { useState, useEffect } from 'react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Card, Button, Badge } from '@nexus/ui';
import {
    Brain,
    Database,
    Globe,
    AlertTriangle,
    Eye,
    GitCommit,
    Layers,
    Cpu
} from 'lucide-react';
import { useThinking, AgentEvent } from '../../components/ui/ThinkingContext';

// --- Sub Components ---

function MetricCard({ label, value, sub, icon, color, chart }: any) {
    return (
        <Card className="bg-white border border-zinc-200 p-4 relative group hover:bg-zinc-50 transition-colors overflow-hidden shadow-sm">
            {chart && (
                <div className="absolute bottom-0 right-0 w-24 h-12 flex items-end gap-1 opacity-20">
                    {[40, 60, 45, 70, 65, 80, 75].map((h, i) => (
                        <div key={i} className="w-2 bg-rose-500 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                </div>
            )}
            <div className="absolute top-4 right-4">{icon}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">{label}</div>
            <div className={`text-2xl font-bold font-mono tracking-tight ${color || 'text-zinc-900'}`}>{value}</div>
            <div className="text-xs text-zinc-500 mt-1">{sub}</div>
        </Card>
    )
}

function StreamRow({ id, source, size, type, warning }: any) {
    return (
        <div className="flex items-center justify-between p-2 rounded bg-zinc-50 border border-zinc-200 mb-1.5 text-xs hover:bg-white transition-colors shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${warning ? 'bg-yellow-500 animate-bounce' : 'bg-green-500'}`} />
                <div>
                    <div className="font-mono font-bold text-zinc-700">{id}</div>
                    <div className="text-[10px] text-zinc-500">{source}</div>
                </div>
            </div>
            <div className="text-right">
                <div className="font-mono text-zinc-500">{size}</div>
                <div className="text-[10px] text-zinc-400">{type}</div>
            </div>
        </div>
    )
}

function JobRow({ name, progress, status, eta, done }: any) {
    return (
        <div className="p-3 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
            <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-bold text-zinc-800">{name}</div>
                <div className={`text-[10px] font-bold ${done ? 'text-green-600' : 'text-rose-500'}`}>{status}</div>
            </div>
            {!done ? (
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
            ) : (
                <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <GitCommit className="w-3 h-3" /> Commit: 8f2a...99
                </div>
            )}
            {!done && <div className="text-[10px] text-zinc-500 mt-1 text-right">ETA: {eta}</div>}
        </div>
    )
}

function LineageItem({ title, desc, time, active }: any) {
    return (
        <div className="relative mb-0 last:mb-0">
            <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${active ? 'bg-rose-500 animate-pulse' : 'bg-zinc-300'}`} />
            <div className="text-sm font-bold text-zinc-900">{title}</div>
            <div className="text-xs text-zinc-500 mb-0.5">{desc}</div>
            <div className="text-[10px] text-zinc-400 font-mono">{time}</div>
        </div>
    )
}

export default function DojoPage() {
    const { runAgent, events, state } = useThinking();
    const [ingestionRate, setIngestionRate] = useState(14.5); // PB/day

    // Simulate live data
    useEffect(() => {
        const interval = setInterval(() => {
            setIngestionRate(prev => prev + (Math.random() * 0.4 - 0.2));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Helper to extract content safely from event
    const getEventContent = (e: AgentEvent) => {
        if ('content' in e) return e.content;
        return '';
    };

    return (
        <ModuleLayout
            title="Dojo Data Access"
            description="Neural Training Center - Fleet Data Ingestion & Model Training"
            icon="🧠"
            color="bg-rose-600 text-white"
            action={
                <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-md">
                    <Database className="w-4 h-4 mr-2" />
                    Query Fleet Snapshot
                </Button>
            }
        >
            <div className="grid grid-cols-12 gap-6 h-full">

                {/* Metrics Header */}
                <div className="col-span-12 grid grid-cols-4 gap-4 h-32">
                    <MetricCard
                        label="Ingestion Rate"
                        value={`${ingestionRate.toFixed(1)} PB`}
                        sub="Daily Average"
                        icon={<Database className="text-rose-400" />}
                        chart
                    />
                    <MetricCard
                        label="Active Training Nodes"
                        value="12,400"
                        sub="D1 Chips Utilization: 98%"
                        icon={<Cpu className="text-zinc-400" />}
                    />
                    <MetricCard
                        label="Auto-Labeling Conf"
                        value="99.4%"
                        sub="+0.2% vs v12.9"
                        color="text-green-600"
                        icon={<Eye className="text-green-500" />}
                    />
                    <MetricCard
                        label="Edge Cases Found"
                        value="842"
                        sub="Requires Human Feedback"
                        color="text-amber-500"
                        icon={<AlertTriangle className="text-amber-500" />}
                    />
                </div>

                {/* Main Visualization: The "Brain" */}
                <div className="col-span-8 flex flex-col gap-6">
                    <Card className="flex-1 bg-zinc-900 border-zinc-800 relative overflow-hidden flex flex-col shadow-lg">
                        {/* Note: Keeping this card DARK because it represents a specialized visualization (Dojo) which often looks better in dark mode, even in a light app. */}
                        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] opacity-10 bg-center bg-no-repeat bg-cover pointer-events-none invert filter" />

                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 z-10">
                            <div className="font-bold text-sm tracking-widest uppercase flex items-center gap-2 text-rose-100">
                                <Globe className="w-4 h-4 text-rose-500" />
                                Global Fleet Telemetry
                            </div>
                            <div className="flex gap-4 text-xs font-mono text-zinc-400">
                                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Shadow Mode</span>
                                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Intervention Capture</span>
                            </div>
                        </div>

                        <div className="flex-1 p-6 z-10 grid grid-cols-2 gap-6">
                            {/* Live Feed Simulation */}
                            <div className="flex flex-col gap-2">
                                <div className="text-[10px] uppercase font-bold text-zinc-500">Incoming Streams</div>
                                <StreamRow id="CAM-L-FRONT" source="Model 3 @ SF" size="400 MB" type="Video" />
                                <StreamRow id="IMU-DATA" source="Cybertruck @ Austin" size="24 KB" type="Telemetry" />
                                <StreamRow id="LIDAR-GTA" source="Validation Mule @ NY" size="1.2 GB" type="Point Cloud" warning />
                                <StreamRow id="CAM-R-REAR" source="Model Y @ Berlin" size="350 MB" type="Video" />
                            </div>

                            {/* Thinking Agent Interaction */}
                            <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex flex-col">
                                <div className="flex items-center gap-2 mb-4 text-rose-400 font-mono text-xs font-bold">
                                    <Brain className="w-4 h-4" />
                                    DOJO AGENT ANALYZER
                                </div>

                                <div className="flex-1 overflow-y-auto mb-4 space-y-3 font-mono text-[10px]">
                                    <div className="text-zinc-500 italic">&gt; Monitoring incoming streams for edge cases...</div>
                                    {events.map((e, i) => (
                                        <div key={i} className="animate-in fade-in slide-in-from-bottom-1">
                                            {e.type === 'thought' && (
                                                <div className="text-yellow-500/80 mb-1">
                                                    <span className="opacity-50">thinking:</span> {getEventContent(e)}
                                                </div>
                                            )}
                                            {e.type === 'final_response' && (
                                                <div className="text-white bg-white/5 p-2 rounded border border-white/10">
                                                    {getEventContent(e)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {state === 'thinking' && (
                                        <div className="text-rose-500 animate-pulse">Running neural analysis...</div>
                                    )}
                                </div>

                                <div className="mt-auto">
                                    <Button
                                        className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs"
                                        onClick={() => runAgent("Analyze recent disengagement in Sector 7G (Snow Condition). Correlate with FSD v12.9 regression data.")}
                                        disabled={state === 'thinking'}
                                    >
                                        {state === 'thinking' ? 'Analyzing...' : 'Analyze "Snow Phantom" Edge Case'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar: Training Pipelines */}
                <div className="col-span-4 flex flex-col gap-6">
                    <Card className="bg-white border border-zinc-200 p-0 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-zinc-200 flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50/50">
                            Training Jobs
                            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">3 ACTIVE</Badge>
                        </div>
                        <div className="p-0">
                            <JobRow name="Occupancy Network v4" progress={87} status="Training" eta="2h 14m" />
                            <JobRow name="Planner - City Streets" progress={34} status="Training" eta="18h 40m" />
                            <JobRow name="Auto-WiperNet" progress={100} status="Complete" eta="-" done />
                        </div>
                    </Card>

                    <Card className="flex-1 bg-white border border-zinc-200 p-4 shadow-sm">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-3 flex justify-between">
                            <span>Data Lineage</span>
                            <Layers className="w-3 h-3" />
                        </div>

                        <div className="relative pl-4 border-l border-zinc-200 space-y-6">
                            <LineageItem
                                title="Ingestion"
                                desc="Raw telemetry from 4.2M vehicles"
                                time="Continuous"
                                active
                            />
                            <LineageItem
                                title="Auto-Labeling"
                                desc="Dojo processes clips -> 4D Space"
                                time="T+50ms"
                                active
                            />
                            <LineageItem
                                title="Curation"
                                desc="Mining for 1-in-10k mile events"
                                time="Daily"
                            />
                            <LineageItem
                                title="Model Bake"
                                desc="Training on 10k GPU cluster"
                                time="Weekly"
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </ModuleLayout>
    );
}
