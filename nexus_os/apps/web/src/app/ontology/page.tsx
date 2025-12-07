
'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import OntologyGraph from '@/components/OntologyGraph';
import ObjectGrid from '@/components/ObjectGrid';
import { Network, Database, Plus } from 'lucide-react';

export default function OntologyPage() {
    const [objectTypes, setObjectTypes] = useState<any[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [objects, setObjects] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'graph' | 'data'>('graph');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTypes();
    }, []);

    useEffect(() => {
        if (selectedType) {
            loadObjects(selectedType);
            setViewMode('data');
        }
    }, [selectedType]);

    const loadTypes = async () => {
        setLoading(true);
        const types = await api.getObjectTypes();
        setObjectTypes(types);
        setLoading(false);
    };

    const loadObjects = async (typeId: string) => {
        setLoading(true);
        const objs = await api.getObjects(typeId);
        setObjects(objs);
        setLoading(false);
    };

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-800 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-6">
                    <Database className="text-blue-400" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Ontology
                    </h1>
                </div>

                <button
                    onClick={() => { setSelectedType(null); setViewMode('graph'); }}
                    className={`p-2 rounded text-left flex items-center gap-2 ${!selectedType ? 'bg-slate-800 text-blue-400' : 'hover:bg-slate-900 text-slate-400'}`}
                >
                    <Network size={16} /> Overview Graph
                </button>

                <div className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Object Types</div>
                <div className="flex flex-col gap-1 mt-2">
                    {objectTypes.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedType(t.id)}
                            className={`p-2 rounded text-sm text-left flex items-center gap-2 ${selectedType === t.id ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50' : 'hover:bg-slate-900 text-slate-300'}`}
                        >
                            <span style={{ color: t.color || '#fff' }}>●</span> {t.display_name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative">
                {/* Toolbar */}
                <div className="h-14 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <h2 className="font-semibold text-lg">
                            {selectedType
                                ? objectTypes.find(t => t.id === selectedType)?.display_name
                                : 'Ontology Overview'}
                        </h2>
                        {loading && <div className="text-xs text-blue-400 animate-pulse">Loading...</div>}
                    </div>
                </div>

                {/* View Area */}
                <div className="flex-1 overflow-hidden relative bg-slate-900">
                    {viewMode === 'graph' ? (
                        <div className="h-full w-full">
                            <OntologyGraph objectTypes={objectTypes} />
                        </div>
                    ) : (
                        <div className="h-full w-full p-4">
                            <ObjectGrid data={objects} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
