
'use client';

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    Panel,
    Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { api } from '@/lib/api';
import { Play, Plus, Trash2, Save } from 'lucide-react';

const initialNodes = [
    { id: '1', type: 'input', data: { label: 'Input Node' }, position: { x: 250, y: 5 }, style: { background: '#1e293b', color: 'white', border: '1px solid #475569' } },
];

const initialEdges: any[] = [];

let id = 0;
const getId = () => `node_${id++}`;

export default function AIPBuilder() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [inputs, setInputs] = useState('{"user_name": "Demo User"}');
    const [output, setOutput] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            const newNode = {
                id: getId(),
                type: 'default', // Using default for now to simplify, type stored in data
                position,
                data: { label: `${type} node`, type: type, config: {} },
                style: {
                    background: type === 'prompt' ? '#0f172a' : '#1e293b',
                    color: 'white',
                    border: '1px solid #475569',
                    width: 150
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const runLogic = async () => {
        setIsRunning(true);
        setOutput("Running...");

        // Convert ReactFlow Nodes/Edges to LogicGraph format
        const graph = {
            nodes: nodes.map(n => ({
                id: n.id,
                type: (n.data as any).type || (n.type === 'input' ? 'input' : 'prompt'), // Fallback
                config: (n.data as any).config || {}
            })),
            edges: edges.map(e => ({
                source: e.source,
                target: e.target
            }))
        };

        try {
            const inputData = JSON.parse(inputs);
            const result = await api.runAIPLogic(graph, inputData);
            setOutput(JSON.stringify(result, null, 2));
        } catch (e: any) {
            setOutput(`Error: ${e.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex h-full w-full bg-slate-900 text-white">
            <ReactFlowProvider>
                {/* Sidebar */}
                <aside className="w-64 border-r border-slate-700 p-4 flex flex-col gap-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AIP Builder</h2>

                    <div className="flex flex-col gap-2">
                        <div className="text-sm text-slate-400">Drag nodes to canvas:</div>
                        {['input', 'prompt', 'tool', 'code', 'output'].map((type) => (
                            <div
                                key={type}
                                className="bg-slate-800 p-2 rounded cursor-grab border border-slate-700 hover:border-blue-500 capitalize"
                                onDragStart={(event) => event.dataTransfer.setData('application/reactflow', type)}
                                draggable
                            >
                                {type} Node
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto">
                        <label className="text-sm text-slate-400">Test Inputs (JSON)</label>
                        <textarea
                            className="w-full bg-slate-950 p-2 text-xs font-mono border border-slate-700 rounded h-32"
                            value={inputs}
                            onChange={e => setInputs(e.target.value)}
                        />
                        <button
                            onClick={runLogic}
                            disabled={isRunning}
                            className={`mt-2 w-full flex items-center justify-center gap-2 p-2 rounded font-bold ${isRunning ? 'bg-slate-600' : 'bg-green-600 hover:bg-green-500'}`}
                        >
                            <Play size={16} /> {isRunning ? 'Running...' : 'Run Logic'}
                        </button>
                    </div>
                </aside>

                {/* Canvas */}
                <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        fitView
                    >
                        <Background color="#334155" gap={16} />
                        <Controls />
                        <Panel position="top-right" className="bg-slate-800 p-2 rounded border border-slate-700">
                            <div className="text-xs text-slate-400 mb-1">Node Config</div>
                            {/* Simple config editor for selected node would go here (omitted for MVP) */}
                            <div className="text-xs text-yellow-500">Select node to edit config (Coming Soon)</div>
                        </Panel>
                    </ReactFlow>

                    {/* Console Output */}
                    {output && (
                        <div className="absolute bottom-0 left-0 right-0 h-48 bg-slate-950 border-t border-slate-700 p-4 overflow-auto font-mono text-sm z-10 transition-all">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-green-400">Execution Output</span>
                                <button onClick={() => setOutput(null)} className="text-slate-500 hover:text-white"><Trash2 size={14} /></button>
                            </div>
                            <pre>{output}</pre>
                        </div>
                    )}
                </div>
            </ReactFlowProvider>
        </div>
    );
}
