'use client';

import React, { useState, useRef, useEffect } from 'react';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Send, Bot, Sparkles, AlertTriangle, DollarSign, Box, Database, Terminal, Bell } from 'lucide-react';
import { Button, Input, Panel } from '@nexus/ui';

export default function AIPPage() {
    const [messages, setMessages] = useState<any[]>([
        { role: 'assistant', content: 'Hello. I am AIP. I can analyze your supply chain data, run SQL queries, and monitor for alerts. Try asking: "Show me all vessels" or "What is the impact of Typhoon In-fa?"' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    async function handleSend() {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:8000/aip/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMsg.content })
            });
            const data = await res.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.text,
                structured_data: data.structured_data
            }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to AIP.' }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <WorkspaceLayout
            sidebar={
                <div className="p-4">
                    <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase">AIP Agents</h3>
                    <div className="bg-blue-900/20 border border-blue-800 p-3 rounded mb-2 flex items-center gap-2 text-blue-300">
                        <Bot className="w-4 h-4" />
                        <span>Supply Chain Analyst</span>
                    </div>
                </div>
            }
        >
            <div className="h-full flex flex-col bg-[#111418]">
                <div className="flex-1 overflow-auto p-6 space-y-6" ref={scrollRef}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-purple-900/50 text-purple-400'
                                }`}>
                                {msg.role === 'user' ? 'U' : <Sparkles className="w-4 h-4" />}
                            </div>
                            <div className={`max-w-3xl space-y-4`}>
                                <div className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-gray-800' : 'bg-[#1C2127] border border-gray-800'
                                    }`}>
                                    <p className="text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                                </div>

                                {/* Structured Data Rendering */}
                                {msg.structured_data && (
                                    <ToolOutputRenderer data={msg.structured_data} />
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400 animate-pulse">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="text-gray-500 text-sm py-2">AIP is analyzing...</div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-800 bg-[#1C2127]">
                    <div className="max-w-4xl mx-auto relative">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask AIP to analyze disruptions..."
                            className="pr-12 bg-[#111418] border-gray-700"
                        />
                        <Button
                            className="absolute right-1 top-1 bottom-1"
                            size="sm"
                            onClick={handleSend}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </WorkspaceLayout>
    );
}

function ToolOutputRenderer({ data }: { data: any }) {
    const { tool_name, tool_result } = data;

    if (!tool_result || tool_result.error) return null;

    if (tool_name === 'analyze_impact') {
        return (
            <div className="bg-[#1C2127] border border-gray-800 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    IMPACT ANALYSIS REPORT
                </h4>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-900/20 border border-red-900/50 p-4 rounded">
                        <div className="text-xs text-red-400 uppercase mb-1">Value at Risk</div>
                        <div className="text-2xl font-bold text-white flex items-center">
                            <DollarSign className="w-5 h-5" />
                            {tool_result.impact_summary.total_value_at_risk.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                        <div className="text-xs text-gray-400 uppercase mb-1">Affected Shipments</div>
                        <div className="text-2xl font-bold text-white">
                            {tool_result.impact_summary.affected_shipment_count}
                        </div>
                    </div>
                    <div className="bg-orange-900/20 border border-orange-900/50 p-4 rounded">
                        <div className="text-xs text-orange-400 uppercase mb-1">Critical Priority</div>
                        <div className="text-2xl font-bold text-white">
                            {tool_result.impact_summary.critical_shipments}
                        </div>
                    </div>
                </div>

                <div className="border border-gray-800 rounded overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="bg-[#252A31] text-xs uppercase">
                            <tr>
                                <th className="px-4 py-2">Shipment ID</th>
                                <th className="px-4 py-2">Contents</th>
                                <th className="px-4 py-2">Value</th>
                                <th className="px-4 py-2">Priority</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {tool_result.affected_shipments.map((s: any) => (
                                <tr key={s.id} className="hover:bg-gray-800/50">
                                    <td className="px-4 py-2 font-mono text-blue-400">{s.title}</td>
                                    <td className="px-4 py-2">{s.contents}</td>
                                    <td className="px-4 py-2">${s.value?.toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${s.priority === 'Critical' ? 'bg-red-900/50 text-red-400' : 'bg-gray-700 text-gray-300'
                                            }`}>
                                            {s.priority}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (tool_name === 'run_sql_query') {
        if (!Array.isArray(tool_result) || tool_result.length === 0) {
            return <div className="text-gray-500 italic text-sm">No results found.</div>;
        }
        const columns = Object.keys(tool_result[0]);
        return (
            <div className="bg-[#1C2127] border border-gray-800 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-[#252A31] px-4 py-2 border-b border-gray-800 flex items-center gap-2">
                    <Database className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase">Query Results</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="bg-[#181b21] text-xs uppercase">
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="px-4 py-2 whitespace-nowrap">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {tool_result.map((row: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-800/50">
                                    {columns.map(col => (
                                        <td key={col} className="px-4 py-2 whitespace-nowrap">{String(row[col])}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (tool_name === 'create_alert') {
        const { alert } = tool_result;
        return (
            <div className={`border rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 ${alert.severity === 'critical' ? 'bg-red-900/20 border-red-900 text-red-200' :
                alert.severity === 'warning' ? 'bg-orange-900/20 border-orange-900 text-orange-200' :
                    'bg-blue-900/20 border-blue-900 text-blue-200'
                }`}>
                <Bell className="w-5 h-5 mt-0.5" />
                <div>
                    <div className="font-bold text-sm">{alert.title}</div>
                    <div className="text-sm opacity-90">{alert.message}</div>
                </div>
            </div>
        );
    }

    if (tool_name === 'query_ontology') {
        // tool_result is a JSON string or object
        let schema = tool_result;
        if (typeof tool_result === 'string') {
            try { schema = JSON.parse(tool_result); } catch { }
        }

        return (
            <div className="bg-[#1C2127] border border-gray-800 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-4 font-mono text-xs text-gray-300 overflow-auto max-h-60">
                <pre>{JSON.stringify(schema, null, 2)}</pre>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-2 rounded text-xs font-mono text-gray-400">
            Output from {tool_name}
        </div>
    );
}
