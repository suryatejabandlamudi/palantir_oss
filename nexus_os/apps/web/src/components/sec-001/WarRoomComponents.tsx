'use client';

import { useState } from 'react';
import { Lock, CheckCircle, AlertTriangle, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Kill Switch Component ---
export function KillSwitch() {
    const [status, setStatus] = useState<'ACTIVE' | 'CONTAINED'>('ACTIVE');
    const [isSliding, setIsSliding] = useState(false);

    const handleSlideEnd = () => {
        setStatus('CONTAINED');
    };

    if (status === 'CONTAINED') {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center space-y-4 rounded-xl bg-green-950/20 border border-green-500/30 p-6">
                <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="h-12 w-12" />
                    <span className="text-3xl font-bold tracking-widest">CONTAINED</span>
                </div>
                <p className="text-green-600/80 font-mono text-sm">User & Device Access Revoked via Okta API</p>
                <p className="text-zinc-500 text-xs">Session ID: #9941-KILLED</p>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-between rounded-xl bg-red-950/10 border border-red-500/30 p-6 relative overflow-hidden">
            {/* Background Pulse/Glow */}
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />

            <div className="z-10 text-center space-y-2">
                <h3 className="text-xl font-bold text-red-100 flex items-center justify-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    ACTIVE THREAT
                </h3>
                <p className="text-red-400/80 text-sm">Immediate Action Required</p>
            </div>

            <div className="z-10 w-full max-w-xs mt-8">
                {/* Simulated Slider */}
                <button
                    onClick={handleSlideEnd}
                    className="group relative w-full h-14 bg-zinc-900 rounded-full border border-red-500/50 flex items-center justify-start px-1 overflow-hidden transition-all hover:bg-zinc-800"
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-red-500/50 font-mono font-bold tracking-widest text-sm group-hover:text-red-400 transition-colors uppercase">
                            Initiate Kill Switch
                        </span>
                    </div>

                    <div className="h-11 w-11 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] z-10 transition-transform group-hover:scale-110 active:scale-95 group-active:translate-x-60 duration-500 ease-out">
                        <Lock className="h-5 w-5 text-white" />
                    </div>
                </button>
            </div>

            <p className="text-xs text-zinc-600 mt-4 font-mono z-10">
                Authorizes automatic session termination across all active IdP sessions.
            </p>
        </div>
    );
}

// --- Live Forensics Component ---
export function LiveForensics({ logs }: { logs: any[] }) {
    return (
        <div className="h-full w-full flex flex-col font-mono text-xs">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <Terminal className="h-4 w-4 text-emerald-500" />
                <span className="text-zinc-400">LIVE_INGEST :: OKTA_SYSTEM_LOG</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-zinc-950">
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2 border-l-2 border-zinc-800 pl-2 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-zinc-600 shrink-0">{log.ts.split('T')[1].split('.')[0]}</span>
                        <span className={`font-bold ${log.risk === 'CRITICAL' ? 'text-red-500' :
                                log.risk === 'HIGH' ? 'text-orange-500' : 'text-blue-400'
                            }`}>[{log.risk}]</span>
                        <span className="text-zinc-300">{log.msg}</span>
                    </div>
                ))}
                <div className="animate-pulse text-emerald-500/50">_ awaiting new stream data...</div>
            </div>
        </div>
    );
}
