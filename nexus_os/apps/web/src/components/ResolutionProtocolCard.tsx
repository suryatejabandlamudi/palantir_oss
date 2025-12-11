import { useState } from "react";
import { Protocol } from "../lib/teslaState";
import {
    Play,
    CheckCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    Shield,
    DollarSign,
    Truck,
    Smartphone,
    ArrowRight
} from "lucide-react";

interface Props {
    protocol: Protocol;
    onClick?: () => void;
}

export function ResolutionProtocolCard({ protocol, onClick }: Props) {
    const [expanded, setExpanded] = useState(false);

    // Placeholder for run logic - in real implementation this would invoke the agent
    const handleRun = (e: React.MouseEvent) => {
        e.stopPropagation();
        alert(`Launching Protocol: ${protocol.title}`);
    };

    const getIcon = () => {
        switch (protocol.category) {
            case "ITSM": return <Smartphone className="w-5 h-5 text-blue-400" />;
            case "SecOps": return <Shield className="w-5 h-5 text-red-500" />;
            case "Revenue": return <DollarSign className="w-5 h-5 text-green-400" />;
            case "SupplyChain": return <Truck className="w-5 h-5 text-amber-500" />;
            case "HR": return <Smartphone className="w-5 h-5 text-purple-400" />;
            default: return <Shield className="w-5 h-5 text-zinc-400" />;
        }
    };

    const getStatusColor = () => {
        switch (protocol.status) {
            case "ACTIVE": return "bg-green-500/10 text-green-600 border-green-500/20";
            case "DRAFT": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
            case "PAUSED": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        }
    };

    return (
        <div
            className="group relative overflow-hidden bg-white/50 backdrop-blur-md border border-zinc-200 rounded-xl transition-all hover:bg-white/80 hover:border-zinc-300 hover:shadow-md glass-card cursor-pointer"
            onClick={onClick}
        >
            {/* Header */}
            <div
                className="p-4 flex items-center justify-between"
                onClick={(e) => {
                    // If onClick provided (Edit), don't expand. If no onClick, toggle expand.
                    if (!onClick) {
                        setExpanded(!expanded);
                    }
                }}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-zinc-100 border border-zinc-200`}>
                        {getIcon()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase">{protocol.id}</span>
                            <span className="text-zinc-400">•</span>
                            <span className="text-xs text-zinc-500">{protocol.category}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-900">{protocol.title}</h3>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase border ${getStatusColor()}`}>
                        {protocol.status}
                    </span>

                    <button
                        onClick={handleRun}
                        className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-colors"
                        title="Execute Protocol"
                    >
                        <Play className="w-4 h-4" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                        className="p-1 text-zinc-400 hover:text-zinc-600"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Expanded Content: Visual Flow of the Protocol */}
            {expanded && (
                <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 cursor-default" onClick={e => e.stopPropagation()}>

                    {/* Trigger */}
                    <div className="flex items-start gap-4">
                        <div className="w-8 flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mb-1" />
                            <div className="w-0.5 h-full bg-zinc-200" />
                        </div>
                        <div className="pb-4">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Trigger</span>
                            <div className="text-sm font-medium text-zinc-800 bg-white border border-zinc-200 px-3 py-2 rounded-lg mt-1 shadow-sm">
                                <span className="text-blue-600 font-bold">{protocol.steps.trigger.system}</span>: {protocol.steps.trigger.description}
                                <div className="text-xs text-zinc-400 font-mono mt-0.5">{protocol.steps.trigger.event}</div>
                            </div>
                        </div>
                    </div>

                    {/* Conditions */}
                    {protocol.steps.conditions.map((cond, idx) => (
                        <div key={cond.id} className="flex items-start gap-4">
                            <div className="w-8 flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mb-1" />
                                <div className="w-0.5 h-full bg-zinc-200" />
                            </div>
                            <div className="pb-4">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Check Condition</span>
                                <div className="text-sm font-medium text-zinc-800 bg-white border border-zinc-200 px-3 py-2 rounded-lg mt-1 shadow-sm flex items-center gap-2">
                                    <span className="font-mono text-zinc-600">{cond.field}</span>
                                    <span className="font-bold text-amber-600">{cond.operator}</span>
                                    <span className="font-mono text-zinc-900">{String(cond.value)}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Actions */}
                    {protocol.steps.actions.map((action, idx) => (
                        <div key={action.id} className="flex items-start gap-4">
                            <div className="w-8 flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mb-1" />
                                <div className={idx === protocol.steps.actions.length - 1 ? "w-0.5 h-0" : "w-0.5 h-full bg-zinc-200"} />
                            </div>
                            <div className="pb-4 w-full">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Action</span>
                                <div className="text-sm font-medium text-zinc-800 bg-white border border-zinc-200 px-3 py-2 rounded-lg mt-1 shadow-sm flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase
                                            ${action.type === 'AI_AGENT' ? 'bg-purple-100 text-purple-700' :
                                                action.type === 'AUTOMATION' ? 'bg-zinc-100 text-zinc-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {action.type === 'AI_AGENT' ? 'AI' : action.type === 'AUTOMATION' ? 'AUTO' : 'HUMAN'}
                                        </div>
                                        <span>
                                            <span className="text-zinc-500">{action.system}</span> <ArrowRight size={12} className="inline mx-1" /> {action.action}
                                        </span>
                                    </div>
                                    {action.agentRole && (
                                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                                            👤 {action.agentRole}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}
