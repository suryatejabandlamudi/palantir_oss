'use client';

import { useEffect, useState, useRef } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
    id: string;
    message: string;
    status: 'pending' | 'active' | 'complete' | 'failed';
    timestamp: number;
}

interface AgentReasoningProps {
    logs: string[];
    riskScore: number;
}

export default function AgentReasoning({ logs, riskScore }: AgentReasoningProps) {
    const [steps, setSteps] = useState<Step[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!logs || logs.length === 0) return;

        const latestLog = logs[logs.length - 1];
        const newStep: Step = {
            id: Math.random().toString(36).substr(2, 9),
            message: latestLog,
            status: 'active',
            timestamp: Date.now()
        };

        setSteps(prev => {
            const updated = prev.map(s => s.status === 'active' ? { ...s, status: 'complete' as const } : s);
            return [...updated, newStep].slice(-8);
        });

    }, [logs]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [steps]);

    return (
        <div className="h-full flex flex-col bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-1.5 rounded-md border border-blue-100">
                        <Cpu className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-zinc-900 leading-none">Automated Analysis</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1">MODEL: GEMINI-3-PRO-PREVIEW</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">Confidence</div>
                        <div className="text-sm font-bold text-emerald-600 font-mono">99.8%</div>
                    </div>
                </div>
            </div>

            {/* List Body */}
            <div
                ref={scrollRef}
                className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-sm custom-scrollbar bg-white"
                style={{ scrollBehavior: 'smooth' }}
            >
                <AnimatePresence initial={false}>
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-start gap-3 group`}
                        >
                            <div className="mt-0.5 min-w-[16px]">
                                {step.status === 'active' ? (
                                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                )}
                            </div>
                            <div className="flex-1 border-b border-zinc-50 pb-3 group-last:border-0 group-last:pb-0">
                                <p className={`leading-snug ${step.status === 'active' ? 'text-zinc-900 font-medium' : 'text-zinc-600'}`}>
                                    {step.message}
                                </p>
                                <span className="text-[10px] text-zinc-400 mt-1 block font-mono">
                                    {new Date(step.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} • PROCESSED
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
