'use client';

import { useState } from 'react';
import {
    Plus, X, Save, Play,
    ArrowRight, Settings, Check,
    Zap, AlertTriangle, Shield, User,
    Layout
} from 'lucide-react';
import { Protocol, ProtocolAction, ProtocolCondition, SystemType, useTeslaStore } from '@/lib/teslaState';

// --- Icons Map ---
const SystemIcons: Record<SystemType, any> = {
    SLACK: Layout, // Placeholder
    TEAMS: User, // Using User icon for Teams as requested
    EMAIL: Layout,
    WORKDAY: User,
    SAP: Settings,
    SALESFORCE: Layout,
    SERVICENOW: Settings,
    JIRA: Layout,
    SPLUNK: Zap,
    CROWDSTRIKE: Shield
};

const SystemNames: Record<SystemType, string> = {
    SLACK: 'Slack',
    TEAMS: 'Microsoft Teams',
    EMAIL: 'Email',
    WORKDAY: 'Workday',
    SAP: 'SAP',
    SALESFORCE: 'Salesforce',
    SERVICENOW: 'ServiceNow',
    JIRA: 'Jira',
    SPLUNK: 'Splunk',
    CROWDSTRIKE: 'CrowdStrike'
};

interface ProtocolBuilderProps {
    onClose: () => void;
}

