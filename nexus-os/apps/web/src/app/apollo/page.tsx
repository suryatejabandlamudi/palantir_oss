'use client';

import React, { useState, useEffect, useRef } from 'react';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Rocket, GitBranch, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@nexus/ui';

export default function ApolloPage() {
    const [deployStatus, setDeployStatus] = useState<any>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Poll for status
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('http://localhost:8000/apollo/status');
                const data = await res.json();
                setDeployStatus(data);

                if (data.status === 'DEPLOYING') {
                    setIsDeploying(true);
                } else {
                    setIsDeploying(false);
                }
            } catch (e) {
                console.error("Failed to fetch status", e);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [deployStatus?.logs]);

    const handleDeploy = async () => {
        setIsDeploying(true);
        try {
            await fetch('http://localhost:8000/apollo/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    env: "Staging",
                    version: "v2.4.0-rc1"
                })
            });
        } catch (e) {
            console.error("Failed to trigger deployment", e);
            setIsDeploying(false);
        }
    };

    return (
        <WorkspaceLayout
            sidebar={
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800">
                        <h2 className="text-sm font-bold text-gray-400 mb-3">ENVIRONMENTS</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        <EnvItem name="Production" status="healthy" version="v2.1.3" active />
                        <EnvItem
                            name="Staging"
                            status={isDeploying ? "deploying" : "healthy"}
                            version={isDeploying ? "v2.4.0-rc1 (Deploying...)" : "v2.4.0-rc1"}
                        />
                        <EnvItem name="Development" status="healthy" version="v2.3.0-beta" />
                    </div>
                </div>
            }
            bottomPanel={
                <div className="h-full flex flex-col">
                    <div className="h-8 bg-[#1C2127] border-b border-gray-800 flex items-center px-4 justify-between">
                        <span className="text-xs font-bold text-gray-400">DEPLOYMENT LOG</span>
                        {isDeploying && <span className="text-xs text-blue-400 animate-pulse">● LIVE</span>}
                    </div>
                    <div className="flex-1 p-4 font-mono text-xs text-gray-300 overflow-auto bg-black whitespace-pre-wrap">
                        {deployStatus?.logs || "Waiting for logs..."}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            }
        >
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="h-12 border-b border-gray-800 flex items-center px-6 justify-between bg-[#111418]">
                    <h1 className="font-bold text-white flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-purple-500" />
                        Continuous Delivery
                    </h1>
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleDeploy}
                            disabled={isDeploying}
                        >
                            {isDeploying ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Rocket className="w-3 h-3 mr-1" />}
                            {isDeploying ? "Deploying..." : "Deploy to Staging"}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Recent Deployments</h3>
                        <div className="space-y-3">
                            {deployStatus && deployStatus.status !== 'PENDING' && (
                                <DeploymentCard
                                    version={deployStatus.version}
                                    env={deployStatus.environment}
                                    status={deployStatus.status === 'HEALTHY' ? 'success' : deployStatus.status === 'FAILED' ? 'failed' : 'deploying'}
                                    time="Just now"
                                    author="You"
                                />
                            )}
                            <DeploymentCard
                                version="v2.2.0"
                                env="Staging"
                                status="success"
                                time="2 minutes ago"
                                author="System"
                            />
                            <DeploymentCard
                                version="v2.1.3"
                                env="Production"
                                status="success"
                                time="3 hours ago"
                                author="Admin"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">System Health</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <HealthCard label="API Uptime" value="99.9%" status="healthy" />
                            <HealthCard label="Active Users" value="1,247" status="healthy" />
                            <HealthCard label="Error Rate" value="0.02%" status="healthy" />
                        </div>
                    </div>
                </div>
            </div>
        </WorkspaceLayout>
    );
}

function EnvItem({ name, status, version, active }: { name: string, status: string, version: string, active?: boolean }) {
    const statusColor = status === 'healthy' ? 'text-green-500' : status === 'deploying' ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className={`px-3 py-3 rounded text-sm mb-1 cursor-pointer transition-colors ${active ? 'bg-purple-900/20 text-purple-400 border border-purple-800' : 'text-gray-400 hover:bg-gray-800'
            }`}>
            <div className="flex items-center justify-between mb-1">
                <span className="font-bold">{name}</span>
                <span className={`text-xs ${statusColor}`}>●</span>
            </div>
            <div className="text-xs text-gray-600">{version}</div>
        </div>
    );
}

function DeploymentCard({ version, env, status, time, author }: any) {
    const Icon = status === 'success' ? CheckCircle2 : status === 'deploying' ? Loader2 : XCircle;
    const color = status === 'success' ? 'text-green-500' : status === 'deploying' ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="bg-[#111418] border border-gray-800 rounded-lg p-4 hover:border-purple-800 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${color} ${status === 'deploying' ? 'animate-spin' : ''}`} />
                    <div>
                        <div className="text-sm font-bold text-white">{version}</div>
                        <div className="text-xs text-gray-500">{env}</div>
                    </div>
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {time}
                </div>
            </div>
            <div className="text-xs text-gray-500">Deployed by {author}</div>
        </div>
    );
}

function HealthCard({ label, value, status }: any) {
    return (
        <div className="bg-[#111418] border border-gray-800 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{label}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
        </div>
    );
}
