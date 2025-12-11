"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    Zap,
    TrendingUp,
    Activity,
    Radio,
    Cpu,
    BrainCircuit,
    ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTeslaStore, Signal } from '@/lib/teslaState';
import { RagEngine } from '@/lib/ragEngine';

export default function IntelligenceFeed() {
    const { signals, isLive, toggleLive, generateSimulationTick } = useTeslaStore();

    // Simulation Loop
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLive) {
            interval = setInterval(() => {
                generateSimulationTick();
                // Simulate RAG queries in background
                const randomQuery = Math.random() > 0.5 ? "cybertruck production ramp" : "fsd neural net architecture";
                const results = RagEngine.search(randomQuery);
                console.log("[Nexus RAG] Background reasoning:", results);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLive, generateSimulationTick]);

    return (
        <Card className="h-full bg-[#0B0C0E] border-white/10 flex flex-col overflow-hidden">
            <CardHeader className="py-4 px-6 border-b border-white/10 bg-[#111418] flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <BrainCircuit className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Nexus Horizon</CardTitle>
                        <p className="text-[10px] text-zinc-500 font-mono">INTELLIGENCE & SIGNALS</p>
                    </div>
                </div>
                <button
                    onClick={toggleLive}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${isLive ? 'bg-red-900/20 border-red-500/50 text-red-500 animate-pulse' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
                >
                    <Radio className="w-3 h-3" />
                    {isLive ? 'LIVE FEED ACTIVE' : 'PAUSED'}
                </button>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0 relative">
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent opacity-0 pointer-events-none animate-scanline z-50" />

                <div className="divide-y divide-white/5">
                    <AnimatePresence initial={false}>
                        {signals.map((signal) => (
                            <SignalItem key={signal.id} signal={signal} />
                        ))}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}

function SignalItem({ signal }: { signal: Signal }) {
    const getIcon = () => {
        switch (signal.type) {
            case 'RISK': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'OPPORTUNITY': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
            case 'OPERATIONAL': return <Activity className="w-4 h-4 text-orange-500" />;
            case 'INTELLIGENCE': return <Cpu className="w-4 h-4 text-purple-500" />;
            default: return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    const getBorderColor = () => {
        switch (signal.type) {
            case 'RISK': return 'border-l-red-500';
            case 'OPPORTUNITY': return 'border-l-emerald-500';
            case 'OPERATIONAL': return 'border-l-orange-500';
            case 'INTELLIGENCE': return 'border-l-purple-500';
            default: return 'border-l-gray-500';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-5 hover:bg-white/5 transition-colors border-l-2 ${getBorderColor()}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-black/40 border-white/10 text-xs font-mono text-zinc-400">
                        {signal.source || "System"}
                    </Badge>
                    <span className="text-[10px] text-zinc-600 font-mono">{signal.timestamp}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {getIcon()}
                    {signal.type}
                </div>
            </div>

            <h4 className="text-sm font-semibold text-zinc-100 mb-1">{signal.title}</h4>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{signal.description}</p>

            {/* Agent Thought / Insight Block */}
            {signal.agentThought && (
                <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-500/30" />
                    <div className="flex items-center gap-2 mb-1.5">
                        <BrainCircuit className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Agent Reasoning</span>
                    </div>
                    <p className="text-xs text-blue-200/80 font-mono leading-relaxed">
                        {">"} {signal.agentThought}
                    </p>
                </div>
            )}

            {/* Action Block */}
            <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 font-mono">{signal.impact}</span>
                {signal.suggestedAction && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 rounded border border-white/5 transition-colors uppercase font-bold tracking-wide"
                    >
                        Initialize Protocol
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
