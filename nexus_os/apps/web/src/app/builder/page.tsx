"use client";

import React, { useState } from 'react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Card, Button, Badge } from '@nexus/ui';
import { Play, Save, Box, ArrowRight, MessageSquare, Zap, Terminal, Code, GitBranch, Cpu } from 'lucide-react';
import { useThinking } from '../../components/ui/ThinkingContext';

export default function BackstagePage() {
    const { runAgent, events, state, message } = useThinking();
    const [prompt, setPrompt] = useState("Trigger build for FSD v13.3.1 branch...");

    const handleRun = () => {
        runAgent(prompt);
    };

    return (
        <ModuleLayout
            title="Backstage"
            description="Engineering Portal - FSD CI/CD & Vehicle Firmware"
            icon="🛠️"
            color="bg-zinc-100 text-zinc-900 border border-zinc-200"
            action={
                <Button className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm">
                    <Zap className="w-4 h-4 mr-2" />
                    Deploy to Fleet
                </Button>
            }
        >
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                {/* Left: Pipeline Visualizer */}
                <div className="col-span-8 flex flex-col gap-4">
                    <Card className="flex-1 bg-white border border-zinc-200 relative overflow-hidden flex flex-col shadow-sm">
                        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                            <div className="font-bold text-sm text-zinc-700 flex items-center gap-2 uppercase tracking-wider">
                                <GitBranch className="w-4 h-4 text-purple-600" />
                                Branch: release/v13.3-hw4
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-[10px]">PASSING</Badge>
                        </div>

                        <div className="flex-1 p-8 overflow-auto flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-grid-zinc-200/[0.2] pointer-events-none" />
                            {/* Visual Flow Representation */}
                            <div className="flex items-center space-x-4 w-full justify-center">

                                <StageNode name="Commit" icon={<Code className="w-4 h-4" />} status="done" />
                                <ArrowRight className="w-4 h-4 text-zinc-300" />
                                <StageNode name="Build" icon={<Box className="w-4 h-4" />} status="done" />
                                <ArrowRight className="w-4 h-4 text-zinc-300" />
                                <StageNode name="Simulation" icon={<Cpu className="w-4 h-4" />} status="active" />
                                <ArrowRight className="w-4 h-4 text-zinc-300" />
                                <StageNode name="Shadow Mode" icon={<Zap className="w-4 h-4" />} status="pending" />

                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Terminal / Console */}
                <div className="col-span-4 flex flex-col gap-4">
                    <Card className="flex-1 flex flex-col border border-zinc-200 shadow-lg bg-zinc-50">
                        <div className="p-3 bg-white border-b border-zinc-200 text-zinc-600 rounded-t-lg flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                            <Terminal className="w-3 h-3" />
                            Build Agent Alpha
                        </div>

                        <div className="flex-1 p-4 font-mono text-[10px] overflow-y-auto space-y-2 text-zinc-600">
                            <div className="text-zinc-500">Initializing build environment...</div>
                            <div className="text-zinc-500">Pulling refs/heads/release/v13.3-hw4...</div>
                            <div className="text-green-600">HEAD is now at 88a92cc [FSD] Optimization for roundabout smoothness</div>

                            {events.map((e, i) => (
                                <div key={i} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                                    {e.type === 'thought' && (
                                        <div className="text-amber-600/80 mb-1">
                                            <span className="opacity-50">&gt;&gt;</span> {e.content}
                                        </div>
                                    )}
                                    {e.type === 'tool_start' && (
                                        <div className="text-blue-600 mb-1">
                                            <span className="opacity-50">exec</span> {e.tool}(...)
                                        </div>
                                    )}
                                    {e.type === 'final_response' && (
                                        <div className="text-zinc-900 mt-4 pt-4 border-t border-zinc-200">
                                            {e.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {state === 'thinking' && (
                                <div className="text-purple-600 animate-pulse">▐</div>
                            )}
                        </div>

                        <div className="p-4 bg-white border-t border-zinc-200">
                            <div className="font-bold text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">Manual Override</div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-xs text-zinc-900 focus:outline-none focus:border-purple-500 font-mono shadow-inner"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                                />
                                <Button
                                    onClick={handleRun}
                                    disabled={state === 'thinking' || state === 'executing'}
                                    className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-sm"
                                >
                                    {state === 'thinking' ? <span className="animate-spin">↻</span> : <Play className="w-3 h-3" />}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </ModuleLayout>
    );
}

function StageNode({ name, icon, status }: any) {
    const colors = {
        done: 'bg-green-50 border-green-500 text-green-700',
        active: 'bg-blue-50 border-blue-500 text-blue-700 animate-pulse',
        pending: 'bg-white border-zinc-200 text-zinc-400'
    };

    return (
        <div className={`
            w-32 p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all shadow-sm
            ${colors[status as keyof typeof colors]}
        `}>
            {icon}
            <div className="text-xs font-bold uppercase tracking-wider">{name}</div>
        </div>
    )
}

