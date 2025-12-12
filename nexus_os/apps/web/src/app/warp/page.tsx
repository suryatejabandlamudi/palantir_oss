"use client";

import React, { useState, useEffect } from 'react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Card, Button, Input, Badge } from '@nexus/ui';
import { Search, Filter, RefreshCw, Satellite, MapPin, Battery, Activity, Truck, AlertTriangle } from 'lucide-react';

interface Vehicle {
    id: string;
    name: string;
    model: string;
    status: string;
    battery: number;
    lat: number;
    lng: number;
    location: string;
    speed: number;
    updatedAt: string;
}

export default function WarpPage() {
    const [fleet, setFleet] = useState<Vehicle[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchFleet = async () => {
        try {
            // setLoading(true); // Don't flicker on refresh
            const res = await fetch('/api/fleet');
            if (res.ok) {
                const data = await res.json();
                setFleet(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFleet();
        const interval = setInterval(fetchFleet, 2000); // Live poll
        return () => clearInterval(interval);
    }, []);

    const filtered = fleet.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = fleet.filter(v => v.status === 'ACTIVE').length;
    const avgBattery = fleet.length ? Math.round(fleet.reduce((acc, v) => acc + v.battery, 0) / fleet.length) : 0;

    return (
        <ModuleLayout
            title="Warp"
            description="Global Logistics & Fleet Command"
            icon={<Satellite className="w-6 h-6 text-sky-500" />}
            action={
                <Button variant="secondary" onClick={() => fetchFleet()} className="bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Telemetry
                </Button>
            }
        >
            <div className="flex flex-col gap-6">

                {/* HUD Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <Card className="p-4 flex items-center gap-4 bg-white border-zinc-200 shadow-sm">
                        <div className="p-3 bg-indigo-50 rounded-xl">
                            <Truck className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <div className="text-sm text-zinc-500 font-medium">Total Fleet</div>
                            <div className="text-2xl font-bold text-zinc-900">{fleet.length}</div>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-4 bg-white border-zinc-200 shadow-sm">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <Activity className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-sm text-zinc-500 font-medium">Active Transit</div>
                            <div className="text-2xl font-bold text-zinc-900">{activeCount}</div>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-4 bg-white border-zinc-200 shadow-sm">
                        <div className="p-3 bg-sky-50 rounded-xl">
                            <Battery className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                            <div className="text-sm text-zinc-500 font-medium">Avg. Battery</div>
                            <div className="text-2xl font-bold text-zinc-900">{avgBattery}%</div>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-4 bg-white border-zinc-200 shadow-sm">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-sm text-zinc-500 font-medium">Fleet Alerts</div>
                            <div className="text-2xl font-bold text-zinc-900">0</div>
                        </div>
                    </Card>
                </div>

                {/* Main Table */}
                <Card className="flex-1 flex flex-col bg-white border-zinc-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                        <div className="flex items-center gap-3 w-96">
                            <Search className="w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="Search by ID or Model..."
                                className="bg-transparent border-none focus:ring-0 text-sm pl-0"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" size="sm" className="text-zinc-500">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter Status
                        </Button>
                    </div>

                    <div className="overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-zinc-500 font-medium uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-4 pl-6">Vehicle ID</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Telemetry</th>
                                    <th className="p-4">Load</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filtered.map((v) => (
                                    <tr key={v.id} className="hover:bg-zinc-50 transition-colors group">
                                        <td className="p-4 pl-6 font-medium text-zinc-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                                                    <Truck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div>{v.name}</div>
                                                    <div className="text-xs text-zinc-400 font-normal">{v.model}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={v.status === 'ACTIVE' ? 'success' : 'secondary'} className="uppercase text-[10px]">
                                                {v.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-zinc-600">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3 text-zinc-400" />
                                                {v.location}
                                                <span className="text-xs text-zinc-400 font-mono">({v.lat.toFixed(2)}, {v.lng.toFixed(2)})</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-600">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5" title="Battery">
                                                    <Battery className="w-3 h-3 text-zinc-400" />
                                                    <span className={v.battery < 20 ? 'text-red-600 font-bold' : ''}>{v.battery}%</span>
                                                </div>
                                                <div className="flex items-center gap-1.5" title="Speed">
                                                    <Activity className="w-3 h-3 text-zinc-400" />
                                                    {v.speed} mph
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-500 font-mono text-xs">
                                            -
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                                                <SettingsIcon />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-zinc-400 italic">
                                            No active vehicles found in fleet registry.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </ModuleLayout>
    );
}

function SettingsIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    )
}
