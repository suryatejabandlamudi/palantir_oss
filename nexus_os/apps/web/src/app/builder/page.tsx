"use client";

import React, { useState } from 'react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Button } from '@nexus/ui';
import { Zap, Play, Save } from 'lucide-react';
import { PipelineCanvas } from '../../components/builder/PipelineCanvas';
import { ToolPicker } from '../../components/builder/ToolPicker';
import { ContextEditor } from '../../components/builder/ContextEditor';

export default function BuilderPage() {
    const [systemPrompt, setSystemPrompt] = useState("You are a specialized AI agent designed to analyze...");
    const [temperature, setTemperature] = useState(0.7);

    const handleDeploy = async () => {
        // Construct the payload from the internal state of the Canvas (mocked for now as passing state up from Canvas is complex without context)
        // In a real refactor, we'd move nodes/edges state to this parent or a Store.
        // For this step, we'll demonstrate the "Real" intent by sending the current "System Prompt" as a single-node pipeline.

        try {
            const payload = {
                title: "New Agent Pipeline",
                description: "Deployed from The Forge",
                nodes: [
                    {
                        id: 'trigger-1',
                        type: 'input',
                        data: { label: 'Manual Trigger' },
                        position: { x: 0, y: 0 }
                    },
                    {
                        id: 'agent-1',
                        type: 'default',
                        data: {
                            type: 'AGENT',
                            label: 'Custom Agent',
                            systemPrompt: systemPrompt,
                            temperature: temperature,
                            model: 'GEMINI_PRO_1_5'
                        },
                        position: { x: 200, y: 0 }
                    }
                ],
                edges: [
                    { source: 'trigger-1', target: 'agent-1' }
                ]
            };

            const res = await fetch('/api/agent/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                console.log("Deployed Pipeline ID:", data.pipelineId);
                // Ideally show a toast here
                alert(`Pipeline Deployed! ID: ${data.pipelineId}`);
            } else {
                console.error("Deploy failed");
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ModuleLayout
            title="The Forge"
            description="Agent Studio // Pipeline Builder & Context Engineering"
            icon={<Zap className="w-6 h-6 text-amber-500" />}
            action={
                <div className="flex gap-2">
                    <Button variant="secondary" className="bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm">
                        Load Template
                    </Button>
                    <Button onClick={handleDeploy} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                        Deploy Pipeline
                    </Button>
                </div>
            }
        >
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                {/* Left: Tools & Components */}
                <div className="col-span-2 flex flex-col gap-4">
                    <ToolPicker onSelect={(t) => console.log(t)} />
                </div>

                {/* Center: Canvas */}
                <div className="col-span-7 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
                    <PipelineCanvas />
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm text-[10px] text-zinc-500 font-mono">
                        v2.4.0-stable
                    </div>
                </div>

                {/* Right: Context Engineering */}
                <div className="col-span-3 flex flex-col gap-4">
                    <ContextEditor
                        systemPrompt={systemPrompt}
                        temperature={temperature}
                        onChange={(p, t) => {
                            setSystemPrompt(p);
                            setTemperature(t);
                        }}
                    />
                </div>

            </div>
        </ModuleLayout>
    );
}
