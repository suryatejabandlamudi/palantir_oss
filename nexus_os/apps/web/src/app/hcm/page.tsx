"use client";

import React from 'react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Card, Button, Badge } from '@nexus/ui';
import { Users, Clock, Calendar, HeartPulse, UserPlus, FileText, HardHat, ShieldCheck } from 'lucide-react';

export default function HCMPage() {
    return (
        <ModuleLayout
            title="Tesla One"
            description="Workforce OS - Manufacturing & Engineering Resource Planning"
            icon="🛡️"
            color="bg-zinc-700 text-white"
            action={
                <Button className="bg-zinc-900 hover:bg-black text-white shadow-sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Onboard Technician
                </Button>
            }
        >
            <div className="grid grid-cols-12 gap-6 h-full">

                {/* Team Stats */}
                <div className="col-span-12 grid grid-cols-4 gap-4 h-32">
                    <MetricCard
                        label="Active Workforce"
                        value="127,420"
                        sub="+502 this week"
                        icon={<Users className="text-zinc-400" />}
                    />
                    <MetricCard
                        label="Shift Coverage"
                        value="98.2%"
                        sub="Giga Texas: 100%"
                        color="text-green-600"
                        icon={<Clock className="text-zinc-400" />}
                    />
                    <MetricCard
                        label="Safety Incident Rate"
                        value="0.02"
                        sub="Per 200k Hours"
                        icon={<ShieldCheck className="text-blue-400" />}
                    />
                    <MetricCard
                        label="Open Roles"
                        value="4,200"
                        sub="Engineering: 850"
                        icon={<HardHat className="text-zinc-400" />}
                    />
                </div>

                {/* Main: Shift Plan & Org */}
                <div className="col-span-8 space-y-6">
                    <Card className="bg-white border border-zinc-200 text-zinc-900 shadow-sm ring-1 ring-zinc-200/50">
                        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                            <div className="font-bold text-sm tracking-widest uppercase text-zinc-700">Giga Texas • Shift Alpha</div>
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">ACTIVE</Badge>
                        </div>
                        <div className="p-0">
                            <ShiftRow role="General Assembly" count={450} status="Full" lead="M. Johnson" />
                            <ShiftRow role="Paint Shop" count={120} status="Short (-2)" lead="K. Lee" warning />
                            <ShiftRow role="Cell Integration" count={85} status="Full" lead="A. Patel" />
                            <ShiftRow role="Casting (Giga Press)" count={40} status="Full" lead="T. Stark" />
                        </div>
                    </Card>

                    <Card className="min-h-[300px] bg-white border border-zinc-200 text-zinc-900 relative overflow-hidden shadow-sm">
                        <div className="absolute inset-0 bg-grid-black/[0.02] pointer-events-none" />
                        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                            <div className="font-bold text-sm tracking-widest uppercase text-zinc-700">Org Structure: Autopilot Software</div>
                            <div className="flex gap-2 text-[10px] text-zinc-500 uppercase font-mono">
                                <span>Vision</span>
                                <span>Planning</span>
                                <span>Controls</span>
                            </div>
                        </div>
                        <div className="p-8 flex justify-center items-start overflow-hidden relative z-10">
                            {/* Simple Org Chart Visualization */}
                            <div className="flex flex-col items-center">
                                <div className="flex flex-col items-center mb-8 relative z-10">
                                    <div className="w-12 h-12 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-900 mb-2 shadow-md">
                                        AK
                                    </div>
                                    <div className="font-bold text-sm text-zinc-900">Andrej K.</div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Director of AI</div>
                                </div>
                                <div className="w-px h-8 bg-zinc-300 mb-8"></div>
                                <div className="flex gap-12 relative">
                                    {/* Connecting Line */}
                                    <div className="absolute top-[-32px] left-14 right-14 h-px bg-zinc-300"></div>
                                    <div className="w-px h-8 bg-zinc-300 absolute top-[-32px] left-1/2 -ml-px"></div>
                                    <div className="w-px h-8 bg-zinc-300 absolute top-[-32px] left-14"></div>
                                    <div className="w-px h-8 bg-zinc-300 absolute top-[-32px] right-14"></div>

                                    <OrgNode name="Ashok E." role="Autopilot V1" />
                                    <OrgNode name="Milan K." role="Dojo Infra" active />
                                    <OrgNode name="Dhaval S." role="Labeling" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar - Quick Actions */}
                <div className="col-span-4 space-y-6">
                    {/* Wellness AI */}
                    <Card className="p-0 overflow-hidden border-emerald-200 shadow-md ring-1 ring-emerald-100 bg-white">
                        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 border-b border-emerald-500/20 text-white flex justify-between items-center shadow-inner">
                            <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                <HeartPulse className="w-4 h-4" /> Workforce Health
                            </div>
                        </div>
                        <div className="p-4 bg-white">
                            <div className="flex items-start gap-3 mb-4">
                                <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                <div className="text-xs text-zinc-600 leading-relaxed">
                                    <strong className="text-emerald-700 block mb-1">Ergonomics Alert</strong>
                                    Rotation recommended for Line 4 (General Assembly) due to repetitive motion detection.
                                </div>
                            </div>
                            <Button className="w-full h-8 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                                Initiate Rotation Plan
                            </Button>
                        </div>
                    </Card>

                    <Card className="bg-white border border-zinc-200 text-zinc-900 shadow-sm">
                        <div className="p-4 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-50/50">Onboarding Queue</div>
                        <div className="p-0">
                            <OnboardRow name="J. Smith" role="Process Eng" date="Today" status="Pending Badge" />
                            <OnboardRow name="A. Davis" role="Quality Tech" date="Tomorrow" status="Scheduled" />
                            <OnboardRow name="R. Zhang" role="Software Intern" date="Aug 12" status="Docs Review" />
                        </div>
                    </Card>
                </div>
            </div>
        </ModuleLayout>
    );
}

