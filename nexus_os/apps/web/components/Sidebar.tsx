'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Map, Database, Cpu, Rocket, Settings, Hexagon } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { name: 'Gotham', href: '/gotham', icon: Map, color: 'text-red-400' },
    { name: 'Foundry', href: '/foundry', icon: Database, color: 'text-blue-400' },
    { name: 'AIP', href: '/aip', icon: Cpu, color: 'text-purple-400' },
    { name: 'Apollo', href: '/apollo', icon: Rocket, color: 'text-green-400' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <Hexagon className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold tracking-wider text-white">NEXUS<span className="text-blue-500">OS</span></span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link key={item.name} href={item.href}>
                            <div className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                            )}>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    />
                                )}
                                <item.icon className={clsx("w-5 h-5", isActive ? item.color : "group-hover:text-white")} />
                                <span className="font-medium">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <Link href="/settings">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
