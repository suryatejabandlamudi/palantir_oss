"use client";

import React from 'react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Card, Button, Badge } from '@nexus/ui';
import { ShieldAlert, Server, Activity, CheckCircle, Clock, AlertOctagon } from 'lucide-react';

import { useThinking } from '../../components/ui/ThinkingContext';

export default function ITSMPage() {
    const { runAgent } = useThinking();
    return (
        <ModuleLayout
            title="IT Service Management"
            description="ServiceNow Integration - Incidents, Operations, and Change Management"
            icon="🛠️"
            color="bg-red-600 text-white"
            action={
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Report Major Incident
                </Button>
            }
        >
            <div className="grid grid-cols-12 gap-6">

                {/* System Health Status Bar */}
                <div className="col-span-12">
                    <Card className="p-4 bg-zinc-900 border-zinc-800 shadow-md">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-6">
                                <div className="text-white font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-green-400" />
                                    System Status
                                </div>
                                <StatusPill label="Core API" status="Operational" />
                                <StatusPill label="Authentication" status="Operational" />
                                <StatusPill label="Database (Primary)" status="Operational" />
                                <StatusPill label="Payment Gateway" status="Degraded" warning />
                            </div>
                            <div className="text-zinc-400 text-xs text-right">
                                Last updated: Just now
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main: Incident Command */}
                <div className="col-span-8 space-y-6">
                    <Card className="bg-white border border-zinc-200 shadow-sm ring-1 ring-zinc-200/50">
                        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                            <div className="font-semibold text-zinc-800 flex items-center gap-2">
                                <AlertOctagon className="w-4 h-4 text-red-500" />
                                Active Major Incidents
                            </div>
                            <Badge variant="destructive" className="animate-pulse shadow-sm">1 Active</Badge>
                        </div>
                        <div className="p-0 divide-y divide-zinc-100">
                            <div className="p-4 bg-red-50/30">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-zinc-900">INC-2024-001: Payment Gateway High Latency</h3>
                                    <div className="text-red-700 font-bold bg-red-100 px-2 py-1 rounded text-xs border border-red-200">P1 - CRITICAL</div>
                                </div>
                                <p className="text-sm text-zinc-600 mb-4">
                                    Transactions in US-East region are experiencing failures. Engineering and DevOps are investigating.
                                </p>
                                <div className="flex gap-4 text-xs text-zinc-500 mb-4">
                                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Started: 14m ago</div>
                                    <div className="flex items-center gap-1"><Server className="w-3 h-3" /> Service: Stripe Connector</div>
                                </div>
                                <div className="flex gap-3">
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm">Join War Room</Button>
                                    <Button size="sm" variant="secondary" className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700">View Logs</Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white border border-zinc-200 shadow-sm">
                        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                            <div className="font-semibold text-zinc-800">Operational Queue</div>
                            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900">View All</Button>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 text-zinc-500 uppercase text-xs border-b border-zinc-200">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">ID</th>
                                        <th className="px-4 py-3 font-medium">Summary</th>
                                        <th className="px-4 py-3 font-medium">Priority</th>
                                        <th className="px-4 py-3 font-medium">Assignee</th>
                                        <th className="px-4 py-3 font-medium">State</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    <IncidentRow id="INC-9921" summary="VPN Access failure for remote users" priority="P2" assignee="Network Team" state="In Progress" />
                                    <IncidentRow id="INC-9920" summary="Laptop provisioning request" priority="P4" assignee="IT Support" state="New" />
                                    <IncidentRow id="INC-9918" summary="Jira integration sync error" priority="P3" assignee="App Support" state="Resolved" />
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Sidebar - AI & On-Call */}
                <div className="col-span-4 space-y-6">
                    {/* AI Insight Card */}
                    <Card className="p-0 overflow-hidden border-red-500 shadow-md ring-1 ring-red-100">
                        <div className="p-4 bg-gradient-to-r from-red-600 to-orange-600 text-white flex justify-between items-center shadow-inner">
                            <div className="font-semibold flex items-center gap-2">
                                <span className="text-lg">🛡️</span> Security Ops AI
                            </div>
                        </div>
                        <div className="p-4 bg-white">
                            <div className="mb-3">
                                <div className="text-xs font-bold text-zinc-500 uppercase mb-1">Threat Detected</div>
                                <div className="p-3 bg-red-50 rounded-lg text-sm text-red-900 border border-red-100">
                                    <strong className="text-red-700">Impossible Travel:</strong> User 'jdoe' logged in from <strong>Bucharest</strong> 1 hour after NY login.
                                </div>
                            </div>
                            <Button
                                className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md animate-pulse"
                                onClick={() => runAgent("Security Alert: User 'jdoe' flagged for Impossible Travel. Lock the account immediately in Active Directory and scan Outlook logs for exfiltration attempts.")}
                            >
                                Lock Account & Scan Logs
                            </Button>
                        </div>
                    </Card>

                    {/* Identity Risk Radar */}
                    <Card className="overflow-hidden bg-white border border-zinc-200 shadow-sm">
                        <div className="p-4 border-b border-zinc-200 font-semibold bg-zinc-50/50 flex justify-between items-center text-zinc-800">
                            <span>Identity Risk Radar</span>
                            <Badge variant="destructive" className="shadow-sm">High Risk</Badge>
                        </div>
                        <div className="p-6 flex flex-col items-center relative">
                            {/* Radar Visual */}
                            <div className="w-32 h-32 rounded-full border-4 border-red-50 flex items-center justify-center relative bg-red-50/20">
                                <div className="absolute inset-0 rounded-full border border-red-500 animate-[ping_2s_infinite] opacity-20"></div>
                                <div className="text-3xl font-black text-red-600">92</div>
                            </div>
                            <div className="mt-2 text-sm font-bold text-zinc-700">CRITICAL RISK</div>

                            <div className="w-full mt-6 space-y-3">
                                <div className="flex justify-between text-xs border-b border-zinc-100 pb-2">
                                    <span className="text-zinc-500">User</span>
                                    <span className="font-bold text-zinc-900">John Doe (Eng)</span>
                                </div>
                                <div className="flex justify-between text-xs border-b border-zinc-100 pb-2">
                                    <span className="text-zinc-500">Anomaly</span>
                                    <span className="font-bold text-red-600">Geo-Location</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Data Access</span>
                                    <span className="font-bold text-orange-500">Unusual Volume</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-zinc-50 p-3 text-[10px] text-zinc-400 text-center border-t border-zinc-200">
                            UEBA Engine • Real-time Monitoring
                        </div>
                    </Card>
                </div>
            </div>
        </ModuleLayout>
    );
}

