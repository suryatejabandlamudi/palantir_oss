import React from 'react';
import ControlTower from '@/components/visualizations/ControlTower';

export default function SupplyChainPage() {
    return (
        <div className="h-full w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Supply Chain Command</h1>
                    <p className="text-slate-500">Global logistics visibility and risk monitoring.</p>
                </div>
            </div>

            <div className="h-[700px] w-full">
                <ControlTower />
            </div>
        </div>
    );
}
