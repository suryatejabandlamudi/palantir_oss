import { useState, useCallback } from 'react';

export type AgentEvent =
    | { type: 'thought', content: string }
    | { type: 'tool_start', tool: string, input: any }
    | { type: 'tool_end', tool: string, output: any }
    | { type: 'final_response', content: string }
    | { type: 'error', content: string };

export interface AgentState {
    isThinking: boolean;
    events: AgentEvent[];
    currentThought: string | null;
    currentTool: string | null;
}

export const useAgent = () => {
    const [state, setState] = useState<AgentState>({
        isThinking: false,
        events: [],
        currentThought: null,
        currentTool: null,
    });

    const runAgent = useCallback(async (prompt: string, context: any = {}) => {
        setState(prev => ({ ...prev, isThinking: true, events: [], currentThought: "Starting...", currentTool: null }));

        try {
            // In dev, we might hit python server directly or via nextjs proxy
            // Assuming direct hitting port 8000 for "Ground up" simplicity, requiring CORS on backend
            // Or better: Use a Relative URL and configuring Next.js rewrites.
            // Let's assume Next.js rewrites /api/agent -> http://127.0.0.1:8000/api/agent

            const response = await fetch('http://localhost:8000/api/agent/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context }),
            });

            if (!response.ok) throw new Error('Agent server connection failed');
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
                        if (dataStr === '[DONE]') break;

                        try {
                            const event = JSON.parse(dataStr) as AgentEvent;

                            setState(prev => {
                                const newState = { ...prev, events: [...prev.events, event] };

                                switch (event.type) {
                                    case 'thought':
                                        newState.currentThought = event.content;
                                        break;
                                    case 'tool_start':
                                        newState.currentTool = `${event.tool} (${JSON.stringify(event.input)})`;
                                        newState.currentThought = `Using tool: ${event.tool}...`;
                                        break;
                                    case 'tool_end':
                                        newState.currentTool = null;
                                        newState.currentThought = `Tool finished: ${event.tool}`;
                                        break;
                                    case 'final_response':
                                        newState.isThinking = false;
                                        newState.currentThought = null;
                                        break;
                                }
                                return newState;
                            });

                        } catch (e) {
                            console.error('Error parsing SSE:', e);
                        }
                    }
                }
            }

        } catch (e) {
            console.error("Agent Run Error:", e);
            setState(prev => ({
                ...prev,
                isThinking: false,
                events: [...prev.events, { type: 'error', content: String(e) }]
            }));
        } finally {
            setState(prev => ({ ...prev, isThinking: false }));
        }
    }, []);

    return { ...state, runAgent };
};
