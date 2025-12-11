'use client';

import { useState, useRef, useMemo } from 'react';
import { Lock, Smartphone, Ban, ArrowRight, ShieldCheck, Zap, Mail, MessageSquare } from 'lucide-react';
import { useTeslaStore, ProtocolAction } from '@/lib/teslaState';

interface SlideButtonProps {
    label: string;
    icon: any;
    colorClass: string; // e.g., 'bg-red-600'
    onComplete: () => void;
    disabled?: boolean;
}

// iOS-style Slide to Unlock button
function SlideButton({ label, icon: Icon, colorClass, onComplete, disabled }: SlideButtonProps) {
    const [sliderValue, setSliderValue] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [holding, setHolding] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startHold = () => {
        if (disabled || completed) return;
        setHolding(true);
        intervalRef.current = setInterval(() => {
            setSliderValue((prev) => {
                if (prev >= 100) {
                    clearInterval(intervalRef.current!);
                    setCompleted(true);
                    onComplete();
                    return 100;
                }
                return prev + 5;
            });
        }, 30);
    };

    const stopHold = () => {
        if (completed) return;
        setHolding(false);
        setSliderValue(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    return (
        <div
            className={`relative w-full h-12 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 select-none group ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
        >
            <div
                className={`absolute inset-0 ${colorClass} transition-all duration-0 ease-linear opacity-10`}
                style={{ width: `${sliderValue}%` }}
            />
            <div className="absolute left-1 top-1 bottom-1 w-10 bg-white rounded shadow-sm border border-zinc-200 flex items-center justify-center transition-all duration-75"
                style={{ left: `calc(${sliderValue}% - ${sliderValue > 0 ? 40 : 0}px)` }}>
                <Icon size={16} className={`text-zinc-600 ${holding ? 'opacity-100' : 'opacity-75'}`} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className={`text-xs font-semibold uppercase tracking-wide ${holding ? 'text-zinc-800' : 'text-zinc-500'}`}>
                    {holding ? "Confirming..." : label}
                </span>
            </div>
        </div>
    );
}

// Helper to map protocol actions to UI visuals
const getActionVisuals = (action: ProtocolAction) => {
    // Map backend action strings to user-friendly labels and colors
    if (action.action.includes('lock') || action.action.includes('suspend') || action.action.includes('revok')) {
        return { label: 'Revoke Access', icon: Ban, color: 'bg-red-600' };
    }
    if (action.action.includes('reset') || action.action.includes('password')) {
        return { label: 'Reset Password', icon: Lock, color: 'bg-orange-500' };
    }
    if (action.action.includes('alert') || action.action.includes('notify')) {
        return { label: 'Dispatch Alert', icon: MessageSquare, color: 'bg-blue-500' };
    }
    if (action.action.includes('email') || action.action.includes('draft')) {
        return { label: 'Send Email', icon: Mail, color: 'bg-indigo-500' };
    }
    return { label: action.action.replace(/_/g, ' '), icon: Zap, color: 'bg-zinc-600' };
};

export function ActionCenter() {
    const [status, setStatus] = useState<'idle' | 'securing' | 'secured'>('idle');
    const { protocols } = useTeslaStore();

    // Dynamically derive actions from the SEC-001 Protocol
    const secProtocol = useMemo(() => protocols.find(p => p.id === 'SEC-001'), [protocols]);
    const actions = secProtocol?.steps.actions || [];

    const handleExecute = (actionId: string) => {
        // In real app, we'd fire the specific action ID
        if (actions.length > 0 && actionId === actions[0].id) {
            setStatus('securing');
            setTimeout(() => setStatus('secured'), 1500);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 h-full shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-50 p-2 rounded-full border border-red-100">
                    <ShieldCheck className="h-5 w-5 text-red-600" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-zinc-900">Response Protocols</h3>
                    <p className="text-xs text-zinc-500">
                        {secProtocol ? `Derived from ${secProtocol.id}` : 'Manual Override'}
                    </p>
                </div>
            </div>

            {status === 'secured' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                        <ShieldCheck size={32} />
                    </div>
                    <h4 className="text-lg font-semibold text-zinc-900">Protocol Executed</h4>
                    <p className="text-sm text-zinc-500 mt-2 max-w-[200px]">
                        Actions from <strong>{secProtocol?.title}</strong> have been triggered.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {actions.length === 0 ? (
                        <p className="text-sm text-zinc-400 italic text-center">No actions defined in protocol.</p>
                    ) : (
                        actions.map(action => {
                            const visual = getActionVisuals(action);
                            return (
                                <SlideButton
                                    key={action.id}
                                    label={visual.label}
                                    icon={visual.icon}
                                    colorClass={visual.color}
                                    onComplete={() => handleExecute(action.id)}
                                />
                            );
                        })
                    )}
                    {/* Fallback/Manual Action if needed, or if protocol is empty */}
                    {(!secProtocol || actions.length === 0) && (
                        <SlideButton
                            label="Manual Lockdown"
                            icon={Ban}
                            colorClass="bg-zinc-800"
                            onComplete={() => handleExecute('manual')}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
