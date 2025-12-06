"use client";

import { useState } from "react";
import { Play, CheckCircle, AlertTriangle, Terminal, Activity } from "lucide-react";

type AgentType = "supply-chain" | "cfo" | "cto" | "hr";

interface LogEntry {
    turn: number;
    thought: string;
    actions: {
        tool: string;
        args: any;
        result: any;
    }[];
    status?: string;
}

interface AgentResponse {
    status: string;
    logs: string[];
    trace: LogEntry[];
}

export function AgentSimulationPanel() {
    const [activeTab, setActiveTab] = useState<AgentType>("supply-chain");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AgentResponse | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const scenarios = {
        "supply-chain": {
            title: "Supply Chain Control Tower",
            description: "Scenario: Component X delivery is delayed by 9 days. Impact on Tesla (Strategic) and Apple.",
            endpoint: "/agents/supply-chain/run",
            payload: {
                event_type: "ComponentDeliveryDelayed",
                payload: {
                    component_id: "COMP-X",
                    po_number: "PO-998877",
                    original_delivery_date: "2025-09-01",
                    new_delivery_date: "2025-09-10",
                    delay_days: 9,
                },
            },
            icon: <Activity className="w-5 h-5" />,
        },
        cfo: {
            title: "CFO Cash-Conversion Cockpit",
            description: "Scenario: Analyze AR/AP aging and Sales Forecast to detect cash troughs and suggest deferrals.",
            endpoint: "/agents/cfo/run",
            payload: {
                prompt: "Given SAP AR/AP aging and Salesforce commit, show next-14-day cash trough and 3 vendor pay-deferral options with risk.",
            },
            icon: <AlertTriangle className="w-5 h-5" />,
        },
        cto: {
            title: "CTO Release-Risk Gate",
            description: "Scenario: Scan Jira for risky deployments (no rollback plan) and block them based on policy.",
            endpoint: "/agents/cto/run",
            payload: {
                prompt: "Summarize top risky changes for tonight's deploy and block those missing rollback.",
            },
            icon: <Terminal className="w-5 h-5" />,
        },
        hr: {
            title: "HR Attrition Radar",
            description: "Scenario: Detect burnout (High Meetings + No Leave) for 'Sarah Connor' and draft intervention.",
            endpoint: "/agents/hr/run",
            payload: {
                prompt: "Flag teams with >2σ burnout from Outlook/Teams cadence + Workday PTO anomalies; draft outreach.",
            },
            icon: <CheckCircle className="w-5 h-5" />,
        },
    };

    const runSimulation = async () => {
        setLoading(true);
        setResult(null);
        setLogs([]);

        try {
            const scenario = scenarios[activeTab];
            // Note: In a real app, use the configured API URL. Assuming localhost:8000 for now or proxied.
            // Since this is client-side, we need to point to the API.
            const response = await fetch(`http://localhost:8000${scenario.endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": "Bearer ..." // Add token if needed, assuming bypassed or mocked for demo
                },
                body: JSON.stringify(scenario.payload),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            setResult(data);
            setLogs(data.logs || []);
        } catch (error) {
            console.error("Simulation failed:", error);
            setLogs([`Error: ${error}`]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="text-xl">🧠</span> Enterprise Process Brain
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Agentic Overlay for autonomous decision making.
                </p>
            </div>

            <div className="flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                    {Object.entries(scenarios).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setActiveTab(key as AgentType);
                                setResult(null);
                                setLogs([]);
                            }}
                            className={`w-full text-left p-4 text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === key
                                    ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border-l-2 border-blue-600"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                }`}
                        >
                            {config.icon}
                            {config.title}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 flex flex-col">
                    <div className="mb-6">
                        <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                            {scenarios[activeTab].title}
                        </h4>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                            {scenarios[activeTab].description}
                        </p>

                        <button
                            onClick={runSimulation}
                            disabled={loading}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${loading
                                    ? "bg-zinc-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Running Simulation...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 fill-current" />
                                    Run Agent Simulation
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output Console */}
                    <div className="flex-1 bg-zinc-950 rounded-lg border border-zinc-800 p-4 overflow-y-auto font-mono text-sm max-h-[500px]">
                        {logs.length === 0 && !loading && (
                            <div className="text-zinc-500 italic text-center mt-20">
                                Ready to start. Click "Run Agent Simulation" to begin.
                            </div>
                        )}

                        {logs.map((log, i) => (
                            <div key={i} className="mb-1">
                                {log.startsWith("---") ? (
                                    <span className="text-blue-400 font-bold block mt-4 mb-2">{log}</span>
                                ) : log.startsWith("Agent:") ? (
                                    <span className="text-green-400">{log}</span>
                                ) : log.startsWith("Executing Tool:") ? (
                                    <span className="text-yellow-400">{log}</span>
                                ) : log.startsWith("Tool Result:") ? (
                                    <span className="text-zinc-400 ml-4 block border-l-2 border-zinc-800 pl-2 my-1">{log}</span>
                                ) : (
                                    <span className="text-zinc-300">{log}</span>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="text-zinc-500 animate-pulse mt-2">Agent is thinking...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
