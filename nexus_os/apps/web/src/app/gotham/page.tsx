"use client";

import React, { useState, useEffect } from 'react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Card, Button, Badge } from '@nexus/ui';
import { Globe, Shield, Activity, Radio, AlertOctagon, CheckCircle, Map as MapIcon, Wifi, RefreshCw } from 'lucide-react';

interface Alert {
    id: string;
    title: string;
    category: string;
    severity: string;
    message: string;
    status: string;
    timestamp: string;
}

export default function GothamPage() {
    const [feed, setFeed] = useState<Alert[]>([]);
    const [activeAssets, setActiveAssets] = useState(0);

    const fetchFeed = async () => {
        try {
            const res = await fetch('/api/feed');
            const data = await res.json();
            setFeed(data);
        } catch (e) {
            console.log(e);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/fleet');
            const data = await res.json();
            setActiveAssets(data.filter((v: any) => v.status === 'ACTIVE').length);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        fetchFeed();
        fetchStats();
        const interval = setInterval(() => {
            fetchFeed();
            fetchStats();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const criticalCount = feed.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

    return (
        <ModuleLayout
            title="Gotham"
            description="Global Operations & Command"
            icon={<Globe className="w-6 h-6 text-indigo-500" />}
            action={
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-white/50 backdrop-blur border-zinc-200 text-zinc-600 font-mono">
                        <Wifi className="w-3 h-3 mr-1 text-emerald-500" />
                        SECURE_LINK_V5
                    </Badge>
                </div>
            }
        >
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                {/* Left: Global Map & Status */}
                <div className="col-span-8 flex flex-col gap-6">
                    {/* Map Mockup - Real one would be Mapbox */}
                    <Card className="flex-1 bg-zinc-100 border-zinc-200 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-300">
                            <img
                                src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,20,2,0/800x600?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbG9EXAMPLE"
                                alt="Global Map"
                                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                            />
                            {/* Overlay Pings Mockup - we could position these real absolute divs based on fleet lat/long later */}
                        </div>

                        {/* Status Overlay */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <div className="bg-white/90 backdrop-blur p-3 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <MapIcon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-zinc-500 uppercase font-semibold">Active Assets</div>
                                    <div className="text-xl font-bold text-zinc-900">{activeAssets}</div>
                                </div>
                            </div>
                        </div>

                        {criticalCount > 0 && (
                            <div className="absolute bottom-4 right-4 animate-pulse">
                                <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                    <AlertOctagon className="w-4 h-4" />
                                    <span>{criticalCount} THREATS DETECTED</span>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Quick KPIs */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="p-4 bg-white border-zinc-200 flex items-center gap-4">
                            <Activity className="w-8 h-8 text-emerald-500" />
                            <div>
                                <div className="text-sm text-zinc-500">System Uptime</div>
                                <div className="font-bold text-lg">99.99%</div>
                            </div>
                        </Card>
                        <Card className="p-4 bg-white border-zinc-200 flex items-center gap-4">
                            <Shield className="w-8 h-8 text-indigo-500" />
                            <div>
                                <div className="text-sm text-zinc-500">Security Posture</div>
                                <div className="font-bold text-lg">DEFCON 4</div>
                            </div>
                        </Card>
                        <Card className="p-4 bg-white border-zinc-200 flex items-center gap-4">
                            <Radio className="w-8 h-8 text-sky-500" />
                            <div>
                                <div className="text-sm text-zinc-500">Signal Intelligence</div>
                                <div className="font-bold text-lg">Active</div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Right: Live Feed */}
                <Card className="col-span-4 bg-white border-zinc-200 flex flex-col">
                    <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
                        <div className="font-semibold text-zinc-800 flex items-center gap-2">
                            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                            Live Feed
                        </div>
                        <Badge variant="secondary" className="text-[10px]">REAL-TIME</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0">
                        {feed.length === 0 ? (
                            <div className="p-8 text-center text-zinc-400 text-sm">Waiting for incoming signals...</div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {feed.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-zinc-50 transition-colors flex gap-3 items-start">
                                        <div className={`mt-1 w-2 h-2 rounded-full ${item.severity === 'HIGH' || item.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-sky-500'}`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className="font-medium text-sm text-zinc-900">{item.title}</div>
                                                <span className="text-[10px] text-zinc-400 font-mono">
                                                    {new Date(item.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-1 leading-snug">
                                                {item.message}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-zinc-200 text-zinc-500">
                                                    {item.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

            </div>
        </ModuleLayout>
    );
}
