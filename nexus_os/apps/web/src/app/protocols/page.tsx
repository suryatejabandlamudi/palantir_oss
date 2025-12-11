"use client";

import { useTeslaStore } from "@/lib/teslaState";
import { ResolutionProtocolCard } from "@/components/ResolutionProtocolCard";
import { Search, Filter, Shield, DollarSign, Truck, Smartphone, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { ProtocolBuilder } from "@/components/ProtocolBuilder";

export default function ProtocolsPage() {
    const { protocols, fetchProtocols } = useTeslaStore();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);

    useEffect(() => {
        fetchProtocols();
    }, []);

    const filteredProtocols = protocols.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "ALL" || p.category === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Resolution Protocols (SOPs)</h1>
                        <p className="text-zinc-500 mt-2 text-lg">
                            Define explicit rules for Agents to follow. Human-defined, machine-executed.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsBuilderOpen(true)}
                        className="bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus size={18} /> New Protocol
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 bg-zinc-50/80 backdrop-blur-md p-4 rounded-xl border border-zinc-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search protocols..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setFilter("ALL")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === 'ALL' ? 'bg-zinc-800 text-white shadow-md' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("ITSM")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${filter === 'ITSM' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'}`}
                    >
                        <Smartphone className="w-3 h-3" /> IT
                    </button>
                    <button
                        onClick={() => setFilter("SecOps")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${filter === 'SecOps' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
                    >
                        <Shield className="w-3 h-3" /> SecOps
                    </button>
                    <button
                        onClick={() => setFilter("Revenue")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${filter === 'Revenue' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'}`}
                    >
                        <DollarSign className="w-3 h-3" /> Revenue
                    </button>
                    <button
                        onClick={() => setFilter("SupplyChain")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${filter === 'SupplyChain' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'}`}
                    >
                        <Truck className="w-3 h-3" /> Supply Chain
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProtocols.map(p => (
                    <ResolutionProtocolCard key={p.id} protocol={p} />
                ))}
            </div>

            {filteredProtocols.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-zinc-400">No protocols found matching your criteria.</p>
                </div>
            )}
            {isBuilderOpen && (
                <ProtocolBuilder onClose={() => setIsBuilderOpen(false)} />
            )}
        </div>
    );
}
