import React, { useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Node,
    Edge,
    addEdge,
    Connection,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentPipeline } from '@/lib/protocols';

interface PipelineCanvasProps {
    // We will control state from parent for simpler prototype, or use internal state
    // For now, let's keep it self-contained for the demo visual
}

const INITIAL_NODES: Node[] = [
    {
        id: 'trigger',
        type: 'input',
        data: { label: '⚡ Trigger: Webhook' },
        position: { x: 250, y: 50 },
        style: { background: '#fff', border: '1px solid #777', width: 180 }
    },
    {
        id: 'agent-1',
        data: { label: '🤖 Agent: Revenue Analyst' },
        position: { x: 250, y: 150 },
        style: { background: '#f5f3ff', border: '1px solid #7c3aed', width: 180, fontWeight: 'bold' }
    },
    {
        id: 'tool-1',
        data: { label: '🛠️ Tool: Salesforce Lookup' },
        position: { x: 100, y: 300 },
        style: { background: '#eff6ff', border: '1px solid #2563eb', width: 180 }
    },
    {
        id: 'tool-2',
        data: { label: '🛠️ Tool: Slack Notify' },
        position: { x: 400, y: 300 },
        style: { background: '#eff6ff', border: '1px solid #2563eb', width: 180 }
    },
];

const INITIAL_EDGES: Edge[] = [
    { id: 'e1-2', source: 'trigger', target: 'agent-1', animated: true },
    { id: 'e2-3', source: 'agent-1', target: 'tool-1', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2-4', source: 'agent-1', target: 'tool-2', markerEnd: { type: MarkerType.ArrowClosed } },
];

export function PipelineCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => addEdge(params, eds));
    }, [setEdges]);

    return (
        <div className="w-full h-full bg-zinc-50/50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#ccc" gap={20} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
