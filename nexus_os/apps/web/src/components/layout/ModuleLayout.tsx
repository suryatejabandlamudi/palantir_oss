import React from 'react';
import { Sidebar } from '../Sidebar';
import { NavigationShell } from '../NavigationShell'; // Assuming this exists or similar

interface ModuleLayoutProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    icon?: React.ReactNode | string;
    color?: string; // Legacy prop, we will override with new theme
    action?: React.ReactNode;
}

export default function ModuleLayout({ children, title, description, icon, action }: ModuleLayoutProps) {
    return (
        <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-purple-100 selection:text-purple-900">
            {/* Sidebar - assuming Sidebar is transparent or compatible */}
            <div className="w-16 flex-none z-50">
                <Sidebar />
            </div>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Top Header / Navigation Shell */}
                <header className="h-16 flex-none border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xl shadow-sm">
                            {icon}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold tracking-tight text-zinc-900 leading-tight">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-xs font-medium text-zinc-500">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Global Search or User Profile could go here */}
                        <div className="h-6 w-px bg-zinc-200 mx-2" />
                        {action}
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto p-6 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto h-full">
                        {children}
                    </div>
                </div>

                {/* Optional Status Bar / Footer if needed */}
                {/* <div className="h-6 bg-white border-t border-zinc-200 text-[10px] text-zinc-400 flex items-center px-4 justify-between">
                    <span>NEXUS OS v2.0</span>
                    <span>Systems Operational</span>
                </div> */}
            </main>
        </div>
    );
}
