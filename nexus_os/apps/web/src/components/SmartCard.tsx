import React from 'react';
import { Package, Activity, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SmartCardProps {
    toolName: string;
    result: any;
    args: any;
}

export function SmartCard({ toolName, result, args }: SmartCardProps) {
    if (!result || result.error) return <ErrorCard error={result?.error || "Unknown error"} />;

    switch (toolName) {
        case "check_inventory":
            return <InventoryCard data={result} />;
        case "check_production_status":
            return <ProductionCard data={result} />;
        case "check_worker_status":
            return <WorkerCard data={result} />;
        case "check_opportunity":
            return <OpportunityCard data={result} />;
        case "analyze_impact":
            return <ImpactCard data={result} />;
        case "create_incident_ticket":
            return <TicketCard data={result} />;
        case "create_purchase_order":
            return <PurchaseOrderCard data={result} />;
        default:
            return <DefaultCard toolName={toolName} result={result} />;
    }
}

function ErrorCard({ error }: { error: string }) {
    return (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
        </div>
    );
}

function InventoryCard({ data }: { data: any }) {
    // Handle list or single item
    const items = Array.isArray(data) ? data : [data];

    return (
        <div className="glass-card p-3 space-y-2 !bg-zinc-900/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                <Package className="w-3 h-3" />
                <span>Inventory Status</span>
            </div>
            <div className="space-y-2">
                {items.slice(0, 3).map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 bg-white/5 rounded">
                        <div>
                            <div className="text-zinc-200 font-medium">{item.name || item.material_id}</div>
                            <div className="text-zinc-500 text-[10px]">{item.plant}</div>
                        </div>
                        <div className="text-right">
                            <div className={`font-mono font-bold ${item.stock < 500 ? "text-red-400" : "text-green-400"}`}>
                                {item.stock} {item.unit}
                            </div>
                        </div>
                    </div>
                ))}
                {items.length > 3 && <div className="text-[10px] text-center text-zinc-500">+{items.length - 3} more items</div>}
            </div>
        </div>
    );
}

function ProductionCard({ data }: { data: any }) {
    const isDegraded = data.status !== "Normal";
    return (
        <div className={`glass-card p-3 space-y-3 ${isDegraded ? "border-red-500/30 bg-red-900/10" : "border-green-500/30 bg-green-900/10"}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className={`w-4 h-4 ${isDegraded ? "text-red-400" : "text-green-400"}`} />
                    <span className="font-semibold text-zinc-200">{data.system}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDegraded ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                    {data.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-black/20 rounded">
                    <div className="text-[10px] text-zinc-500 uppercase">Efficiency</div>
                    <div className="text-lg font-bold text-white">{data.oee_efficiency}</div>
                </div>
                <div className="p-2 bg-black/20 rounded">
                    <div className="text-[10px] text-zinc-500 uppercase">Active Lines</div>
                    <div className="text-lg font-bold text-white">{data.active_lines}</div>
                </div>
            </div>

            {data.alerts && data.alerts.length > 0 && (
                <div className="text-xs text-red-300 bg-red-500/10 p-2 rounded border border-red-500/10">
                    <div className="font-semibold mb-1">Active Alerts:</div>
                    <ul className="list-disc list-inside">
                        {data.alerts.map((a: string, i: number) => <li key={i}>{a}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
}

function WorkerCard({ data }: { data: any }) {
    const profile = data.profile || {};
    const status = data.status || {};

    return (
        <div className="glass-card p-3 flex gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400">
                <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
                <div className="font-medium text-white">{profile.name}</div>
                <div className="text-xs text-zinc-400">{profile.title} • {profile.department}</div>
                <div className="flex gap-2 mt-2">
                    <div className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                        Bal: {status.vacation_balance_hours || 0}h
                    </div>
                    <div className={`text-[10px] px-1.5 py-0.5 rounded ${status.burnout_risk === "High" ? "bg-red-500/20 text-red-400" : "bg-zinc-700 text-zinc-400"}`}>
                        Risk: {status.burnout_risk || "Low"}
                    </div>
                </div>
            </div>
        </div>
    );
}

function OpportunityCard({ data }: { data: any }) {
    return (
        <div className="glass-card p-3 border-l-4 border-l-blue-500">
            <div className="text-xs text-blue-400 font-mono mb-1">{data.id}</div>
            <div className="font-bold text-white text-md">{data.name}</div>
            <div className="text-sm text-zinc-300 mb-2">{data.account}</div>
            <div className="flex justify-between items-end border-t border-white/5 pt-2">
                <div>
                    <div className="text-[10px] text-zinc-500">Amount</div>
                    <div className="text-sm font-semibold text-green-400">${data.amount?.toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-[10px] text-zinc-500">Probability</div>
                    <div className="text-sm font-semibold text-white">{data.probability}%</div>
                </div>
            </div>
            {data.impact_analysis && (
                <div className="mt-2 text-xs text-yellow-300/80 italic">
                    "{data.impact_analysis}"
                </div>
            )}
        </div>
    );
}

function TicketCard({ data }: { data: any }) {
    return (
        <div className="glass-card p-3 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
            <div>
                <div className="text-sm font-medium text-white">Incident Created</div>
                <div className="text-xs text-zinc-400 mt-0.5">Ticket #{data.number} has been assigned.</div>
                <div className="mt-2 text-xs bg-zinc-800 p-1.5 rounded text-zinc-300 inline-block">
                    Urgency: {data.urgency}
                </div>
            </div>
        </div>
    );
}

function PurchaseOrderCard({ data }: { data: any }) {
    return (
        <div className="glass-card p-3 flex items-start gap-3 bg-blue-900/10 border-blue-500/20">
            <Clock className="w-5 h-5 text-blue-400 mt-1" />
            <div>
                <div className="text-sm font-medium text-white">Purchase Order Created</div>
                <div className="text-xs text-zinc-400 mt-0.5">PO #{data.po_number} confirmed.</div>
                <div className="text-xs text-zinc-500 mt-1">
                    Delivery Estimated: {data.delivery_date}
                </div>
            </div>
        </div>
    );
}

function ImpactCard({ data }: { data: any }) {
    return (
        <div className="glass-card p-3 border-red-500/30">
            <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-bold text-sm">Disruption Analysis</span>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-zinc-400">Event:</span>
                    <span className="text-white">{data.disruption?.title}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-400">Value at Risk:</span>
                    <span className="text-red-300 font-mono">${data.impact_analysis?.total_value_at_risk?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-400">Critical Shipments:</span>
                    <span className="text-red-300">{data.impact_analysis?.critical_shipments}</span>
                </div>
            </div>
        </div>
    );
}

function DefaultCard({ toolName, result }: any) {
    return (
        <div className="glass-card p-3 text-xs overflow-hidden">
            <div className="font-mono text-zinc-500 mb-1">{toolName}</div>
            <pre className="text-zinc-300 overflow-x-auto">
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    );
}
