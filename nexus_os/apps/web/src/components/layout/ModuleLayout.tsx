"use client";

import React from 'react';
import { Card } from '@nexus/ui';

interface ModuleLayoutProps {
    title: string;
    description: string;
    icon: string;
    color: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

export default function ModuleLayout({ title, description, icon, color, children, action }: ModuleLayoutProps) {
    return (
        <div className="w-full h-full bg-zinc-50/10">
            <main className="mx-auto max-w-[1600px] p-8 pb-20">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-md ${color}`}>
                                {icon}
                            </div>
                            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                                {title}
                            </h1>
                        </div>
                        <p className="text-zinc-500 ml-1 font-medium">
                            {description}
                        </p>
                    </div>
                    {action && (
                        <div>
                            {action}
                        </div>
                    )}
                </header>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
