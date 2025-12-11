"use client";

import React, { useEffect, useState } from 'react';
import { useTeslaStore, ManufacturingOrder, TaktMetric } from '@/lib/teslaState';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Factory,
    Timer,
    DollarSign,
    Boxes,
    Cpu,
    Truck,
    CheckCircle2,
    AlertTriangle,
    Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function WarpPage() {
    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 p-6 font-mono overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600 rounded-sm shadow-sm">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">WARP <span className="text-zinc-500 text-lg font-normal">ERP // v9.0.4</span></h1>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">Digital Nervous System</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <GlobalStats />
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                {/* Left Col: Order Stream (3 cols) */}
                <div className="col-span-3 flex flex-col gap-6">
                    <Card className="bg-white border border-zinc-200 flex-1 flex flex-col shadow-sm">
                        <CardHeader className="py-3 px-4 border-b border-zinc-200 bg-zinc-50/50">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-zinc-700">
                                <Boxes className="w-4 h-4 text-emerald-500" />
                                Incoming Orders (Global)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                            <OrderStream />
                        </CardContent>
                    </Card>
                </div>

                {/* Center Col: The Alien Dreadnought (Factory Visualization) (6 cols) */}
                <div className="col-span-6 flex flex-col gap-6">
                    <Card className="bg-white border border-zinc-200 flex-1 relative overflow-hidden shadow-sm">
                        <div className="absolute inset-0 grid-lines opacity-5 pointer-events-none" />
                        <CardHeader className="py-3 px-4 border-b border-zinc-200 bg-zinc-50/50 relative z-10">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-zinc-700">
                                    <Factory className="w-4 h-4 text-blue-500" />
                                    Giga Texas // General Assembly
                                </CardTitle>
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 animate-pulse">LIVE</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 relative z-10 h-full flex items-center justify-center">
                            <ManufacturingLine />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Takt Time & COGS (3 cols) */}
                <div className="col-span-3 flex flex-col gap-6">
                    <TaktMonitor />
                    <CostCard />
                </div>
            </div>
        </div>
    );
}

function GlobalStats() {
    return (
        <div className="flex gap-8">
            <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase">Global Deliveries (Q4)</p>
                <p className="text-xl font-bold font-sans text-zinc-900">484,000</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase">Active Fleet</p>
                <p className="text-xl font-bold font-sans text-zinc-900">6.2M</p>
            </div>
        </div>
    )
}

function OrderStream() {
    const { orders } = useTeslaStore();

    return (
        <div className="flex flex-col">
            {orders.map((order, i) => (
                <div key={order.id} className="p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-blue-600 font-mono group-hover:text-blue-700">{order.id}</span>
                        <span className="text-[10px] text-zinc-500">{order.timestamp}</span>
                    </div>
                    <div className="text-sm text-zinc-700 mb-2">{order.config}</div>
                    <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px] h-5 bg-zinc-100 text-zinc-600 border border-zinc-200">
                            {order.customerName}
                        </Badge>
                        <StatusBadge status={order.status} />
                    </div>
                </div>
            ))}
            <div className="p-4 text-center opacity-50 text-xs animate-pulse text-zinc-500">
                Indexing new orders from Starlink...
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        'CONFIGURED': 'text-zinc-500',
        'IN_QUEUE': 'text-blue-600',
        'BODY_SHOP': 'text-orange-600',
        'PAINT': 'text-purple-600',
        'GENERAL_ASSEMBLY': 'text-emerald-600',
        'GATE_OUT': 'text-zinc-900'
    };
    return (
        <span className={`text-[10px] font-bold ${colors[status] || 'text-zinc-500'}`}>
            {status}
        </span>
    );
}

function ManufacturingLine() {
    // Simplified visualisation of cars moving down a line
    return (
        <div className="w-full flex flex-col gap-8 items-center">
            {/* Visual representation of the line */}
            <div className="w-full h-2 bg-zinc-100 rounded-full relative overflow-hidden border border-zinc-200">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-purple-400 w-1/3"
                    animate={{ left: ["-30%", "100%"] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <div className="grid grid-cols-4 gap-4 w-full">
                {['Casting', 'Body', 'Paint', 'Assembly'].map((stage, i) => (
                    <div key={stage} className="bg-white border border-zinc-200 p-4 rounded-lg flex flex-col items-center gap-2 shadow-sm">
                        <div className={`w-3 h-3 rounded-full ${i === 3 ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                        <span className="text-xs text-zinc-500 uppercase">{stage}</span>
                        <span className="text-lg font-bold text-zinc-900">{98 - i}%</span>
                        <span className="text-[10px] text-zinc-400">Yield</span>
                    </div>
                ))}
            </div>

            <div className="mt-8 relative w-64 h-40">
                {/* Cybertruck Wireframe placeholder */}
                <div className="absolute inset-0 border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center bg-zinc-50/50">
                    <Truck className="w-12 h-12 text-zinc-400" />
                    <span className="absolute bottom-2 text-[10px] text-zinc-500">CYBERTRUCK SUB-ASSEMBLY</span>
                </div>
            </div>
        </div>
    )
}

function TaktMonitor() {
    const { taktMetrics } = useTeslaStore();
    const gigaShanghai = taktMetrics.find(m => m.factoryId === 'GIGA_SHA') || taktMetrics[0];

    return (
        <Card className="bg-white border border-zinc-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b border-zinc-200 bg-zinc-50/50">
                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-zinc-700">
                    <Timer className="w-4 h-4 text-orange-500" />
                    Takt Time (Benchmark)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
                <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="#e4e4e7" strokeWidth="8" fill="transparent" />
                        <circle cx="80" cy="80" r="70" stroke="#f97316" strokeWidth="8" fill="transparent" strokeDasharray="440" strokeDashoffset="40" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-zinc-900 tracking-tighter">{gigaShanghai?.currentTakt?.toFixed(2)}s</span>
                        <span className="text-xs text-zinc-500 mt-1">TARGET: {gigaShanghai?.targetTakt}s</span>
                    </div>
                </div>
                <div className="mt-4 w-full flex justify-between text-xs">
                    <div className="flex flex-col items-center">
                        <span className="text-zinc-500">Efficiency</span>
                        <span className="text-green-600 font-bold">{gigaShanghai?.efficiency}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-zinc-500">Last Out</span>
                        <span className="text-zinc-900 font-mono">{gigaShanghai?.lastVehicleTime}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function CostCard() {
    const { cogs } = useTeslaStore();
    return (
        <Card className="bg-white border border-zinc-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b border-zinc-200 bg-zinc-50/50">
                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-zinc-700">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    COGS Monitor
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-bold text-zinc-900">${cogs?.current.toLocaleString()}</span>
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 mb-1 shadow-sm">
                        -1.2% WoW
                    </Badge>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mb-4 border border-zinc-200">
                    <div className="h-full bg-emerald-500 w-[85%]" />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Target: ${cogs?.target.toLocaleString()}</span>
                    <span>Model Y Long Range</span>
                </div>
            </CardContent>
        </Card>
    )
}
