"use client";

import React, { useCallback } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@nexus/ui';

const INITIAL_NODES: Node[] = [
    { id: '1', position: { x: 250, y: 0 }, data: { label: 'Station Alpha' }, type: 'input', style: { background: '#ef4444', color: 'white', border: 'none' } },
    { id: '2', position: { x: 100, y: 150 }, data: { label: 'Grid Controller' } },
    { id: '3', position: { x: 400, y: 150 }, data: { label: 'Cyber Response Unit 1' }, style: { background: '#3b82f6', color: 'white' } },
    { id: '4', position: { x: 400, y: 300 }, data: { label: 'Sarah Connor (Lead)' } },
    { id: '5', position: { x: 50, y: 300 }, data: { label: 'North Sector Hospital' } },
];

const INITIAL_EDGES: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', label: 'Controls', animated: true, style: { stroke: '#ef4444' } },
    { id: 'e1-3', source: '1', target: '3', label: 'Incident Response', animated: true },
    { id: 'e3-4', source: '3', target: '4', label: 'Reports To' },
    { id: 'e2-5', source: '2', target: '5', label: 'Powers', type: 'step' },
];

export default function OntologyGraph() {
    const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
    const [edges, , onEdgesChange] = useEdgesState(INITIAL_EDGES);

    return (
        <Card className="w-full h-full border-slate-200">
            <CardHeader>
                <CardTitle>Ontology Graph: Incident Context</CardTitle>
            </CardHeader>
            <CardContent className="h-[500px] p-0 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Background />
                    <Controls />
                </ReactFlow>

                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur p-2 rounded border text-xs z-10">
                    <div className="font-bold mb-1">Legend</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Critical Asset</div>
                    <div className="flex items-center gap-2 mt-1"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> Team Resource</div>
                    <div className="flex items-center gap-2 mt-1"><span className="w-3 h-3 border border-slate-400 bg-white rounded-sm"></span> Standard Object</div>
                </div>
            </CardContent>
        </Card>
    );
}
