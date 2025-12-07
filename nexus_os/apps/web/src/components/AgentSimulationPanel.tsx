'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';

export function AgentSimulationPanel() {
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<any>(null);

    const runSimulation = async () => {
        setIsRunning(true);
        try {
            // Trigger AIP Logic for Crisis
            const response = await api.chatWithAgent("Critical Alert: Station Alpha Failure", [], "System");
            setResult(response);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Enterprise Immune System</h3>
            <div className="mb-6 bg-zinc-50 dark:bg-black p-4 rounded-lg border border-red-200 dark:border-red-900">
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">🚨 Live Scenario Detected</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    <strong>Station Alpha</strong> has ceased telemetry. Output dropped to 0 MW.
                    Possible cyber-kinetic interference detected on ICS protocol port 502.
                </p>
            </div>

            <button
                onClick={runSimulation}
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
                {isRunning ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Running Containment Protocols...
                    </>
                ) : (
                    'Run Automated Response'
                )}
            </button>

            {result && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <h4 className="font-bold text-green-700 dark:text-green-400 mb-2">✅ AI Mitigation Plan Generated</h4>
                        <div className="prose dark:prose-invert text-sm">
                            <pre className="whitespace-pre-wrap font-sans">{result.response || result.text}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
