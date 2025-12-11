import { useState } from "react";
import {
    CheckCircle,
    AlertTriangle,
    Clock,
    ChevronDown,
    ChevronUp,
    Cpu,
    Activity,
    Shield,
    DollarSign,
    Truck,
    Terminal
} from "lucide-react";

interface ProtocolStep {
    type: "trigger" | "thought" | "action" | "result";
    content: string;
    meta?: string;
}

interface ProtocolCardProps {
    id: string;
    title: string;
    domain: "IT" | "SEC" | "REV" | "SC";
    status: "active" | "completed" | "failed" | "waiting";
    steps: ProtocolStep[];
    timestamp: string;
}

export function ProtocolCard({ id, title, domain, status, steps, timestamp }: ProtocolCardProps) {
    const [expanded, setExpanded] = useState(false);

    const getIcon = () => {
        switch (domain) {
            case "IT": return <Cpu className="w-5 h-5 text-blue-500" />;
            case "SEC": return <Shield className="w-5 h-5 text-red-500" />;
            case "REV": return <DollarSign className="w-5 h-5 text-green-500" />;
            case "SC": return <Truck className="w-5 h-5 text-amber-500" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case "active": return "bg-blue-50 text-blue-600 border-blue-200";
            case "completed": return "bg-green-50 text-green-600 border-green-200";
            case "failed": return "bg-red-50 text-red-600 border-red-200";
            case "waiting": return "bg-zinc-50 text-zinc-400 border-zinc-200";
        }
    };

    return (
        <div className="group relative overflow-hidden bg-white border border-zinc-200 rounded-xl transition-all hover:bg-zinc-50 hover:shadow-md">

            {/* Header */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-zinc-50 border border-zinc-100 ${status === 'active' ? 'animate-pulse' : ''
                        }`}>
                        {getIcon()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase">{id}</span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-xs text-zinc-500">{timestamp}</span>
                        </div>
                        <h3 className="text-sm font-medium text-zinc-900">{title}</h3>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase border ${getStatusColor()}`}>
                        {status}
                    </span>
                    {expanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </div>
            </div>

            {/* Expanded Content: The "Thinking" Stream */}
            {expanded && (
                <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">

                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                        <Terminal className="w-3 h-3" />
                        Agent Reasoning Trace
                    </div>

                    <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-200">
                        {steps.map((step, i) => (
                            <div key={i} className="relative z-10 flex gap-4 pl-0">

                                {/* Timeline Node */}
                                <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border bg-white ${step.type === 'trigger' ? 'border-amber-200 text-amber-600' :
                                    step.type === 'thought' ? 'border-purple-200 text-purple-600' :
                                        step.type === 'action' ? 'border-blue-200 text-blue-600' :
                                            'border-green-200 text-green-600'
                                    }`}>
                                    <Activity className="w-3 h-3" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-zinc-500">{step.type}</span>
                                        {step.meta && <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">{step.meta}</span>}
                                    </div>
                                    <p className={`text-sm mt-0.5 font-mono leading-relaxed ${step.type === 'thought' ? 'text-zinc-600 italic' :
                                        step.type === 'action' ? 'text-blue-700' :
                                            'text-zinc-800'
                                        }`}>
                                        {step.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
