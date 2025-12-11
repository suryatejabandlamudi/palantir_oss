"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Box,
    Layers,
    Cpu,
    Globe,
    Rocket,
    LayoutGrid,
    Users,
    ShoppingCart,
    Activity,
    Search,
    Bell,
    Settings,
    ChevronRight,
    Menu,
    Terminal,
    Database,
    BrainCircuit,
    ShieldAlert,
    Map,
    Server
} from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming a utility exists or I'll implement it inline

// --- TYPES ---
type NavItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    color: string; // Tailwind text color class for accent
};

type PlatformSection = {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
    items: NavItem[];
    color: string; // Tailwind border/bg color
};

// --- DATA: THE MENTAL MODEL ---
const PLATFORMS: PlatformSection[] = [
    {
        id: "foundry",
        label: "Foundry",
        description: "Operating System for Data",
        icon: <Database className="w-5 h-5" />,
        color: "border-blue-500",
        items: [
            { id: "ontology", label: "Ontology Manager", icon: <Layers className="w-4 h-4" />, href: "/ontology", color: "text-blue-400" },
            { id: "erp", label: "ERP Connector (SAP)", icon: <Box className="w-4 h-4" />, href: "/erp", color: "text-orange-400" },
            { id: "crm", label: "CRM Connector (SF)", icon: <Users className="w-4 h-4" />, href: "/crm", color: "text-sky-400" },
            { id: "hcm", label: "HCM Connector (WD)", icon: <Activity className="w-4 h-4" />, href: "/hcm", color: "text-indigo-400" },
        ]
    },
    {
        id: "aip",
        label: "AIP",
        description: "Artificial Intelligence Platform",
        icon: <BrainCircuit className="w-5 h-5" />,
        color: "border-purple-500",
        items: [
            { id: "agent_builder", label: "Agent Builder", icon: <Cpu className="w-4 h-4" />, href: "/builder", color: "text-purple-400" },
            { id: "terminals", label: "Agent Terminals", icon: <Terminal className="w-4 h-4" />, href: "/aip/terminals", color: "text-purple-300" },
        ]
    },
    {
        id: "gotham",
        label: "Gotham",
        description: "Global Operating Picture",
        icon: <Globe className="w-5 h-5" />,
        color: "border-slate-500",
        items: [
            { id: "map", label: "Live Operations", icon: <Map className="w-4 h-4" />, href: "/gotham", color: "text-slate-300" },
            { id: "itsm", label: "Incident Command", icon: <ShieldAlert className="w-4 h-4" />, href: "/itsm", color: "text-red-400" },
        ]
    },
    {
        id: "apollo",
        label: "Apollo",
        description: "Continuous Delivery",
        icon: <Rocket className="w-5 h-5" />,
        color: "border-emerald-500",
        items: [
            { id: "deploy", label: "Deployments", icon: <Server className="w-4 h-4" />, href: "/apollo", color: "text-emerald-400" },
        ]
    }
];

