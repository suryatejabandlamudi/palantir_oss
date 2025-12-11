"use client";

import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
    Node,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Badge, Card } from '@nexus/ui';
import { Layers, RefreshCw, Zap, AlertTriangle, CheckCircle2, Factory, Box, Cpu } from 'lucide-react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { useTeslaStore, GraphNode } from '../../lib/teslaState';
import { useThinking } from '../../components/ui/ThinkingContext';

// Custom Node Component to look Premium
function CustomNode({ data }: { data: any }) {
    const statusColors = {
        'OPTIMAL': 'border-green-200 bg-green-50 text-green-700',
        'WARNING': 'border-yellow-200 bg-yellow-50 text-yellow-700',
        'CRITICAL': 'border-red-200 bg-red-50 text-red-700 animate-pulse'
    };

    const icons = {
        'VEHICLE': <Zap className="w-4 h-4 text-blue-500" />,
        'FACTORY': <Factory className="w-4 h-4 text-zinc-500" />,
        'PART': <Box className="w-4 h-4 text-orange-500" />,
        'MATERIAL': <Layers className="w-4 h-4 text-indigo-500" />,
        'SUPPLIER': <RefreshCw className="w-4 h-4 text-purple-500" />
    };

    return (
        <div className={`
            min-w-[240px] p-4 rounded-xl border backdrop-blur-md shadow-sm transition-all hover:shadow-md
            ${statusColors[data.status as keyof typeof statusColors] || 'border-zinc-200 bg-white text-zinc-900'}
        `}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {icons[data.type as keyof typeof icons] || <Box className="w-4 h-4" />}
                    <span className="font-bold text-sm tracking-wide">{data.label}</span>
                </div>
                {data.status === 'CRITICAL' && <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />}
                {data.status === 'OPTIMAL' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </div>

            <div className="text-[10px] text-zinc-500 font-mono mb-3 leading-relaxed">
                {data.description}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-zinc-500">
                {data.inventory !== undefined && (
                    <div className="flex flex-col bg-zinc-50 p-1.5 rounded border border-zinc-100">
                        <span>Inv. Level</span>
                        <span className="text-zinc-800 font-mono text-xs">{data.inventory.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex flex-col bg-zinc-50 p-1.5 rounded border border-zinc-100">
                    <span>Type</span>
                    <span className="text-zinc-600">{data.type}</span>
                </div>
            </div>
        </div>
    );
}

const nodeTypes = {
    custom: CustomNode
};

export default function OntologyPage() {
    const { ontology, setNodeStatus } = useTeslaStore();
    const { runAgent, events, state } = useThinking();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Transform State to ReactFlow
    useEffect(() => {
        if (!ontology) return;

        const layoutNodes: Node[] = ontology.nodes.map((n, i) => ({
            id: n.id,
            type: 'custom',
            // Simple Hierarchy Layout: Factories Top, Vehicles Mid, Parts Bot
            // Just a rough manual layout for the demo
            position: {
                x: n.type === 'FACTORY' ? 400 : (n.type === 'VEHICLE' ? 400 : (n.type === 'PART' ? 100 + (i * 150) : 100 + (i * 100))),
                y: n.type === 'FACTORY' ? 50 : (n.type === 'VEHICLE' ? 250 : (n.type === 'PART' ? 450 : 650))
            },
            data: { ...n }
        }));

        const layoutEdges: Edge[] = ontology.edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 1.5 },
            labelStyle: { fill: '#64748b', fontWeight: 700, fontSize: 10 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        }));

        setNodes(layoutNodes);
        setEdges(layoutEdges);
    }, [ontology, setNodes, setEdges]);

    // Agent Action to Simulate Crisis
    const handleSimulateCrisis = () => {
        runAgent("Simulate Supply Chain Failure: 4680 Cell Shortage due to Lithium constraint. Highlight dependencies.");
        // Manually trigger visual state update for demo
        setTimeout(() => {
            setNodeStatus('PART-4680', 'CRITICAL');
            setNodeStatus('FAC-TX', 'WARNING');
            setNodeStatus('VEH-MY', 'WARNING');
        }, 2000); // Wait for "Thinking"
    };

    return (
        <ModuleLayout
            title="Master Architecture"
            description="The Digital Twin - Live Object Graph of the Tesla Ecosystem"
            icon="🕸️"
            color="bg-indigo-600 text-white"
            action={
                <Button
                    onClick={handleSimulateCrisis}
                    className="bg-amber-500 hover:bg-amber-600 text-white shadow-md animate-pulse"
                >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Simulate Supply Shock
                </Button>
            }
        >
            <div className="h-[calc(100vh-140px)] w-full bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden relative shadow-inner">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    minZoom={0.5}
                    maxZoom={1.5}
                >
                    <Controls className="bg-white border-zinc-200 text-zinc-600 shadow-md" />
                    <Background color="#cbd5e1" gap={20} size={1} />
                </ReactFlow>

                {/* Agent Overlay */}
                {state === 'thinking' && events.length > 0 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-indigo-200 p-4 rounded-xl flex items-center gap-4 text-indigo-700 shadow-2xl z-50">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                        <span className="font-mono text-sm max-w-md truncate">
                            {(() => {
                                const last = events[events.length - 1];
                                if (!last) return "Analyzing graph dependencies...";
                                if ('content' in last) return last.content;
                                if (last.type === 'tool_start') return `Executing ${last.tool}...`;
                                if (last.type === 'tool_end') return `Finished ${last.tool}`;
                                return "Processing...";
                            })()}
                        </span>
                    </div>
                )}
            </div>
        </ModuleLayout>
    );
}

