import React, { useState, useEffect, useRef } from 'react';
import { Shield, Server, Users, MessageSquare, Terminal, ChevronRight, ChevronDown, Play, Pause, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentEvent {
    agent: {
        name: string;
        role: string;
        icon: string;
    };
    type: string; // 'thinking', 'action', 'message', 'complete'
    content: string;
    timestamp: string;
}

export function AgentTerminal() {
    const [events, setEvents] = useState<AgentEvent[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentThought, setCurrentThought] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const startSimulation = async () => {
        setIsSimulating(true);
        setEvents([]);

        try {
            const response = await fetch("http://localhost:8001/agents/simulate/security-incident");
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) return;

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n").filter(line => line.trim() !== "");

                for (const line of lines) {
                    try {
                        const event = JSON.parse(line);
                        setEvents(prev => [...prev, event]);
                    } catch (e) {
                        console.error("Error parsing event:", e, line);
                    }
                }
            }
        } catch (err) {
            console.error("Simulation failed:", err);
        } finally {
            setIsSimulating(false);
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [events]);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'shield-alert': return <Shield className="w-4 h-4 text-red-400" />;
            case 'server': return <Server className="w-4 h-4 text-blue-400" />;
            case 'users': return <Users className="w-4 h-4 text-purple-400" />;
            case 'message-square': return <MessageSquare className="w-4 h-4 text-green-400" />;
            default: return <Activity className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#09090b] text-sm font-mono overflow-hidden rounded-lg border border-zinc-800 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    <span className="font-semibold text-zinc-300">Nexus Autonomous Agent </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">BETA</span>
                </div>
                <button
                    onClick={startSimulation}
                    disabled={isSimulating}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${isSimulating ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                    {isSimulating ? <Activity className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    {isSimulating ? 'Running Simulation...' : 'Start Incident Sim'}
                </button>
            </div>

            {/* Terminal Output */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
                {events.length === 0 && !isSimulating && (
                    <div className="text-zinc-500 text-center mt-20">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Ready to simulate autonomous security response.</p>
                        <p className="text-xs opacity-50 mt-2">Initialize Agents to begin monitoring.</p>
                    </div>
                )}

                {events.map((event, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-4 group"
                    >
                        {/* Timeline / connector line logic could go here */}
                        <div className="mt-1 opacity-70">
                            {getIcon(event.agent.icon)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-zinc-300">{event.agent.name}</span>
                                <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{event.agent.role}</span>
                            </div>

                            {/* Thinking Block */}
                            {event.type === 'thinking' && (
                                <div className="text-zinc-500 italic flex items-center gap-2 pl-2 border-l-2 border-zinc-800">
                                    <span className="animate-pulse">Thinking:</span> {event.content}
                                </div>
                            )}

                            {/* Action Block */}
                            {event.type === 'action' && (
                                <div className="text-green-400/90 pl-2 border-l-2 border-green-900/50 bg-green-900/10 p-2 rounded-r">
                                    <span className="mr-2">⚡</span> {event.content}
                                </div>
                            )}

                            {/* Message Block */}
                            {event.type === 'message' && (
                                <div className="text-zinc-300 pl-2 border-l-2 border-zinc-700 bg-zinc-800/30 p-2 rounded-r">
                                    <span className="mr-2">💬</span> "{event.content}"
                                </div>
                            )}

                            {/* Complete Block */}
                            {event.type === 'complete' && (
                                <div className="text-blue-400 font-bold border-t border-zinc-800 pt-4 mt-2">
                                    ✓ {event.content}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
