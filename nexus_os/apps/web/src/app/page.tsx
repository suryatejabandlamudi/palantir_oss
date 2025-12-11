"use client";
import { ChatWidget } from "@/components/ChatWidget";
import { AgentTerminal } from "@/components/AgentTerminal";
import { ProtocolCard } from "@/components/ProtocolCard";
import { useState, useEffect, useMemo } from "react";
import { Terminal, LayoutDashboard, Zap, ShieldCheck, TrendingUp, Box } from "lucide-react";
import Link from "next/link";
import { useTeslaStore, ResolutionProtocol } from "@/lib/teslaState";

// Mapper to convert Store Protocol to UI Card Props
const mapDomain = (category: ResolutionProtocol['category']): "IT" | "SEC" | "REV" | "SC" => {
  switch (category) {
    case 'ITSM': return 'IT';
    case 'SecOps': return 'SEC';
    case 'Revenue': return 'REV';
    case 'SupplyChain': return 'SC';
    default: return 'IT';
  }
};

export default function Home() {
  const [mode, setMode] = useState<"overview" | "autonomous">("overview");
  const { protocols, signals } = useTeslaStore();

  // Filter for active protocols or just show all for the "Feed"
  // For the demo, we might want to show protocols that have at least one step (trigger) or are running.
  // Since we initialized steps: [], we might want to just show all of them for now to prove they are loaded.
  const activeProtocols = useMemo(() => {
    return protocols;
  }, [protocols]);

  // Simulation Effect: Stream protocols in one by one (Visual effect only)
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount(prev => (prev < activeProtocols.length ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(interval);
  }, [activeProtocols.length]);

  const visibleProtocols = activeProtocols.slice(0, visibleCount);

  return (
    <div className="min-h-full relative overflow-hidden text-zinc-800 font-sans selection:bg-blue-200">

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-400/10 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-amber-400/10 rounded-full blur-[150px] translate-x-[-50%]" />
      </div>

      {/* Mode Switcher */}
      <div className="fixed top-20 right-6 z-50 flex gap-2 p-1 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-lg shadow-lg">
        <button
          onClick={() => setMode("overview")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === "overview" ? "bg-zinc-100 text-zinc-900 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Command Center
        </button>
        <button
          onClick={() => setMode("autonomous")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === "autonomous" ? "bg-purple-50 text-purple-700 border border-purple-200" : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"}`}
        >
          <Terminal className="w-4 h-4" />
          Autonomous Mode
        </button>
      </div>

      <div className="relative z-10 p-6 max-w-[1600px] mx-auto min-h-screen flex flex-col pt-10">
        {mode === "overview" ? (
          <div className="flex-1 flex flex-col animate-in fade-in duration-700">

            {/* KPI Header */}
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                NEXUS OS v3.0 • PROD • CONNECTED
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900">
                The Architecture of Entropy.
              </h1>
              <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
                Autonomous resolution protocols active across Identity, Security, Revenue, and Supply Chain.
              </p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {[
                { label: "Identity Risks", val: "5 Active", icon: <Zap />, col: "blue" },
                { label: "Security Incidents", val: "3 Prevented", icon: <ShieldCheck />, col: "red" },
                { label: "Revenue Protected", val: "$1.2M", icon: <TrendingUp />, col: "green" },
                { label: "Logistics", val: "98% On-Time", icon: <Box />, col: "amber" },
              ].map((m, i) => (
                <div key={i} className={`p-6 rounded-2xl border bg-white/60 backdrop-blur-sm flex flex-col justify-between h-32 hover:bg-white hover:shadow-md transition-all cursor-default shadow-sm
                  ${m.col === 'blue' ? 'border-blue-200 text-blue-600' :
                    m.col === 'red' ? 'border-red-200 text-red-600' :
                      m.col === 'green' ? 'border-green-200 text-green-600' :
                        'border-amber-200 text-amber-600'
                  }`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{m.label}</span>
                    {m.icon}
                  </div>
                  <div className="text-3xl font-mono font-medium text-zinc-900">{m.val}</div>
                </div>
              ))}
            </div>

            {/* Application Modules Navigation - NEW ADDITION */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 px-4">
              <Link href="/crm" className="group p-6 rounded-xl border border-zinc-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer block">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform border border-blue-100">☁️</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1 group-hover:text-blue-600 transition-colors">CRM (Salesforce)</h3>
                <p className="text-sm text-zinc-500">Pipeline, Deals, Opportunities</p>
              </Link>
              <Link href="/erp" className="group p-6 rounded-xl border border-zinc-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer block">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform border border-orange-100">🏭</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1 group-hover:text-orange-600 transition-colors">ERP (SAP)</h3>
                <p className="text-sm text-zinc-500">Inventory, Orders, Supply Chain</p>
              </Link>
              <Link href="/hcm" className="group p-6 rounded-xl border border-zinc-200 bg-white hover:border-indigo-300 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer block">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform border border-indigo-100">👥</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1 group-hover:text-indigo-600 transition-colors">HCM (Workday)</h3>
                <p className="text-sm text-zinc-500">People, Org Chart, Time Off</p>
              </Link>
              <Link href="/itsm" className="group p-6 rounded-xl border border-zinc-200 bg-white hover:border-red-300 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer block">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform border border-red-100">🛠️</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1 group-hover:text-red-600 transition-colors">ITSM (ServiceNow)</h3>
                <p className="text-sm text-zinc-500">Incidents, Changes, Ops</p>
              </Link>
            </div>

            {/* Protocol Stream */}
            <div className="flex-1 w-full max-w-5xl mx-auto space-y-6 pb-20">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-3">
                  <ActivityIcon />
                  Active Resolution Protocols
                </h2>
                <span className="text-xs font-mono text-zinc-400 font-medium">REAL-TIME FEED via G-CAS</span>
              </div>

              <div className="space-y-4">
                {visibleProtocols.map((p) => (
                  <div key={p.id} className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <ProtocolCard
                      id={p.id}
                      title={p.title}
                      domain={mapDomain(p.category)}
                      status={p.status === 'running' ? 'active' : p.status === 'idle' ? 'waiting' : p.status}
                      steps={p.steps.length > 0 ? p.steps : [{ type: 'trigger', content: p.trigger }]}
                      timestamp="Live"
                    />
                  </div>
                ))}
                {visibleProtocols.length === 0 && (
                  <div className="text-center py-20 text-zinc-400 font-mono text-sm animate-pulse bg-zinc-50 rounded-xl border border-zinc-100">
                    Waiting for system triggers...
                  </div>
                )}
              </div>
            </div>

            <ChatWidget />
          </div>
        ) : (
          <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
            <AgentTerminal />
          </div>
        )}
      </div>
    </div>
  );
}


function ActivityIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
