"use client";

import React, { useState, useEffect, useRef } from 'react';
import ModuleLayout from '../../../components/layout/ModuleLayout';
import { Card, Button, Badge, ScrollArea } from '@nexus/ui';
import { Terminal, Activity, Shield, Pause, Play, AlertTriangle, Eye, Zap, Send } from 'lucide-react';

interface LogEntry {
    id: string;
    timestamp: string;
    type: 'THOUGHT' | 'ACTION' | 'SYSTEM' | 'AGENT' | 'TOOL';
    message: string;
    source?: string;
}

export default function AIPTerminalsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
    const [inputValue, setInputValue] = useState('');
    const logEndRef = useRef<HTMLDivElement>(null);

    const fetchLogs = async () => {
        if (status === 'PAUSED') return;
        try {
            const res = await fetch('/api/feed'); // Using feed as a proxy for logs for now if logs API fails
            const data = await res.json();
            // Transform feed alerts to log entries mock for now if needed, or use real endpoint
            if (Array.isArray(data)) {
                const newLogs: LogEntry[] = data.map((d: any) => ({
                    id: d.id,
                    timestamp: d.timestamp,
                    type: 'SYSTEM',
                    message: d.message,
                    source: 'System'
                }));
                setLogs(prev => [...prev, ...newLogs].slice(-100)); // Keep last 100
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        // fetchLogs();
        // Mocking socket-like behavior for "live" feel in this demo
        const interval = setInterval(() => {
            const types: LogEntry['type'][] = ['THOUGHT', 'ACTION', 'SYSTEM', 'TOOL'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            const messages = [
                "Analyzing network traffic patterns...",
                "Detected anomaly in sector 7G",
                "Re-routing power to shield generators",
                " querying database for user profile...",
                "Optimizing query execution plan",
                "Connection established with remote host"
            ];
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];

            if (status === 'ACTIVE') {
                setLogs(prev => [...prev, {
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    type: randomType,
                    message: randomMsg,
                    source: 'Orchestrator'
                }]);
            }

        }, 2000);
        return () => clearInterval(interval);
    }, [status]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleCommandSubmit = () => {
        if (inputValue.trim()) {
            const newLog: LogEntry = {
                id: `${Date.now()}-cmd`,
                timestamp: new Date().toISOString(),
                type: 'ACTION',
                message: `> ${inputValue}`,
                source: 'user_input'
            };
            setLogs(prev => [...prev, newLog]);
            setInputValue('');
        }
    };

    return (
        <ModuleLayout
            title="The Mesh"
            description="AIP Neural Intervention Layer"
            icon={<Terminal className="w-6 h-6 text-emerald-500" />}
            action={
                <Button className="bg-red-900/50 text-red-200 border border-red-800 hover:bg-red-900 shadow-md animate-pulse">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    EMERGENCY SHUTDOWN
                </Button>
            }
        >
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                {/* Main Terminal Output */}
                <Card className="col-span-8 bg-zinc-950 border-zinc-800 shadow-2xl flex flex-col overflow-hidden font-mono text-sm relative">
                    <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Terminal className="w-4 h-4" />
                            <span>nexus-core-runtime-v0.9.tsx</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-emerald-500/20 text-emerald-500">
                                <Activity className="w-3 h-3 mr-1" />
                                EXECUTION_ACTIVE
                            </Badge>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono scrollbar-hide">
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-3 hover:bg-white/5 p-1 rounded">
                                <span className="text-zinc-600 text-xs shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <div className="flex-1 break-all">
                                    <span className={`
                                        text-xs font-bold mr-2 px-1 rounded
                                        ${log.type === 'THOUGHT' ? 'bg-purple-900/30 text-purple-400' : ''}
                                        ${log.type === 'ACTION' ? 'bg-blue-900/30 text-blue-400' : ''}
                                        ${log.type === 'SYSTEM' ? 'bg-zinc-800 text-zinc-400' : ''}
                                        ${log.type === 'TOOL' ? 'bg-amber-900/30 text-amber-400' : ''}
                                    `}>
                                        {log.type}
                                    </span>
                                    <span className="text-zinc-300">{log.message}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-zinc-800 bg-zinc-900/50 flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                className="w-full bg-black/50 border border-zinc-700 rounded-md py-2 pl-3 pr-10 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                                placeholder="Enter system command..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCommandSubmit();
                                }}
                            />
                            <div className="absolute right-2 top-2.5">
                                <Activity className="w-4 h-4 text-emerald-500/50 animate-pulse" />
                            </div>
                        </div>
                        <Button
                            onClick={handleCommandSubmit}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>

                {/* Right: Agent Status & Controls */}
                <div className="col-span-4 flex flex-col gap-4">
                    <Card className="p-4 bg-white border-zinc-200 shadow-sm">
                        <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Active Agents
                        </h3>
                        <div className="space-y-3">
                            <MissionCard title="Security_Ops_Prime" status="ENGAGED" />
                            <MissionCard title="Network_Traffic_Analyzer" status="IDLE" />
                            <MissionCard title="Data_Integrity_Sentinel" status="ENGAGED" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-indigo-900 text-white border-indigo-800 flex-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 text-indigo-200">
                                <Eye className="w-5 h-5" />
                                <span className="text-sm font-medium tracking-wider">OBSERVER_MODE</span>
                            </div>
                            <div className="text-3xl font-bold mb-1">98.4%</div>
                            <div className="text-indigo-200 text-sm mb-6">System Integrity</div>

                            <div className="space-y-2">
                                <div className="h-1.5 bg-indigo-950/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-400 w-[98%]" />
                                </div>
                                <div className="flex justify-between text-xs text-indigo-300">
                                    <span>Core</span>
                                    <span>Stable</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </ModuleLayout>
    );
}

function MissionCard({ title, status, onClick }: { title: string; status: 'ENGAGED' | 'IDLE'; onClick?: () => void }) {
    const isEngaged = status === 'ENGAGED';
    return (
        <div onClick={onClick} className={`
            p-3 rounded-lg border cursor-pointer transition-all
            ${isEngaged
                ? 'bg-white border-emerald-200 shadow-sm hover:shadow-md'
                : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'}
        `}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {isEngaged
                        ? <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                        : <Pause className="w-4 h-4 text-zinc-400" />}
                    <span className={`font-semibold text-sm ${isEngaged ? 'text-zinc-800' : 'text-zinc-600'}`}>{title}</span>
                </div>
                {isEngaged && <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 text-[10px] px-1.5 py-0">ENGAGED</Badge>}
                {!isEngaged && <Badge variant="outline" className="text-zinc-500 border-zinc-300 bg-zinc-100 text-[10px] px-1.5 py-0">IDLE</Badge>}
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                    <span>AGENT</span>
                    <span className="text-zinc-600">CyberSentinel-Alpha</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                    <span>MODEL</span>
                    <span className="text-purple-600 font-mono">Gemini Ultra</span>
                </div>
            </div>
        </div>
    )
}
