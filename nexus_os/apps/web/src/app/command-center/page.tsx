'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    ShieldAlert,
    Activity,
    Users,
    Truck,
    AlertTriangle,
    CheckCircle2,
    MapPin,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import IntelligenceFeed from '@/components/dashboard/IntelligenceFeed';

export default function CommandCenterPage() {
    // Mock Data for Initial View
    const [stats, setStats] = useState({
        activeRisks: 12,
        openIncidents: 5,
        supplyChainDelays: 3,
        travelAlerts: 1
    });



    const [activeAgents, setActiveAgents] = useState([
        { name: 'SecOps Agent', status: 'Scanning', task: 'Verifying CVE-2024-9999' },
        { name: 'Supply Chain Agent', status: 'Negotiating', task: 'Emailing Supplier for TRK-987654' },
        { name: 'IT Identity Agent', status: 'Idle', task: 'Monitoring Logs' },
    ]);

    return (
        <div className="p-6 space-y-6 bg-[#0B0C0E] min-h-screen text-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Main Command Center</h1>
                    <p className="text-gray-400 mt-1">Unified view of Enterprise Risk & Operations</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-red-900/50 bg-red-900/20 text-red-200 hover:bg-red-900/40">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        System DEFCON 3
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                        <Activity className="mr-2 h-4 w-4" />
                        Run System Health Check
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Active Risks"
                    value={stats.activeRisks}
                    trend="+2 from yesterday"
                    icon={<AlertTriangle className="h-5 w-5 text-orange-400" />}
                    color="orange"
                />
                <KPICard
                    title="Open Incidents"
                    value={stats.openIncidents}
                    trend="-1 from yesterday"
                    icon={<ShieldAlert className="h-5 w-5 text-red-400" />}
                    color="red"
                />
                <KPICard
                    title="Supply Chain Delays"
                    value={stats.supplyChainDelays}
                    trend="Stable"
                    icon={<Truck className="h-5 w-5 text-blue-400" />}
                    color="blue"
                />
                <KPICard
                    title="Travel Alerts"
                    value={stats.travelAlerts}
                    trend="New Alert"
                    icon={<MapPin className="h-5 w-5 text-purple-400" />}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Feed: Nexus Horizon */}
                <div className="lg:col-span-2">
                    <IntelligenceFeed />
                </div>

                {/* Active Agents Panel */}
                <Card className="bg-[#111418] border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center text-white">
                            <Users className="mr-2 h-5 w-5 text-purple-400" />
                            Active Agents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeAgents.map((agent, i) => (
                            <div key={i} className="p-3 rounded-lg bg-[#1A1D21] border border-gray-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-200">{agent.name}</span>
                                    <Badge variant="secondary" className="bg-green-900/20 text-green-400 text-xs">
                                        {agent.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-400 font-mono truncate">{agent.task}</p>
                                <div className="w-full bg-gray-800 h-1 rounded-full mt-3 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-purple-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "60%" }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="mt-4 pt-4 border-t border-gray-800">
                            <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                                View All Agents <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function KPICard({ title, value, trend, icon, color }: any) {
    const colorClasses = {
        orange: "text-orange-400 border-orange-900/20 bg-orange-900/10",
        red: "text-red-400 border-red-900/20 bg-red-900/10",
        blue: "text-blue-400 border-blue-900/20 bg-blue-900/10",
        purple: "text-purple-400 border-purple-900/20 bg-purple-900/10",
    };

    return (
        <Card className="bg-[#111418] border-gray-800">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
                    </div>
                    <div className={`p-2 rounded-lg ${color === 'orange' ? 'bg-orange-900/20' : color === 'red' ? 'bg-red-900/20' : color === 'blue' ? 'bg-blue-900/20' : 'bg-purple-900/20'}`}>
                        {icon}
                    </div>
                </div>
                <div className="mt-4 flex items-center text-xs">
                    <span className={
                        trend.includes('+') ? "text-red-400" : "text-green-400"
                    }>
                        {trend}
                    </span>
                    <span className="text-gray-500 ml-2">vs last 24h</span>
                </div>
            </CardContent>
        </Card>
    );
}
