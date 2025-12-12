"use client";

import React, { useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
    Node,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Card, Button, Badge } from '@nexus/ui';
import { Hexagon, Search, Database, FileText, Share2, Layers, Search as SearchIcon } from 'lucide-react';

// --- MOCK REAL DATA (To be replaced by API call to /api/ontology) ---
const INITIAL_NODES: Node[] = [
    { id: 'obj-1', type: 'default', position: { x: 250, y: 5 }, data: { label: 'Tesla, Inc.' }, style: { background: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px', width: 180, fontWeight: 'bold' } },
    { id: 'obj-2', type: 'default', position: { x: 100, y: 150 }, data: { label: 'Model Y' }, style: { background: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px', width: 180 } },
    { id: 'obj-3', type: 'default', position: { x: 400, y: 150 }, data: { label: 'Giga Texas' }, style: { background: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px', width: 180 } },
    { id: 'doc-1', type: 'output', position: { x: 400, y: 300 }, data: { label: '📄 Security Protocol 77' }, style: { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', width: 180 } },
    { id: 'agent-1', type: 'input', position: { x: 50, y: 300 }, data: { label: 'Agent: Logistics' }, style: { background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#5b21b6', width: 180 } },
];

const INITIAL_EDGES: Edge[] = [
    { id: 'e1-2', source: 'obj-1', target: 'obj-2', animated: true, label: 'MANUFACTURES' },
    { id: 'e1-3', source: 'obj-1', target: 'obj-3', label: 'OWNS' },
    { id: 'e3-2', source: 'obj-3', target: 'obj-2', label: 'PRODUCES' },
    { id: 'e3-d1', source: 'obj-3', target: 'doc-1', label: 'GOVERNED_BY', type: 'step' },
    { id: 'a1-2', source: 'agent-1', target: 'obj-2', label: 'MONITORS', animated: true, style: { stroke: '#8b5cf6' } },
];

export default function OntologyPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
    const [selectedObject, setSelectedObject] = useState<any>(null);

    return (
        <ModuleLayout
            title="Ontology"
            description="Enterprise Knowledge Graph & Data Assets"
            icon={<Hexagon className="w-6 h-6 text-purple-600" />}
        >
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                {/* Graph Area */}
                <div className="col-span-8 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={(_, node) => setSelectedObject(node)}
                        fitView
                        attributionPosition="bottom-right"
                    >
                        <Background color="#e4e4e7" gap={20} />
                        <Controls className="bg-white border-zinc-200 shadow-sm" />
                        <MiniMap className="bg-white border-zinc-200 shadow-sm" nodeColor={() => '#e4e4e7'} />
                    </ReactFlow>

                    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-zinc-200 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-zinc-600">Real-Time Sync Active</span>
                    </div>
                </div>

                {/* Right Panel: Object Details & RAG Search */}
                <div className="col-span-4 flex flex-col gap-6">
                    {/* Search / Explore Tool */}
                    <Card className="bg-white border border-zinc-200 p-0 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h3 className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                                <SearchIcon className="w-3 h-3" />
                                Semantic Search
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ask the knowledge base..."
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                            </div>
                            <div className="flex gap-2 text-[10px] text-zinc-500">
                                <span>Suggested:</span>
                                <span className="hover:text-purple-600 cursor-pointer underline decoration-dotted">Model Y defects</span>
                                <span className="hover:text-purple-600 cursor-pointer underline decoration-dotted">Berlin Output</span>
                            </div>
                        </div>
                    </Card>

                    {/* Object Details */}
                    <Card className="flex-1 bg-white border border-zinc-200 p-0 overflow-hidden shadow-sm flex flex-col">
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h3 className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                                <Layers className="w-3 h-3" />
                                Selected Entity
                            </h3>
                        </div>
                        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                            {selectedObject ? (
                                <div className="w-full text-left">
                                    <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-4 border border-zinc-200">
                                        {selectedObject.type === 'output' ? <FileText className="w-6 h-6 text-blue-500" /> : <Database className="w-6 h-6 text-zinc-400" />}
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-900">{selectedObject.data.label}</h2>
                                    <Badge variant="outline" className="mt-2 text-xs font-normal text-zinc-500 border-zinc-200 bg-zinc-50">
                                        ID: {selectedObject.id}
                                    </Badge>

                                    <div className="mt-6 space-y-4">
                                        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Properties</span>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="text-zinc-500">Owner</div>
                                                <div className="text-zinc-900 font-medium text-right">System</div>
                                                <div className="text-zinc-500">Created</div>
                                                <div className="text-zinc-900 font-medium text-right">24 Oct 2024</div>
                                            </div>
                                        </div>

                                        <Button className="w-full border-zinc-200 hover:bg-zinc-50 text-zinc-700 bg-white shadow-sm">
                                            <Share2 className="w-3 h-3 mr-2" /> View Lineage
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="opacity-40">
                                    <Hexagon className="w-12 h-12 mb-2 text-zinc-300 mx-auto" strokeWidth={1} />
                                    <p className="text-sm text-zinc-500">Select an node to view properties</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

            </div>
        </ModuleLayout>
    );
}