// --- COMPONENT ---
export default function NavigationShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [activePlatformId, setActivePlatformId] = useState<string>("foundry");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Auto-detect platform based on route
    useEffect(() => {
        if (pathname.includes("/erp") || pathname.includes("/crm") || pathname.includes("/hcm") || pathname.includes("/ontology") || pathname.includes("/protocols")) setActivePlatformId("foundry");
        else if (pathname.includes("/builder") || pathname.includes("/aip")) setActivePlatformId("aip");
        else if (pathname.includes("/gotham") || pathname.includes("/itsm")) setActivePlatformId("gotham");
        else if (pathname.includes("/apollo")) setActivePlatformId("apollo");
    }, [pathname]);

    const activePlatform = PLATFORMS.find(p => p.id === activePlatformId) || PLATFORMS[0];

    return (
        <div className="flex h-screen w-full bg-white text-zinc-800 font-sans overflow-hidden selection:bg-blue-100">

            {/* 1. PRIMARY RAIL (Leftmost) - The Product Switcher */}
            <div className="w-16 flex-shrink-0 flex flex-col items-center py-4 bg-zinc-50 border-r border-zinc-200 z-50 shadow-sm">
                {/* Logo */}
                <Link href="/" className="mb-6 w-10 h-10 flex items-center justify-center bg-white border border-zinc-200 rounded-lg text-zinc-900 font-bold tracking-tighter hover:bg-zinc-100 transition-colors shadow-sm">
                    NX
                </Link>

                {/* Platform Icons */}
                <div className="flex flex-col gap-3 w-full px-2">
                    {PLATFORMS.map((p) => {
                        const isActive = activePlatformId === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setActivePlatformId(p.id)}
                                className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
                  ${isActive
                                        ? `bg-white text-zinc-900 shadow-md ring-1 ring-zinc-200`
                                        : "text-zinc-400 hover:bg-white hover:text-zinc-600 hover:shadow-sm"
                                    }`}
                                title={p.label}
                            >
                                {p.icon}

                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full ${p.color.replace('border', 'bg')}`} />
                                )}

                                {/* Tooltip */}
                                <div className="absolute left-14 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 translate-x-2 group-hover:translate-x-0 transition-all shadow-lg">
                                    {p.label}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1" />

                {/* Global Settings / Command Center */}
                <Link
                    href="/command-center"
                    className={`mb-4 w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${pathname === '/command-center' ? 'bg-blue-50 text-blue-600' : 'text-zinc-400 hover:text-zinc-600 hover:bg-white'}`}
                    title="Command Center"
                >
                    <Activity className="w-5 h-5" />
                </Link>
                <button className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* 2. SECONDARY SIDEBAR (Contextual) - Collapsible */}
            <div className={`flex-shrink-0 bg-white border-r border-zinc-200 transition-all duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"}`}>

                {/* Header */}
                <div className="h-16 flex items-center px-6 border-b border-zinc-200 bg-zinc-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg bg-white border border-zinc-200 shadow-sm ${activePlatform.color.replace('border', 'text')}`}>
                            {activePlatform.icon}
                        </div>
                        <span className="font-semibold text-zinc-900 tracking-wide">{activePlatform.label}</span>
                    </div>
                </div>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <div className="text-xs font-mono text-zinc-400 px-3 mb-2 uppercase tracking-wider font-semibold">
                        Applications
                    </div>
                    {activePlatform.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                  ${isActive
                                        ? "bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-sm"
                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                    }`}
                            >
                                <div className={`${item.color.replace('text-', 'text-opacity-80 text-')} group-hover:opacity-100`}>
                                    {item.icon}
                                </div>
                                <span>{item.label}</span>
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-zinc-400" />}
                            </Link>
                        );
                    })}

                    {activePlatformId === 'foundry' && (
                        <Link href="/protocols" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${pathname === '/protocols' ? "bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-sm" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}>
                            <div className="text-amber-500">
                                <Activity className="w-4 h-4" />
                            </div>
                            <span>Protocols</span>
                            {pathname === '/protocols' && <ChevronRight className="w-4 h-4 ml-auto text-zinc-400" />}
                        </Link>
                    )}
                </div>

                {/* Sidebar Footer (Optional) */}
                <div className="p-4 border-t border-zinc-200 bg-zinc-50/30">
                    <div className="p-3 bg-white rounded-lg border border-zinc-200 shadow-sm">
                        <p className="text-xs text-zinc-500 font-medium">Nexus OS v2.4.0</p>
                        <p className="text-[10px] text-zinc-400">Stable Release</p>
                    </div>
                </div>
            </div>

            {/* 3. MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-white relative">

                {/* Top Bar Navigation */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white/80 backdrop-blur-md z-40 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Breadcrumbs (Mock) */}
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <span>Nexus</span>
                            <ChevronRight className="w-3 h-3 text-zinc-300" />
                            <span className="text-zinc-800 font-medium">{activePlatform.label}</span>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block group">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Search objects, actions..."
                                className="bg-zinc-50 border border-zinc-200 rounded-full py-1.5 pl-9 pr-4 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all shadow-inner"
                            />
                        </div>

                        <button className="relative p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        </button>

                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white shadow-md cursor-pointer hover:shadow-lg transition-shadow" />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-zinc-50/50">
                    {children}
                </main>

            </div>
        </div>
    );
}
