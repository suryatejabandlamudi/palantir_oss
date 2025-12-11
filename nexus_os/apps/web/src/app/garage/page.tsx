"use client";

import React from 'react';
import { useTeslaStore, ServiceTicket } from '@/lib/teslaState';
import { motion } from 'framer-motion';
import {
    Wrench,
    Car,
    Wifi,
    Cpu,
    Battery,
    Zap,
    CheckCircle2,
    AlertTriangle,
    RotateCw,
    Scan
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function GaragePage() {
    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 p-6 font-mono overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-100 rounded-sm border border-zinc-200">
                        <Wrench className="w-6 h-6 text-zinc-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">GARAGE <span className="text-zinc-500 text-lg font-normal">DIAGNOSTICS // v4.1</span></h1>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">Service & Repair OS</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-green-600/20 text-green-700 bg-green-50">
                        <Wifi className="w-3 h-3 mr-2" />
                        FLEET CONNECTED
                    </Badge>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                {/* Left Col: Service Queue (4 cols) */}
                <div className="col-span-4 flex flex-col gap-6">
                    <Card className="bg-white border border-zinc-200 flex-1 flex flex-col shadow-sm">
                        <CardHeader className="py-3 px-4 border-b border-zinc-200 bg-zinc-50/50">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-zinc-700">
                                    <Car className="w-4 h-4 text-blue-500" />
                                    Active Tickets
                                </CardTitle>
                                <span className="text-xs text-zinc-500">2 Active</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                            <ServiceQueue />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Diagnostics (8 cols) */}
                <div className="col-span-8 flex flex-col gap-6">
                    <Card className="bg-white border border-zinc-200 flex-1 relative overflow-hidden shadow-sm">
                        <div className="absolute inset-0 bg-grid-zinc-200/[0.2] pointer-events-none" />
                        <CardHeader className="py-3 px-4 border-b border-zinc-200 bg-zinc-50/50">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-zinc-700">
                                    <Scan className="w-4 h-4 text-purple-600" />
                                    Vehicle Telemetry Analysis
                                </CardTitle>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 animate-pulse">
                                    DIAGNOSING VIN: 5YJ...112
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 h-full flex gap-8">
                            <VehicleSchematic />
                            <DiagnosticLog />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ServiceQueue() {
    const { tickets } = useTeslaStore();

    return (
        <div className="flex flex-col">
            {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer group border-l-2 border-l-transparent hover:border-l-blue-500">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-zinc-900 group-hover:text-blue-600">{ticket.id}</span>
                        <Badge variant="secondary" className="text-[10px] h-5 bg-zinc-100 text-zinc-600 border border-zinc-200">
                            {ticket.serviceCenter}
                        </Badge>
                    </div>
                    <div className="text-sm text-zinc-700 font-bold mb-1">{ticket.customerIssue}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mb-3">VIN: {ticket.vehicleVin}</div>

                    <div className="flex items-center justify-between">
                        <StatusBadge status={ticket.status} />
                        {ticket.automatedFix && (
                            <Badge className="bg-purple-50 text-purple-600 border-purple-200 text-[10px] px-1.5 py-0 h-5">
                                AUTO-FIX
                            </Badge>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        'DIAGNOSING': 'text-purple-600',
        'PARTS_ORDERED': 'text-orange-600',
        'IN_SERVICE': 'text-blue-600',
        'READY': 'text-emerald-600'
    };
    return (
        <span className={`text-[10px] font-bold ${colors[status] || 'text-zinc-500'} flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'DIAGNOSING' ? 'bg-purple-500 animate-pulse' : 'bg-current'}`} />
            {status.replace('_', ' ')}
        </span>
    );
}

function VehicleSchematic() {
    return (
        <div className="flex-1 relative border border-zinc-200 rounded-lg bg-zinc-50 flex items-center justify-center p-8">
            {/* Simple Car Outline SVG */}
            <div className="relative w-full h-full max-w-md opacity-80">
                <svg viewBox="0 0 200 400" className="w-full h-full text-zinc-300 fill-none stroke-current stroke-[2px]">
                    {/* Chassis */}
                    <path d="M 40,320 L 40,80 Q 40,40 100,20 Q 160,40 160,80 L 160,320 Q 160,360 100,380 Q 40,360 40,320 Z" />
                    {/* Wheels */}
                    <rect x="20" y="60" width="20" height="40" rx="4" />
                    <rect x="160" y="60" width="20" height="40" rx="4" />
                    <rect x="20" y="280" width="20" height="40" rx="4" />
                    <rect x="160" y="280" width="20" height="40" rx="4" />
                    {/* Interior */}
                    <path d="M 50,120 L 150,120 L 150,280 L 50,280 Z" className="stroke-zinc-400" />
                </svg>

                {/* Hotspot: Charge Port (Issue) */}
                <div className="absolute top-[280px] left-[25px] flex items-center">
                    <motion.div
                        className="w-4 h-4 rounded-full bg-red-500/50 border border-red-500 z-10"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="ml-4 p-2 bg-white border border-zinc-200 rounded text-[10px] w-32 shadow-sm">
                        <span className="text-red-500 font-bold block mb-1">FAULT DETECTED</span>
                        <div className="text-zinc-700">CP_a021: Latch failure</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DiagnosticLog() {
    return (
        <div className="w-80 border-l border-zinc-100 pl-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Automated Triage</h3>

            <div className="space-y-4">
                <LogItem
                    time="10:02:01"
                    icon={<Wifi className="w-3 h-3 text-blue-500" />}
                    text="Telemetry connection established. Signal strength 98%."
                />
                <LogItem
                    time="10:02:05"
                    icon={<Scan className="w-3 h-3 text-purple-500" />}
                    text="Scanning ECU endpoints..."
                />
                <LogItem
                    time="10:02:12"
                    icon={<AlertTriangle className="w-3 h-3 text-red-500" />}
                    text="VCLEFT_a219: Charge Port Latch state invalid."
                    highlight
                />
                <LogItem
                    time="10:02:15"
                    icon={<Cpu className="w-3 h-3 text-emerald-500" />}
                    text="Attempting firmware reset of VCLEFT node..."
                />
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-zinc-500">RECOMMENDED ACTION</span>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-[10px]">98% Confidence</Badge>
                    </div>
                    <p className="text-xs text-zinc-900 font-bold mb-2">Replace Charge Port ECU Assembly</p>
                    <Button size="sm" className="w-full text-xs h-7 bg-zinc-900 text-white hover:bg-zinc-800">
                        Order Part #10928-A
                    </Button>
                </div>
            </div>
        </div>
    )
}

function LogItem({ time, icon, text, highlight }: { time: string, icon: any, text: string, highlight?: boolean }) {
    return (
        <div className={`flex gap-3 text-[10px] ${highlight ? 'text-red-600' : 'text-zinc-500'}`}>
            <span className="font-mono opacity-50">{time}</span>
            <div className="mt-0.5">{icon}</div>
            <p className="leading-relaxed">{text}</p>
        </div>
    )
}
