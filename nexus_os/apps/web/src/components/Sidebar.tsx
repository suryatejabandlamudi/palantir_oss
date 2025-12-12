"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Hexagon,
    Zap,
    Box,
    Activity,
    Search,
    Settings,
    Map,
    Server,
    Shield,
    DollarSign,
    Truck,
    Users,
    MessageSquare
} from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Gotham', icon: Map, path: '/gotham' },
    { label: 'Ontology', icon: Hexagon, path: '/ontology' },
    { label: 'Builder', icon: Zap, path: '/builder' },
    { label: 'The Mesh', icon: Server, path: '/aip/terminals' },
    { label: 'Warp', icon: Truck, path: '/warp' },
    // { label: 'Garage', icon: Search, path: '/garage' }, // Hidden for cleanliness
];

const DOMAIN_ITEMS = [
    { label: 'SecOps', icon: Shield, path: '/ciso/sec-001', color: 'text-red-600' },
    { label: 'Supply', icon: Box, path: '/supply-chain', color: 'text-blue-600' },
    { label: 'Finance', icon: DollarSign, path: '/finance', color: 'text-green-600' },
    { label: 'People', icon: Users, path: '/hcm', color: 'text-orange-600' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="h-full w-16 bg-white border-r border-zinc-200 flex flex-col items-center py-4 z-50 shadow-sm transition-all hover:w-56 hover:shadow-xl group absolute hover:relative">
            {/* Logo */}
            <div className="mb-8 w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-bold tracking-tight text-xl shrink-0 group-hover:w-full group-hover:bg-transparent group-hover:text-zinc-900 group-hover:justify-start group-hover:px-4">
                <span className="block group-hover:hidden">N</span>
                <span className="hidden group-hover:block ml-2">NEXUS OS</span>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 flex flex-col gap-2 w-full px-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`
                                relative flex items-center h-10 px-2.5 rounded-lg transition-all
                                ${isActive
                                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                                }
                            `}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-zinc-900' : ''}`} />
                            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm">
                                {item.label}
                            </span>

                            {isActive && (
                                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-zinc-900 rounded-r-full" />
                            )}
                        </Link>
                    )
                })}

                <div className="my-4 h-px bg-zinc-100 w-full" />

                {/* Domains */}
                {DOMAIN_ITEMS.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className="flex items-center h-10 px-2.5 rounded-lg text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all"
                    >
                        <item.icon className={`w-5 h-5 shrink-0 ${item.color}`} />
                        <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm">
                            {item.label}
                        </span>
                    </Link>
                ))}

            </nav>

            {/* Footer */}
            <div className="mt-auto flex flex-col items-center gap-4 w-full px-2">
                <button className="p-2rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border-2 border-white shadow-sm" />
            </div>
        </div>
    );
}

function NavItem({ icon: Icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`
                p-3 rounded-xl transition-all relative group
                ${active ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}
            `}
        >
            <Icon className="w-5 h-5" />
            <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {label}
            </div>
        </button>
    )
}