function StatusPill({ label, status, warning }: any) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${warning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <div className="text-sm font-medium text-zinc-300">
                <span className="text-zinc-500 mr-2">{label}:</span>
                {status}
            </div>
        </div>
    );
}

function IncidentRow({ id, summary, priority, assignee, state }: any) {
    return (
        <tr className="hover:bg-zinc-50 transition-colors cursor-pointer group">
            <td className="px-4 py-3 font-medium text-zinc-900 group-hover:text-blue-600 transition-colors">{id}</td>
            <td className="px-4 py-3 text-zinc-600">{summary}</td>
            <td className="px-4 py-3">
                <Badge variant={priority === 'P2' ? 'default' : 'secondary'} className={priority === 'P2' ? 'bg-orange-500 text-white shadow-sm' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}>
                    {priority}
                </Badge>
            </td>
            <td className="px-4 py-3 text-zinc-500">{assignee}</td>
            <td className="px-4 py-3 text-zinc-800 font-medium">{state}</td>
        </tr>
    );
}

function OnCallRow({ role, name, phone }: any) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="text-xs text-zinc-500 font-bold uppercase">{role}</div>
                <div className="text-sm font-medium text-zinc-900">{name}</div>
            </div>
            <div className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">
                {phone}
            </div>
        </div>
    );
}
