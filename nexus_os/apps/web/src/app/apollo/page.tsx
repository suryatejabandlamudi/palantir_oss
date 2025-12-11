'use client';

import React, { useState, useEffect, useRef } from 'react';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Rocket, CheckCircle2, Loader2, GitBranch, Terminal, ShieldCheck, Car, Users, TrendingUp, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeslaStore, FSDBuild } from '@/lib/teslaState';

export default function ApolloPage() {
    const { fsdBuilds } = useTeslaStore();
    const [selectedBuild, setSelectedBuild] = useState<FSDBuild>(fsdBuilds[0]);
    const [isRollingOut, setIsRollingOut] = useState(false);

    // Determine active stage based on selected build status
    const getStage = (status: string) => {
        if (status === 'TRAINING') return 1;
        if (status === 'SIMULATION') return 2;
        if (status === 'SHADOW_MODE') return 3;
        if (status === 'ROLLOUT') return 4;
        if (status === 'STABLE') return 5;
        return 0;
    };

    const handleRollout = () => {
        setIsRollingOut(true);
        setTimeout(() => setIsRollingOut(false), 3000); // Sim delay
    };

    return (
        <WorkspaceLayout
            sidebar={
                <div className="flex flex-col h-full bg-[#0B0C0E]">
                    <div className="p-4 border-b border-white/5">
                        <h2 className="text-xs font-bold text-white/50 tracking-wider">FSD RELEASE CHANNELS</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {fsdBuilds.map((build, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedBuild(build)}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${selectedBuild.version === build.version ? 'bg-[#1C2127] border border-white/10' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-white font-mono">{build.version}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${build.status === 'STABLE' ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'}`}>
                                        {build.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-zinc-500">
                                    <span>Adoption: {build.adoption}%</span>
                                    <span className="text-red-400 font-mono">{build.criticalDisengagements} DE/1k</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            }
            bottomPanel={
                <div className="h-full flex flex-col bg-[#050505]">
                    <div className="h-8 bg-[#111418] border-b border-white/5 flex items-center px-4 justify-between">
                        <span className="text-xs font-bold text-white/50 font-mono">DOJO SIMULATION LOGS</span>
                        {isRollingOut && <span className="text-xs text-blue-400 animate-pulse font-mono">● BROADCASTING</span>}
                    </div>
                    <div className="flex-1 p-4 font-mono text-xs text-zinc-400 overflow-auto bg-[#050505] whitespace-pre-wrap">
                        {`[09:00:22] INGESTING CLIP_SET_8892 (Austin Construction Zone)\n[09:00:24] DOJO: Running perception model v12.5.alpha...\n[09:00:45] REGRESSION: Objects detected in blind spot > 99.9% confidence.\n[09:01:12] SIMULATION: 50,000 miles simulated. 0 Critical Interventions.\n[09:01:15] READY FOR SHADOW MODE.`}
                    </div>
                </div>
            }
        >
            <div className="h-full flex flex-col bg-[#0B0C0E]">
                {/* Header */}
                <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-[#111418]">
                    <h1 className="font-bold text-white flex items-center gap-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Car className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex flex-col">
                            <span>Nexus Build: Fleet Manager</span>
                            <span className="text-[10px] text-zinc-500 font-mono font-normal">OVER-THE-AIR UPDATES (OTA)</span>
                        </div>
                    </h1>
                    <Button
                        onClick={handleRollout}
                        disabled={isRollingOut || selectedBuild.status === 'STABLE'}
                        className="bg-purple-600 hover:bg-purple-500 text-white border-none shadow-lg shadow-purple-900/20"
                    >
                        {isRollingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                        {isRollingOut ? "Pushing to Fleet..." : "Push OTA Update"}
                    </Button>
                </div>

                {/* Main Content: Pipeline & Health */}
                <div className="flex-1 overflow-auto p-8">

                    {/* Visual Pipeline */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
                                <GitBranch className="w-4 h-4" />
                                Release Pipeline: {selectedBuild.version}
                            </h3>
                            <span className="text-xs text-zinc-500 font-mono">HASH: 8f9a2b1</span>
                        </div>

                        <div className="relative flex items-center justify-between px-8 py-10 bg-[#111418] border border-white/5 rounded-2xl overflow-hidden">
                            {/* Connector Line */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10" />

                            <PipelineStage step={1} label="Dojo Training" status={getStage(selectedBuild.status) > 1 ? 'success' : 'running'} />
                            <PipelineStage step={2} label="Simulation" status={getStage(selectedBuild.status) > 2 ? 'success' : (getStage(selectedBuild.status) === 2 ? 'running' : 'pending')} />
                            <PipelineStage step={3} label="Shadow Mode" status={getStage(selectedBuild.status) > 3 ? 'success' : (getStage(selectedBuild.status) === 3 ? 'running' : 'pending')} />
                            <PipelineStage step={4} label="Early Access" status={getStage(selectedBuild.status) > 4 ? 'success' : (getStage(selectedBuild.status) === 4 ? 'running' : 'pending')} />
                            <PipelineStage step={5} label="Wide Release" status={getStage(selectedBuild.status) === 5 ? 'success' : (isRollingOut ? 'running' : 'pending')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-white/70 mb-4 uppercase tracking-wider">Release Notes</h3>
                            <div className="bg-[#111418] p-6 rounded-xl border border-white/5 font-mono text-sm text-zinc-300">
                                {selectedBuild.releaseNotes}
                                <br /><br />
                                <div className="text-xs text-zinc-500">
                                    - Neural Net: v12.5.1 (End-to-End)<br />
                                    - Perception: Occupancy Network v4<br />
                                    - Planner: MCTS v2
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-white/70 mb-4 uppercase tracking-wider">Fleet Metrics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <HealthCard label="Safety Score" value="98.2" status="healthy" icon={<ShieldCheck className="w-4 h-4 text-green-500" />} />
                                <HealthCard label="Active Sessions" value="241k" status="healthy" icon={<Users className="w-4 h-4 text-blue-500" />} />
                                <HealthCard label="Miles/Disengagement" value="450" status="warning" icon={<Car className="w-4 h-4 text-orange-500" />} />
                                <HealthCard label="Autopilot Computer" value="HW4" status="healthy" icon={<Cpu className="w-4 h-4 text-purple-500" />} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WorkspaceLayout>
    );
}

function PipelineStage({ step, label, status }: any) {
    const isRunning = status === 'running';
    const isSuccess = status === 'success';

    return (
        <div className="flex flex-col items-center gap-3 relative z-10 bg-[#111418] px-2">
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500
                ${isSuccess ? 'border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                    isRunning ? 'border-blue-500 text-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                        'border-zinc-800 text-zinc-700'}`}>
                {isSuccess ? <CheckCircle2 className="w-5 h-5" /> :
                    isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> :
                        <span className="font-mono font-bold text-sm">{step}</span>}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${isSuccess ? 'text-green-500' : isRunning ? 'text-blue-400' : 'text-zinc-600'}`}>
                {label}
            </span>
        </div>
    );
}

function HealthCard({ label, value, status, icon }: any) {
    const textColor = status === 'healthy' ? 'text-white' : status === 'warning' ? 'text-yellow-400' : 'text-red-400';
    return (
        <div className="bg-[#111418] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-500 uppercase">{label}</span>
                {icon}
            </div>
            <div className={`text-2xl font-mono font-bold ${textColor}`}>{value}</div>
        </div>
    );
}
