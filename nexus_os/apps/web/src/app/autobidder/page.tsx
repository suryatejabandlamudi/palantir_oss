"use client";

import React from 'react';
import { useTeslaStore, EnergyAsset } from '@/lib/teslaState';
import { motion } from 'framer-motion';
import {
    Zap,
    Battery,
    TrendingUp,
    Sun,
    Wind,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AutobidderPage() {
    const { assets, gridPrice } = useTeslaStore();

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 p-6 font-mono overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-sm shadow-md">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">AUTOBIDDER <span className="text-zinc-500 text-lg font-normal">ENERGY // v2.0</span></h1>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">Real-Time Energy Trading</p>
                    </div>
                </div>
                <div className="flex items-center gap-8 px-6 py-2 bg-white rounded-lg border border-zinc-200 shadow-sm">
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase">Spot Price (LMP)</p>
                        <p className={`text-xl font-bold font-sans ${gridPrice > 50 ? 'text-emerald-600' : 'text-zinc-700'}`}>
                            ${gridPrice.toFixed(2)} <span className="text-sm text-zinc-400">/ MWh</span>
                        </p>
                    </div>
                    <div className="h-8 w-px bg-zinc-200" />
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase">Fleet Revenue (24h)</p>
                        <p className="text-xl font-bold font-sans text-zinc-900">$57,500</p>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                {/* Left Col: Asset Fleet (4 cols) */}
                <div className="col-span-4 flex flex-col gap-6">
                    <Card className="bg-white border border-zinc-200 flex-1 flex flex-col shadow-sm">
                        <CardHeader className="py-3 px-4 border-b border-zinc-200 bg-zinc-50/50">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-zinc-700">
                                <Battery className="w-4 h-4 text-emerald-500" />
                                Asset Fleet
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                            <AssetList assets={assets} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Market Viz (8 cols) */}
                <div className="col-span-8 flex flex-col gap-6">
                    {/* Graph Placeholder */}
                    <Card className="bg-white border border-zinc-200 h-2/3 relative overflow-hidden shadow-sm">
                        <CardHeader className="py-3 px-4 border-b border-zinc-200 bg-zinc-50/50 absolute top-0 w-full z-10">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-zinc-700">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                    Opticaster Forecast
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="text-[10px] text-zinc-500 bg-white">LOAD</Badge>
                                    <Badge variant="outline" className="text-[10px] text-yellow-600 border-yellow-200 bg-yellow-50">SOLAR</Badge>
                                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50">PRICE</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 h-full relative">
                            <MarketGraph gridPrice={gridPrice} />
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="h-1/3 grid grid-cols-3 gap-6">
                        <MetricCard title="Total Capacity" value="200 MWh" sub="Available for Dispatch" icon={<Battery className="w-4 h-4 text-zinc-400" />} />
                        <MetricCard title="Solar Generation" value="45.2 MW" sub="Peak Output" icon={<Sun className="w-4 h-4 text-yellow-500" />} />
                        <MetricCard title="Grid Frequency" value="60.02 Hz" sub="Stable" icon={<TrendingUp className="w-4 h-4 text-blue-500" />} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function AssetList({ assets }: { assets: EnergyAsset[] }) {
    return (
        <div className="flex flex-col">
            {assets.map((asset) => (
                <div key={asset.id} className="p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{asset.site}</span>
                            <span className="text-[10px] text-zinc-500 uppercase">{asset.type}</span>
                        </div>
                        <StatusBadge status={asset.status} />
                    </div>

                    {/* Battery Bar */}
                    <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                            <span>SoC</span>
                            <span>{asset.chargeLevel}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                            <motion.div
                                className={`h-full ${asset.status === 'CHARGING' ? 'bg-green-500' : 'bg-emerald-600'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${asset.chargeLevel}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-3 flex justify-between items-center bg-zinc-50 p-2 rounded border border-zinc-100">
                        <span className="text-[10px] text-zinc-500">Revenue (Daily)</span>
                        <span className="text-xs font-bold text-zinc-900">${asset.revenue.toLocaleString()}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'DISCHARGING') {
        return (
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] gap-1 animate-pulse shadow-sm">
                <ArrowUpRight className="w-3 h-3" /> SELLING
            </Badge>
        )
    }
    if (status === 'CHARGING') {
        return (
            <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] gap-1 shadow-sm">
                <ArrowDownLeft className="w-3 h-3" /> CHARGING
            </Badge>
        )
    }
    return (
        <Badge variant="secondary" className="bg-zinc-100 text-zinc-500 text-[10px] border border-zinc-200">
            IDLE
        </Badge>
    )
}

function MarketGraph({ gridPrice }: { gridPrice: number }) {
    return (
        <div className="w-full h-full bg-zinc-50 flex items-end relative">
            {/* Simulated Price Curve */}
            <svg className="w-full h-full absolute inset-0 text-emerald-500/20 stroke-current stroke-2 fill-emerald-500/5" preserveAspectRatio="none">
                <path d="M0,300 Q100,280 200,250 T400,100 T600,200 T800,50 L1000,300 Z" />
            </svg>

            {/* Price Line Indicator */}
            <motion.div
                className="absolute top-0 bottom-0 border-r border-dashed border-zinc-400 z-20 flex flex-col justify-end pb-12 pl-2"
                animate={{ left: ['20%', '80%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
                <div className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg">
                    ${gridPrice.toFixed(0)}
                </div>
            </motion.div>
        </div>
    )
}

function MetricCard({ title, value, sub, icon }: { title: string, value: string, sub: string, icon: any }) {
    return (
        <Card className="bg-white border border-zinc-200 flex flex-col justify-center p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-[10px] text-zinc-500 uppercase">{title}</span>
            </div>
            <div className="text-xl font-bold text-zinc-900">{value}</div>
            <div className="text-[10px] text-zinc-500">{sub}</div>
        </Card>
    )
}
