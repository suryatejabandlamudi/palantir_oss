"use client";

import React from 'react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Card, Button, Badge } from '@nexus/ui';
import {
    Search,
    Filter,
    Zap,
    Car,
    MapPin,
    CreditCard,
    CheckCircle2,
    Clock,
    ArrowRight
} from 'lucide-react';
import { useThinking } from '../../components/ui/ThinkingContext';

export default function CRMPage() {
    const { runAgent } = useThinking();
    return (
        <ModuleLayout
            title="Tesla Sales OS"
            description="Direct-to-Consumer Core - Order Matching & Logistics"
            icon="⚡"
            color="bg-red-600 text-white"
            action={
                <Button className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm">
                    <Zap className="w-4 h-4 mr-2" />
                    Match VINs (Batch)
                </Button>
            }
        >
            <div className="grid grid-cols-12 gap-6 h-full">
                {/* Metrics / KPI */}
                <div className="col-span-12 grid grid-cols-4 gap-4 h-32">
                    <MetricCard
                        label="Q4 Deliveries"
                        value="484,507"
                        sub="Target: 480k"
                        trend="up"
                        icon={<Car className="text-zinc-400" />}
                    />
                    <MetricCard
                        label="Inventory (Global)"
                        value="14.2 Days"
                        sub="Optimal: 12-16"
                        icon={<MapPin className="text-zinc-400" />}
                    />
                    <MetricCard
                        label="Order Backlog"
                        value="87,200"
                        sub="-2.1% WoW"
                        icon={<Clock className="text-zinc-400" />}
                    />
                    <MetricCard
                        label="Automated Matches"
                        value="94.2%"
                        sub="AI Driven"
                        trend="up"
                        icon={<Zap className="text-yellow-500" />}
                    />
                </div>

                {/* Main Queue: Unmatched Orders */}
                <div className="col-span-8 flex flex-col gap-4">
                    <Card className="flex-1 bg-white border border-zinc-200 shadow-sm flex flex-col overflow-hidden ring-1 ring-zinc-200/50">
                        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                            <div className="font-bold text-sm tracking-widest uppercase flex items-center gap-2 text-zinc-800">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                Unmatched Order Queue
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="text-xs h-7 text-zinc-500 hover:bg-zinc-100">
                                    <Filter className="w-3 h-3 mr-1" /> Region: NA
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-0">
                            <OrderRow
                                id="RN11288492" customer="SpaceX Operations" config="Cybertruck | AWD | Foundation"
                                location="Boca Chica, TX" date="2 days ago" status="Searching"
                            />
                            <OrderRow
                                id="RN11299321" customer="Bezos Expeditions" config="Model S Plaid | Stealth Grey"
                                location="Seattle, WA" date="4 days ago" status="Priority" priority
                            />
                            <OrderRow
                                id="RN11300221" customer="Oracle Corp" config="Model X | Ultra Red"
                                location="Austin, TX" date="1 hour ago" status="Searching"
                            />
                            <OrderRow
                                id="RN11301112" customer="Rivian Automotive" config="Model 3 | Highland"
                                location="Normal, IL" date="Just now" status="Review" warning
                            />
                            <OrderRow
                                id="RN11302331" customer="Hertz Global" config="Model Y | Long Range"
                                location="Miami, FL" date="3 days ago" status="Searching"
                            />
                        </div>
                    </Card>
                </div>

                {/* Sidebar: AI Matcher */}
                <div className="col-span-4 flex flex-col gap-4">
                    <Card className="bg-white border-zinc-200 overflow-hidden relative group shadow-lg ring-1 ring-zinc-200">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                            <div className="font-bold text-sm tracking-widest uppercase flex items-center gap-2 text-purple-600">
                                <Zap className="w-4 h-4" />
                                VIN Matcher v4.0
                            </div>
                            <Badge variant="outline" className="border-purple-200 text-purple-600 bg-purple-50 text-[10px]">AUTO-PILOT</Badge>
                        </div>

                        <div className="p-6 flex flex-col gap-6">
                            <div className="space-y-4">
                                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded flex items-center justify-between">
                                    <div className="text-xs text-zinc-500">Target Order</div>
                                    <div className="font-mono text-sm font-bold text-zinc-900">RN11288492</div>
                                </div>
                                <div className="flex justify-center">
                                    <ArrowRight className="w-5 h-5 text-zinc-400 rotate-90" />
                                </div>
                                <div className="p-3 bg-white border border-green-200 shadow-sm rounded flex items-center justify-between relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
                                    <div className="text-xs text-zinc-500">Best Match</div>
                                    <div className="text-right">
                                        <div className="font-mono text-sm font-bold text-green-600">VIN...8821</div>
                                        <div className="text-[10px] text-green-700">Giga Texas • In Transit • 98%</div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-zinc-600 font-mono leading-relaxed bg-zinc-50 p-3 rounded border border-zinc-100">
                                &gt; ANALYSIS: Found inventory match at Austin-South Hub. Configuration matches exactly. Delivery window &lt; 48hrs.
                            </div>

                            <Button
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                                onClick={() => runAgent("Assign VIN 7G2...8821 to Order RN11288492 and schedule delivery for Dec 24th at Boca Chica.")}
                            >
                                Confirm Assignment
                            </Button>
                        </div>
                    </Card>

                    <Card className="flex-1 bg-white border border-zinc-200 p-4 shadow-sm">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-3">Regional Activity</div>
                        <div className="space-y-3">
                            <RegionRow region="North America" count={1240} status="high" />
                            <RegionRow region="Europe" count={892} status="med" />
                            <RegionRow region="Asia Pacific" count={2100} status="critical" />
                        </div>
                    </Card>
                </div>
            </div>
        </ModuleLayout>
    );
}

function MetricCard({ label, value, sub, trend, icon }: any) {
    return (
        <Card className="bg-white border border-zinc-200 p-4 relative group hover:bg-zinc-50 transition-colors shadow-sm">
            <div className="absolute top-4 right-4">{icon}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">{label}</div>
            <div className="text-2xl font-bold text-zinc-900 font-mono tracking-tight">{value}</div>
            {sub && <div className={`text-xs mt-1 ${trend === 'up' ? 'text-green-600' : 'text-zinc-500'}`}>{sub}</div>}
        </Card>
    )
}

function OrderRow({ id, customer, config, location, date, status, priority, warning }: any) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-sm bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500">
                    {customer.charAt(0)}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900">{customer}</span>
                        {priority && <Badge className="bg-purple-50 text-purple-600 border border-purple-200 text-[9px] px-1.5 shadow-sm">VIP</Badge>}
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                        <span className="font-mono text-zinc-600">{id}</span>
                        <span>•</span>
                        <span>{config}</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className={`text-xs font-bold px-2 py-1 rounded border shadow-sm ${warning ? 'bg-red-50 text-red-600 border-red-200' : priority ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}>
                    {status}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">{location}</div>
            </div>
        </div>
    )
}

function RegionRow({ region, count, status }: any) {
    const color = status === 'critical' ? 'bg-red-500' : status === 'high' ? 'bg-green-500' : 'bg-blue-500';
    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-600 font-medium">{region}</span>
            <div className="flex items-center gap-2">
                <span className="text-zinc-900 font-mono">{count}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${color} shadow-sm`} />
            </div>
        </div>
    )
}

