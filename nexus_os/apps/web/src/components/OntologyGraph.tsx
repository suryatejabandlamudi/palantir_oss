'use client';

import React, { useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const nodeTypes = {
    // Custom node types can be defined here
};

export default function OntologyGraph({ objectTypes }: any) {
    // Transform object types into nodes and edges
    const initialNodes = objectTypes.map((type: any, index: number) => ({
        id: type.id,
        type: 'default',
        data: { label: type.display_name },
        position: { x: 250 * (index % 3), y: 100 * Math.floor(index / 3) },
        style: {
            background: '#1C2127',
            color: '#fff',
            border: '1px solid #374151',
            width: 180,
            borderRadius: 4
        },
    }));

    // Infer edges from properties (e.g., vessel_id -> Vessel)
    // This is a heuristic for the demo since we don't have explicit link types yet
    const initialEdges: any[] = [];
    objectTypes.forEach((source: any) => {
        source.property_definitions.forEach((prop: any) => {
            if (prop.name.endsWith('_id')) {
                const targetName = prop.name.replace('_id', '');
                const target = objectTypes.find((t: any) => t.api_name === targetName);
                if (target) {
                    initialEdges.push({
                        id: `${source.id}-${target.id}`,
                        source: source.id,
                        target: target.id,
                        animated: true,
                        label: 'links to',
                        style: { stroke: '#3b82f6' },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
                    });
                }
            }
        });
    });

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls style={{ fill: '#fff' }} />
                <Background color="#374151" gap={16} />
            </ReactFlow>
        </div>
    );
}