export function ProtocolBuilder({ onClose }: ProtocolBuilderProps) {
    const addProtocol = useTeslaStore(state => state.addProtocol);

    // Form State
    const [title, setTitle] = useState("New Protocol");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<Protocol['category']>("ITSM");

    // Steps State
    const [triggerSystem, setTriggerSystem] = useState<SystemType>("SPLUNK");
    const [triggerEvent, setTriggerEvent] = useState("incident.created");

    const [conditions, setConditions] = useState<ProtocolCondition[]>([]);
    const [actions, setActions] = useState<ProtocolAction[]>([]);

    const handleSave = () => {
        const newProtocol: Protocol = {
            id: `PROT-${Math.floor(Math.random() * 1000)}`,
            title,
            description,
            contextSchema: {},
            category,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            steps: {
                trigger: {
                    id: `trig-${Date.now()}`,
                    system: triggerSystem,
                    event: triggerEvent,
                    description: `Event from ${triggerSystem}`
                },
                conditions,
                actions
            },
            stats: { runs: 0, successRate: 100 }
        };

        addProtocol(newProtocol);
        onClose();
    };

    const addCondition = () => {
        setConditions([...conditions, {
            id: `cond-${Date.now()}`,
            field: 'severity',
            operator: 'EQUALS',
            value: 'HIGH'
        }]);
    };

    const addAction = () => {
        setActions([...actions, {
            id: `act-${Date.now()}`,
            type: 'AI_AGENT',
            system: 'SLACK',
            action: 'post_message',
            params: {},
            agentRole: 'Support Agent'
        }]);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200">

                {/* Header */}
                <div className="h-16 px-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                    <div>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="bg-transparent text-xl font-bold text-zinc-900 focus:outline-none focus:ring-0 placeholder-zinc-400 w-96 p-0 border-none"
                            placeholder="Protocol Name"
                        />
                        <div className="flex gap-2 text-xs mt-1">
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value as any)}
                                className="bg-white border border-zinc-200 rounded px-1 py-0.5 text-zinc-600 focus:outline-none"
                            >
                                <option value="ITSM">ITSM</option>
                                <option value="SecOps">SecOps</option>
                                <option value="Revenue">Revenue</option>
                                <option value="HR">HR</option>
                                <option value="SupplyChain">Supply Chain</option>
                            </select>
                            <span className="text-zinc-400">|</span>
                            <span className="text-zinc-400 uppercase tracking-wider font-semibold">DRAFT</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg text-sm font-medium transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-5 py-2 bg-zinc-900 hover:bg-black text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                            <Save size={16} /> Save Protocol
                        </button>
                    </div>
                </div>

                {/* Main Builder Area */}
                <div className="flex-1 bg-zinc-50/50 p-8 overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-8 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-zinc-200 -z-10" />

                        {/* 1. TRIGGER */}
                        <div className="relative pl-20 group">
                            <div className="absolute left-4 top-0 w-8 h-8 bg-white border-2 border-zinc-900 rounded-full flex items-center justify-center z-10 shadow-sm">
                                <Zap size={14} className="text-zinc-900" />
                            </div>
                            <div className="absolute left-[3.25rem] top-3.5 w-6 h-0.5 bg-zinc-300" />

                            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    When this happens...
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-500 mb-1">System Source</label>
                                        <select
                                            value={triggerSystem}
                                            onChange={e => setTriggerSystem(e.target.value as SystemType)}
                                            className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-zinc-50 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        >
                                            {Object.keys(SystemIcons).map(sys => (
                                                <option key={sys} value={sys}>{SystemNames[sys as SystemType]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-500 mb-1">Event Type</label>
                                        <input
                                            value={triggerEvent}
                                            onChange={e => setTriggerEvent(e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg p-2.5 text-sm bg-zinc-50 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                                            placeholder="e.g. incident.created"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. CONDITIONS */}
                        <div className="relative pl-20 group">
                            <div className="absolute left-4 top-0 w-8 h-8 bg-white border-2 border-zinc-300 rounded-full flex items-center justify-center z-10 shadow-sm text-zinc-400">
                                <Settings size={14} />
                            </div>
                            <div className="absolute left-[3.25rem] top-3.5 w-6 h-0.5 bg-zinc-300" />

                            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2 justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        And specific conditions are met...
                                    </div>
                                    <button onClick={addCondition} className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
                                        <Plus size={12} /> Add Condition
                                    </button>
                                </h3>

                                <div className="space-y-3">
                                    {conditions.length === 0 && (
                                        <p className="text-sm text-zinc-400 italic">No conditions (Always run)</p>
                                    )}
                                    {conditions.map((cond, idx) => (
                                        <div key={cond.id} className="flex gap-2 items-center animate-in fade-in slide-in-from-left-2">
                                            <span className="text-xs font-mono text-zinc-400 uppercase w-8 text-right">{idx === 0 ? 'IF' : 'AND'}</span>
                                            <input
                                                value={cond.field}
                                                onChange={e => {
                                                    const newConds = [...conditions];
                                                    newConds[idx].field = e.target.value;
                                                    setConditions(newConds);
                                                }}
                                                className="flex-1 border border-zinc-200 rounded p-2 text-sm"
                                                placeholder="Field (e.g. severity)"
                                            />
                                            <select
                                                value={cond.operator}
                                                onChange={e => {
                                                    const newConds = [...conditions];
                                                    newConds[idx].operator = e.target.value as any;
                                                    setConditions(newConds);
                                                }}
                                                className="w-32 border border-zinc-200 rounded p-2 text-sm bg-zinc-50"
                                            >
                                                <option value="EQUALS">Equals</option>
                                                <option value="GREATER_THAN">Greater Than</option>
                                                <option value="CONTAINS">Contains</option>
                                            </select>
                                            <input
                                                value={String(cond.value)}
                                                onChange={e => {
                                                    const newConds = [...conditions];
                                                    newConds[idx].value = e.target.value;
                                                    setConditions(newConds);
                                                }}
                                                className="flex-1 border border-zinc-200 rounded p-2 text-sm"
                                                placeholder="Value"
                                            />
                                            <button onClick={() => setConditions(conditions.filter(c => c.id !== cond.id))} className="p-2 text-zinc-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. ACTIONS */}
                        <div className="relative pl-20 group">
                            <div className="absolute left-4 top-0 w-8 h-8 bg-zinc-900 border-2 border-zinc-900 rounded-full flex items-center justify-center z-10 shadow-sm text-white">
                                <Play size={14} fill="currentColor" />
                            </div>
                            <div className="absolute left-[3.25rem] top-3.5 w-6 h-0.5 bg-zinc-300" />

                            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2 justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Then execute these actions...
                                    </div>
                                    <button onClick={addAction} className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
                                        <Plus size={12} /> Add Action
                                    </button>
                                </h3>

                                <div className="space-y-4">
                                    {actions.length === 0 && (
                                        <p className="text-sm text-zinc-400 italic">No actions defined.</p>
                                    )}
                                    {actions.map((act, idx) => (
                                        <div key={act.id} className="border border-zinc-100 bg-zinc-50/50 rounded-lg p-3 relative group/item animate-in fade-in slide-in-from-left-2">
                                            <button onClick={() => setActions(actions.filter(a => a.id !== act.id))} className="absolute top-2 right-2 p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <X size={14} />
                                            </button>

                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="w-6 h-6 rounded bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">{idx + 1}</span>
                                                <select
                                                    value={act.type}
                                                    onChange={e => {
                                                        const newActs = [...actions];
                                                        newActs[idx].type = e.target.value as any;
                                                        setActions(newActs);
                                                    }}
                                                    className="border-none bg-transparent font-medium text-sm focus:ring-0 text-zinc-900 pr-8"
                                                >
                                                    <option value="AI_AGENT">🤖 AI Agent</option>
                                                    <option value="AUTOMATION">⚡ Strict Automation</option>
                                                    <option value="HUMAN_APPROVAL">👤 Human Approval</option>
                                                </select>
                                                <ArrowRight size={14} className="text-zinc-300" />
                                                <select
                                                    value={act.system}
                                                    onChange={e => {
                                                        const newActs = [...actions];
                                                        newActs[idx].system = e.target.value as any;
                                                        setActions(newActs);
                                                    }}
                                                    className="border-none bg-transparent font-medium text-sm focus:ring-0 text-zinc-600"
                                                >
                                                    {Object.keys(SystemIcons).map(sys => (
                                                        <option key={sys} value={sys}>{SystemNames[sys as SystemType]}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="pl-9 grid grid-cols-2 gap-3">
                                                <input
                                                    value={act.action}
                                                    onChange={e => {
                                                        const newActs = [...actions];
                                                        newActs[idx].action = e.target.value;
                                                        setActions(newActs);
                                                    }}
                                                    className="border border-zinc-200 rounded p-2 text-sm bg-white"
                                                    placeholder="Function (e.g. post_message)"
                                                />
                                                <input
                                                    value={JSON.stringify(act.params)}
                                                    onChange={e => {
                                                        // Simplified params edit for prototype
                                                        // In real app use a key-value editor
                                                    }}
                                                    className="border border-zinc-200 rounded p-2 text-sm bg-white font-mono text-zinc-500"
                                                    placeholder="{ params... }"
                                                    readOnly // Read only for simple proto, assume default params
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