function MetricCard({ label, value, sub, icon, color }: any) {
    return (
        <Card className="bg-white border border-zinc-200 p-4 relative group hover:bg-zinc-50 transition-colors shadow-sm">
            <div className="absolute top-4 right-4">{icon}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">{label}</div>
            <div className={`text-2xl font-bold font-mono tracking-tight ${color || 'text-zinc-900'}`}>{value}</div>
            <div className="text-xs text-zinc-500 mt-1">{sub}</div>
        </Card>
    )
}

function ShiftRow({ role, count, status, lead, warning }: any) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
            <div>
                <div className="text-sm font-bold text-zinc-900 mb-1 flex items-center gap-2">
                    {role}
                    {warning && <Badge variant="destructive" className="h-4 text-[9px] px-1 shadow-sm">LOW</Badge>}
                </div>
                <div className="text-xs text-zinc-500">Lead: {lead}</div>
            </div>
            <div className="text-right">
                <div className="text-sm font-mono font-bold text-zinc-900">{count}</div>
                <div className={`text-[10px] uppercase font-bold ${warning ? 'text-red-500' : 'text-green-600'}`}>{status}</div>
            </div>
        </div>
    )
}

function OrgNode({ name, role, active }: any) {
    return (
        <div className={`p-3 rounded-lg border text-center w-28 shadow-sm transition-all ${active ? 'bg-zinc-50 border-zinc-300 ring-1 ring-zinc-200' : 'bg-white border-zinc-200'}`}>
            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 mx-auto mb-2 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                {name.split(' ')[0][0]}{name.split(' ')[1][0]}
            </div>
            <div className="text-xs font-bold text-zinc-900">{name}</div>
            <div className="text-[9px] text-zinc-500 uppercase mt-0.5">{role}</div>
        </div>
    );
}

function OnboardRow({ name, role, date, status }: any) {
    return (
        <div className="flex items-center justify-between p-3 border-b border-zinc-100 hover:bg-zinc-50">
            <div>
                <div className="text-xs font-bold text-zinc-900">{name}</div>
                <div className="text-[10px] text-zinc-500">{role}</div>
            </div>
            <div className="text-right">
                <div className="text-[10px] text-zinc-400">{date}</div>
                <Badge variant="secondary" className="text-[9px] h-4 bg-zinc-100 text-zinc-500 border border-zinc-200">{status}</Badge>
            </div>
        </div>
    )
}

