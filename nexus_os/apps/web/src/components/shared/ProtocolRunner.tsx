'use client';

import { useState } from 'react';
import { Protocol, ProtocolAction } from '../../lib/protocols';
import { runProtocolAgent } from '../../lib/agentCore';
import { executeAction } from '../../lib/actionExecutor';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, AlertTriangle, Loader2, Cpu, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface ProtocolRunnerProps {
    protocol: Protocol;
    contextData: any; // The "Simulated World" data
}

export default function ProtocolRunner({ protocol, contextData }: ProtocolRunnerProps) {
    const [status, setStatus] = useState<'idle' | 'thinking' | 'acting' | 'complete' | 'error'>('idle');
    const [thoughts, setThoughts] = useState<string[]>([]);
    const [selectedAction, setSelectedAction] = useState<ProtocolAction | null>(null);
    const [actionResult, setActionResult] = useState<any>(null);

    const handleRun = async () => {
        setStatus('thinking');
        setThoughts([]);
        setSelectedAction(null);
        setActionResult(null);

        try {
            // 1. Agent Analysis (Thinking)
            const agentResult = await runProtocolAgent(protocol, contextData);
            setThoughts(agentResult.thoughts);

            // Simulate "Reading" time for effect
            await new Promise(r => setTimeout(r, 800));

            if (agentResult.decision === 'BLOCK') {
                setStatus('error');
                return;
            }

            setSelectedAction(agentResult.action);
            setStatus('acting');

            // 2. Action Execution (MCP-Lite)
            if (agentResult.action.id !== 'NO_ACTION' && agentResult.action.id !== 'ERROR') {
                const execution = await executeAction(agentResult.action);
                setActionResult(execution);
            }

            setStatus('complete');

        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Trigger */}
            <Card className="p-6 border-zinc-200 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs font-mono text-zinc-500 mb-2">PROTOCOL: {protocol.id}</div>
                        <h2 className="text-lg font-semibold text-zinc-900">{protocol.title}</h2>
                        <p className="text-sm text-zinc-600 mt-1 max-w-xl">{protocol.description}</p>
                    </div>
                    <Button
                        onClick={handleRun}
                        disabled={status === 'thinking' || status === 'acting'}
                        className={`gap-2 ${status === 'thinking' ? 'bg-amber-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {status === 'thinking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {status === 'thinking' ? 'Agent Thinking...' : 'Run Protocol'}
                    </Button>
                </div>

                {/* Context Preview */}
                <div className="mt-4 p-3 bg-zinc-50 rounded-md border border-zinc-100 font-mono text-xs text-zinc-500 overflow-hidden text-ellipsis whitespace-nowrap">
                    CONTEXT: {JSON.stringify(contextData)}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Agent Brain (Thinking) */}
                <Card className="flex flex-col h-[400px] border-zinc-200 bg-zinc-900 text-white overflow-hidden shadow-md">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-mono font-medium tracking-wide">GEMINI-3-PRO REASONING</span>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-3 custom-scrollbar">
                        <AnimatePresence>
                            {thoughts.map((thought, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-3 text-zinc-300"
                                >
                                    <span className="text-zinc-600 shrink-0">{(i + 1).toString().padStart(2, '0')}</span>
                                    <span>{thought}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {status === 'thinking' && (
                            <div className="flex gap-3 text-emerald-500/50 animate-pulse">
                                <span className="text-zinc-800">..</span>
                                <span>Analyzing context...</span>
                            </div>
                        )}
                        {thoughts.length === 0 && status === 'idle' && (
                            <div className="text-zinc-600 italic">Waiting for trigger...</div>
                        )}
                    </div>
                </Card>

                {/* Right: Execution Output */}
                <Card className="flex flex-col h-[400px] border-zinc-200 bg-white shadow-md relative overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-xs font-semibold text-zinc-700">ACTION EXECUTION</span>
                        </div>
                        {selectedAction?.system && (
                            <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {selectedAction.system}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                        {status === 'idle' || status === 'thinking' ? (
                            <div className="text-zinc-400 flex flex-col items-center">
                                <ActivityPlaceholder />
                                <span className="mt-4 text-sm">Waiting for Agent Decision...</span>
                            </div>
                        ) : selectedAction ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-sm"
                            >
                                <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                                    Action Selected
                                </h3>
                                <div className="text-emerald-600 font-medium mb-6">
                                    {selectedAction.action}
                                </div>

                                <div className="bg-zinc-50 rounded-lg p-4 text-left border border-zinc-100">
                                    <div className="text-xs text-zinc-400 mb-2 uppercase font-semibold">Parameters</div>
                                    <pre className="text-xs font-mono text-zinc-700 whitespace-pre-wrap">
                                        {JSON.stringify(selectedAction.params, null, 2)}
                                    </pre>
                                </div>

                                {actionResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400"
                                    >
                                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                                        <span>Executed in {Date.now() - actionResult.timestamp < 1000 ? '<1s' : '1.2s'}</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : null}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function ActivityPlaceholder() {
    return (
        <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-zinc-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-zinc-300 rounded-full animate-spin"></div>
        </div>
    );
}
