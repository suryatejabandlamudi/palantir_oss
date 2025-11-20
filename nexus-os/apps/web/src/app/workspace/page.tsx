'use client';

import React from 'react';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Box, Map, Terminal, Database, Settings, Search } from 'lucide-react';
import { Button, Input } from '@nexus/ui';

export default function WorkspacePage() {
    return (
        <WorkspaceLayout
            sidebar={
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800">
                        <div className="flex items-center gap-2 text-blue-400 font-bold mb-4">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">N</div>
                            Nexus OS
                        </div>
                        <Input placeholder="Search..." />
                    </div>

                    <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                        <SidebarItem icon={<Database className="w-4 h-4" />} label="Ontology Manager" active />
                        <SidebarItem icon={<Search className="w-4 h-4" />} label="Object Explorer" />
                        <SidebarItem icon={<Map className="w-4 h-4" />} label="Gotham Maps" />
                        <SidebarItem icon={<Terminal className="w-4 h-4" />} label="Pipeline Builder" />
                    </nav>

                    <div className="p-2 border-t border-gray-800">
                        <SidebarItem icon={<Settings className="w-4 h-4" />} label="Settings" />
                    </div>
                </div>
            }
            bottomPanel={
                <div className="h-full flex flex-col">
                    <div className="h-8 bg-[#1C2127] border-b border-gray-800 flex items-center px-4 justify-between">
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                            <Terminal className="w-3 h-3" /> AIP TERMINAL
                        </span>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs text-gray-500">GPT-OSS Online</span>
                        </div>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm text-gray-300 overflow-auto">
                        <div className="mb-2 text-blue-400">AIP&gt; System initialized. DuckDB backend connected.</div>
                        <div className="mb-2">AIP&gt; Listening for commands...</div>
                    </div>
                </div>
            }
        >
            {/* Main Content */}
            <div className="h-full flex flex-col">
                <div className="h-12 border-b border-gray-800 flex items-center px-6 justify-between bg-[#111418]">
                    <h1 className="font-bold text-white flex items-center gap-2">
                        <Box className="w-4 h-4 text-blue-500" />
                        Sensor / Overview
                    </h1>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm">Edit</Button>
                        <Button variant="primary" size="sm">Actions</Button>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-auto">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <StatCard label="Total Sensors" value="1,240" />
                        <StatCard label="Active Alerts" value="3" color="text-red-400" />
                        <StatCard label="Avg Temperature" value="98.6°F" />
                    </div>

                    <div className="bg-[#111418] border border-gray-800 rounded-lg h-96 flex items-center justify-center text-gray-500">
                        [DuckDB Data Grid Placeholder]
                    </div>
                </div>
            </div>
        </WorkspaceLayout>
    );
}

function SidebarItem({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${active ? 'bg-blue-900/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );
}

function StatCard({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
    return (
        <div className="bg-[#111418] border border-gray-800 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
        </div>
    );
}
