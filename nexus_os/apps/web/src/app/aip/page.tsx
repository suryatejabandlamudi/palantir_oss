
'use client';

import React from 'react';
import AIPBuilder from '@/components/AIPBuilder';
import { Brain } from 'lucide-react';

export default function AIPPage() {
    return (
        <div className="h-screen bg-slate-950 text-white flex flex-col">
            <div className="h-16 border-b border-slate-800 flex items-center px-4 gap-2 bg-slate-900/50">
                <Brain className="text-purple-400" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AIP Logic Studio
                </h1>
            </div>
            <div className="flex-1 overflow-hidden">
                <AIPBuilder />
            </div>
        </div>
    );
}
