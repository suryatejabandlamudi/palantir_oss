'use client';

import React, { useState } from 'react';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Play, Plus, Code2, Database, FileText } from 'lucide-react';
import { Button, Panel, Input } from '@nexus/ui';

export default function PipelineBuilderPage() {
    const [code, setCode] = useState(`def transform(inputs, conn):
    # Access input data as DataFrames
    # df = inputs['Aircraft']
    
    # Return the transformed data
    # return df
    return inputs[list(inputs.keys())[0]]`);

    const [logs, setLogs] = useState('');
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
    const [inputTypes, setInputTypes] = useState<string[]>(['Aircraft']); // Hardcoded for MVP
    const [outputType, setOutputType] = useState<string>('ProcessedAircraft');

    const runPipeline = async () => {
        setStatus('running');
        setLogs('Executing pipeline...\n');

        try {
            const res = await fetch('http://localhost:8000/pipelines/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    input_object_types: inputTypes,
                    output_object_type_id: 'preview-id' // Mock ID, backend uses name if not found
                })
            });
            const data = await res.json();

            setLogs(prev => prev + (data.logs || '') + '\n');

            if (data.status === 'COMPLETED') {
                setLogs(prev => prev + `✓ Pipeline completed successfully. Rows written: ${data.rows_written}\n`);
                setStatus('success');
            } else {
                setLogs(prev => prev + `✗ Pipeline failed.\n`);
                setStatus('error');
            }
        } catch (e) {
            setLogs(prev => prev + `Error connecting to server: ${e}\n`);
            setStatus('error');
        }
    };

    return (
        <WorkspaceLayout
            sidebar={
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800">
                        <h2 className="text-sm font-bold text-gray-400 mb-3">PIPELINES</h2>
                        <Button variant="primary" size="sm" className="w-full">
                            <Plus className="w-3 h-3 mr-2" />
                            New Pipeline
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        <PipelineItem title="Filter High Sensors" active />
                        <PipelineItem title="Calculate Averages" />
                        <PipelineItem title="Data Quality Check" />
                    </div>
                </div>
            }
            bottomPanel={
                <div className="h-full flex flex-col">
                    <div className="h-8 bg-[#1C2127] border-b border-gray-800 flex items-center px-4">
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                            <FileText className="w-3 h-3" /> PIPELINE LOGS
                        </span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-xs text-gray-300 overflow-auto bg-black">
                        <pre className={status === 'success' ? 'text-green-400' : status === 'error' ? 'text-red-400' : ''}>
                            {logs || 'Ready to execute pipeline...'}
                        </pre>
                    </div>
                </div>
            }
        >
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="h-12 border-b border-gray-800 flex items-center px-6 justify-between bg-[#111418]">
                    <h1 className="font-bold text-white flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-blue-500" />
                        Pipeline Builder
                    </h1>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm">Save</Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={runPipeline}
                            disabled={status === 'running'}
                        >
                            <Play className="w-3 h-3 mr-1" />
                            {status === 'running' ? 'Running...' : 'Run'}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Config Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Configuration</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Input Object Types</label>
                                <div className="bg-[#111418] border border-gray-800 rounded px-3 py-2 text-sm">
                                    <span className="inline-flex items-center gap-2 bg-blue-900/20 text-blue-400 px-2 py-1 rounded text-xs">
                                        <Database className="w-3 h-3" />
                                        Aircraft
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Output Object Type</label>
                                <div className="bg-[#111418] border border-gray-800 rounded px-3 py-2 text-sm">
                                    <span className="inline-flex items-center gap-2 bg-green-900/20 text-green-400 px-2 py-1 rounded text-xs">
                                        <Database className="w-3 h-3" />
                                        ProcessedAircraft
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <Code2 className="w-4 h-4" />
                            Transformation Code
                        </h3>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-80 bg-[#0D1117] border border-gray-800 rounded p-4 font-mono text-sm text-gray-300 focus:outline-none focus:border-blue-600"
                            spellCheck={false}
                        />
                        <div className="mt-2 text-xs text-gray-500">
                            Supports <strong>Python</strong> (def transform...) or <strong>SQL</strong> (SELECT...).
                        </div>
                    </div>
                </div>
            </div>
        </WorkspaceLayout>
    );
}

function PipelineItem({ title, active }: { title: string, active?: boolean }) {
    return (
        <div className={`px-3 py-2 rounded text-sm mb-1 cursor-pointer transition-colors ${active ? 'bg-blue-900/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'
            }`}>
            <div className="flex items-center gap-2">
                <Code2 className="w-3 h-3" />
                <span>{title}</span>
            </div>
        </div>
    );
}
