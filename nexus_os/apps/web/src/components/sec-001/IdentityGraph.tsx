'use client';

import React, { useMemo } from 'react';
import ReactFlow, {
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    ConnectionMode,
    Handle,
    Position,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { User, Globe, Laptop, Key } from 'lucide-react';

const CustomNode = ({ data, icon: Icon, color, label, subLabel }: any) => (
    <div className={`px-4 py-3 rounded-lg border bg-white min-w-[200px] shadow-sm hover:shadow-md transition-shadow ${color}`}>
        <Handle type="target" position={Position.Top} className="!bg-zinc-300 !w-2 !h-2" />
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md bg-zinc-50 text-zinc-600 border border-zinc-100`}>
                <Icon size={16} />
            </div>
            <div>
                <div className="text-sm font-semibold text-zinc-900">{label}</div>
                <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">{subLabel}</div>
            </div>
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-zinc-300 !w-2 !h-2" />
    </div>
);

const UserNode = ({ data }: any) => (
    <CustomNode data={data} icon={User} color="border-blue-200" label={data.label} subLabel="Identity" />
);

const IPNode = ({ data }: any) => (
    <CustomNode data={data} icon={Globe} color="border-zinc-200" label={data.label} subLabel="Network Endpoint" />
);

const DeviceNode = ({ data }: any) => (
    <CustomNode data={data} icon={Laptop} color="border-emerald-200" label={data.label} subLabel="Managed Asset" />
);

const CredentialNode = ({ data }: any) => (
    <CustomNode data={data} icon={Key} color="border-amber-200" label={data.label} subLabel="Session" />
);


interface IdentityGraphProps {
    initialNodes: Node[];
    initialEdges: Edge[];
}

export default function IdentityGraph({ initialNodes, initialEdges }: IdentityGraphProps) {
    const nodeTypes = useMemo(() => ({
        user: UserNode,
        ip: IPNode,
        device: DeviceNode,
        credential: CredentialNode
    }), []);

    const styledEdges = useMemo(() => initialEdges.map(edge => ({
        ...edge,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#e4e4e7', strokeWidth: 2 }, // zinc-200
        labelStyle: { fill: '#71717a', fontSize: 11, fontWeight: 500 }, // zinc-500
        markerEnd: { type: MarkerType.ArrowClosed, color: '#e4e4e7' },
    })), [initialEdges]);

    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(styledEdges);

    return (
        <div className="h-full w-full bg-zinc-50/50 rounded-xl border border-zinc-200 overflow-hidden relative">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[url('/grid-light.svg')] opacity-[0.03] pointer-events-none" />

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
                connectionMode={ConnectionMode.Loose}
                nodesDraggable={false}
                minZoom={0.5}
                maxZoom={2}
            >
                <Background color="#000" gap={20} size={1} style={{ opacity: 0.05 }} />
            </ReactFlow>
        </div>
    );
}
