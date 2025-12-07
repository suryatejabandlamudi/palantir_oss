'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Network, Search } from 'lucide-react';
import { api } from '@/lib/api';

const initialNodes = [];
const initialEdges = [];

export default function OntologyGraphPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [loading, setLoading] = useState(true);

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    useEffect(() => {
        loadGraphData();
    }, []);

    async function loadGraphData() {
        try {
            const types = await api.getObjectTypes();
            // Fetch all objects for all types
            const allObjects = [];
            for (const t of types) {
                try {
                    const objs = await api.getObjects(t.id);
                    allObjects.push(...objs.map((o: any) => ({ ...o, type_name: t.display_name, type_color: t.color || '#555' })));
                } catch (e) { }
            }

            // Build Nodes (Safety Limit 50)
            const LIMITED_OBJECTS = allObjects.slice(0, 50);
            const flowNodes = LIMITED_OBJECTS.map((obj, index) => ({
                id: obj.id,
                data: { label: `${obj.title}\n(${obj.type_name})` },
                position: { x: (index % 5) * 250, y: Math.floor(index / 5) * 150 },
                style: {
                    border: '1px solid #777',
                    padding: 10,
                    borderRadius: 5,
                    background: '#1a1a1a',
                    color: '#fff',
                    borderColor: obj.type_color,
                    width: 200,
                    fontSize: 12
                }
            }));

            // Build Edges
            const flowEdges: any[] = [];
            LIMITED_OBJECTS.forEach(source => {
                const props = source.properties || {};
                // Check if any property value matches another object's ID (or Title)
                Object.entries(props).forEach(([key, value]) => {
                    const target = allObjects.find(t => t.title === value || t.id === value);
                    if (target && target.id !== source.id) {
                        flowEdges.push({
                            id: `e-${source.id}-${target.id}`,
                            source: source.id,
                            target: target.id,
                            animated: true,
                            label: key
                        });
                    }
                });
            });

            setNodes(flowNodes);
            setEdges(flowEdges);

        } catch (e) {
            console.error("Failed to load graph", e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <WorkspaceLayout>
            <div className="flex h-screen flex-col bg-[#101010] text-white">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Network className="w-5 h-5 text-purple-500" />
                        Ontology Knowledge Graph
                    </h1>
                    <div className="text-xs text-gray-400">
                        Visualizing {nodes.length} entities and {edges.length} relationships
                    </div>
                </div>

                <div className="flex-1 w-full h-full">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                        className="bg-gray-900"
                    >
                        <Controls />
                        <MiniMap style={{ background: '#222' }} nodeColor={() => '#555'} />
                        <Background gap={12} size={1} />
                    </ReactFlow>
                </div>
            </div>
        </WorkspaceLayout>
    );
}
