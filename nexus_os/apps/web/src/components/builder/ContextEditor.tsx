import { useState } from 'react';
import { Button } from '@nexus/ui'; // Import UI components as needed, or use standard HTML for speed if UI lib is complex
import { Save, Sparkles, Sliders } from 'lucide-react';

interface ContextEditorProps {
    systemPrompt: string;
    temperature: number;
    onChange: (prompt: string, temp: number) => void;
}

export function ContextEditor({ systemPrompt, temperature, onChange }: ContextEditorProps) {
    const [localPrompt, setLocalPrompt] = useState(systemPrompt);
    const [localTemp, setLocalTemp] = useState(temperature);

    const handleSave = () => {
        onChange(localPrompt, localTemp);
    };

    return (
        <div className="h-full flex flex-col bg-zinc-50 border-l border-zinc-200 w-96">
            <div className="p-4 border-b border-zinc-200 bg-white flex justify-between items-center">
                <div className="flex items-center gap-2 font-semibold text-zinc-900">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Context Engineering
                </div>
                <Button onClick={handleSave} className="h-8 text-xs">
                    <Save className="w-3 h-3 mr-1" /> Update
                </Button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-6">

                {/* Temperature Slider */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <Sliders className="w-3 h-3" /> Temperature (Creativity)
                        </div>
                        <span className="text-zinc-900 bg-zinc-200 px-2 py-0.5 rounded">{localTemp.toFixed(1)}</span>
                    </div>
                    <input
                        type="range"
                        min="0" max="1" step="0.1"
                        value={localTemp}
                        onChange={e => setLocalTemp(parseFloat(e.target.value))}
                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>Precise (0.0)</span>
                        <span>Creative (1.0)</span>
                    </div>
                </div>

                {/* System Prompt Editor */}
                <div className="space-y-2 h-full flex flex-col">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">System Constitution</label>
                    <textarea
                        value={localPrompt}
                        onChange={e => setLocalPrompt(e.target.value)}
                        className="flex-1 w-full bg-white border border-zinc-200 rounded-lg p-3 text-sm font-mono text-zinc-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none shadow-sm"
                        placeholder="You are a highly capable AI agent designed to..."
                    />
                    <p className="text-[10px] text-zinc-400">
                        Define the persona, constraints, and operational boundaries of the agent here.
                    </p>
                </div>

            </div>
        </div>
    );
}
