'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button, Input } from '@nexus/ui';
import { login } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(username, password);
            router.push('/gotham'); // Redirect to default app
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#111418] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1C2127] border border-gray-800 rounded-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#252A31] p-8 text-center border-b border-gray-800">
                    <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-800">
                        <ShieldCheck className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Nexus OS</h1>
                    <p className="text-gray-400 text-sm mt-2">Secure Access Portal</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[#111418] border border-gray-700 rounded p-2 pl-10 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#111418] border border-gray-700 rounded p-2 pl-10 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center py-2.5 mt-4"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </form>

                {/* Footer */}
                <div className="bg-[#111418] p-4 text-center border-t border-gray-800">
                    <p className="text-xs text-gray-600">
                        Restricted System. Unauthorized access is prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
}
