"use client";

import React, { useEffect, useRef } from 'react';
import { Loader2, BrainCircuit, Terminal, CheckCircle2 } from 'lucide-react';
import { Card } from '@nexus/ui';
import { useThinking, AgentEvent } from './ThinkingContext';

export default function ThinkingIndicator() {
    const { state, message, events } = useThinking();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of events
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events]);

    if (state === 'idle') return null;

    return (
        <div className="fixed bottom-8 right-8 z-[9990] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <Card className="w-96 max-h-[500px] flex flex-col bg-white/95 backdrop-blur border-slate-200 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 ${state !== 'done' ? 'animate-spin blur-sm' : ''} absolute opacity-50`}></div>
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center relative z-10">
                            {state === 'done' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Loader2 className="w-4 h-4 text-white animate-spin" />}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Nexus Agent
                        </h4>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{message}</p>
                    </div>
                </div>

                {/* Event Stream */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 min-h-[200px] max-h-[400px]">
                    {events.map((event, i) => (
                        <EventRow key={i} event={event} />
                    ))}
                    {state !== 'done' && (
                        <div className="flex justify-center pt-2">
                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

function EventRow({ event }: { event: AgentEvent }) {
    switch (event.type) {
        case 'thought':
            return (
                <div className="flex gap-3 text-xs text-slate-600">
                    <BrainCircuit className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="italic">{event.content}</div>
                </div>
            );
        case 'tool_start':
            return (
                <div className="flex gap-3 text-xs bg-slate-100 p-2 rounded border border-slate-200">
                    <Terminal className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="font-mono text-blue-700">
                        <div className="font-bold">Executing: {event.tool}</div>
                        <div className="opacity-75 break-all">{JSON.stringify(event.input)}</div>
                    </div>
                </div>
            );
        case 'tool_end':
            return (
                <div className="flex gap-3 text-xs text-green-600 pl-8">
                    <CheckCircle2 className="w-3 h-3 mt-0.5" />
                    <div className="font-mono opacity-75">Result: {String(event.output).slice(0, 50)}...</div>
                </div>
            );
        case 'final_response':
            return (
                <div className="mt-3 p-3 bg-blue-50 text-blue-900 rounded text-sm border border-blue-100">
                    {event.content}
                </div>
            );
        case 'error':
            return (
                <div className="p-2 bg-red-50 text-red-600 rounded text-xs border border-red-100">
                    {event.content}
                </div>
            );
        default:
            return null;
    }
}
