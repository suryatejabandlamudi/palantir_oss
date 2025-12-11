"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

export type AgentEvent =
    | { type: 'thought', content: string }
    | { type: 'tool_start', tool: string, input: any }
    | { type: 'tool_end', tool: string, output: any }
    | { type: 'final_response', content: string }
    | { type: 'error', content: string };

interface ThinkingContextType {
    state: 'idle' | 'thinking' | 'executing' | 'done';
    message: string;
    events: AgentEvent[];
    runAgent: (prompt: string, context?: any) => Promise<void>;
    reset: () => void;
}

const ThinkingContext = createContext<ThinkingContextType | undefined>(undefined);

export function ThinkingProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<'idle' | 'thinking' | 'executing' | 'done'>('idle');
    const [message, setMessage] = useState('');
    const [events, setEvents] = useState<AgentEvent[]>([]);

    const reset = () => {
        setState('idle');
        setMessage('');
        setEvents([]);
    };

    const runAgent = useCallback(async (prompt: string, context: any = {}) => {
        reset();
        setState('thinking');
        setMessage('Initializing Agent...');

        try {
            // Assume the backend is on localhost:8000 for now (local dev)
            const response = await fetch('http://localhost:8000/api/agent/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context }),
            });

            if (!response.ok) throw new Error('Agent Connection Failed');
            if (!response.body) throw new Error('No readable stream');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') {
                            setState('done');
                            break;
                        }

                        try {
                            const event = JSON.parse(dataStr) as AgentEvent;

                            setEvents(prev => [...prev, event]);

                            // Update high-level state based on event
                            switch (event.type) {
                                case 'thought':
                                    setState('thinking');
                                    setMessage(event.content);
                                    break;
                                case 'tool_start':
                                    setState('executing');
                                    setMessage(`Executing ${event.tool}...`);
                                    break;
                                case 'tool_end':
                                    setState('thinking');
                                    setMessage(`Finished ${event.tool}`);
                                    break;
                            }
                        } catch (e) {
                            console.error('Error parsing SSE:', e);
                        }
                    }
                }
            }
        } catch (e: any) {
            console.error("Agent Error:", e);
            let errorMsg = String(e);

            if (errorMsg.includes("Failed to fetch")) {
                errorMsg = "Connection Error: Backend server is unreachable (localhost:8000).";
            } else if (errorMsg.includes("Connection refused")) {
                errorMsg = "Connection Refused: Make sure the Agent Server is running.";
            }

            setMessage(errorMsg);
            setEvents(prev => [...prev, { type: 'error', content: errorMsg }]);
            setState('done');
        }
    }, []);

    return (
        <ThinkingContext.Provider value={{ state, message, events, runAgent, reset }}>
            {children}
        </ThinkingContext.Provider>
    );
}

export function useThinking() {
    const context = useContext(ThinkingContext);
    if (!context) {
        throw new Error('useThinking must be used within a ThinkingProvider');
    }
    return context;
}
