'use client';

import React, { useEffect, useState } from 'react';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Box, Plus, Network } from 'lucide-react';
import { Button } from '@nexus/ui';
import { fetchObjectTypes } from '@/lib/api';
import OntologyGraph from '@/components/OntologyGraph';

export default function OntologyPage() {
    const [objectTypes, setObjectTypes] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('graph');

    useEffect(() => {
        async function load() {
            const types = await fetchObjectTypes();
            setObjectTypes(types);
        }
        load();
    }, []);

    return (
        <WorkspaceLayout
            sidebar={
                <div className="p-4">
                    <Button className="w-full mb-4">
                        <Plus className="w-4 h-4 mr-2" />
                        New Object Type
                    </Button>
                    <div className="space-y-1">
                        {objectTypes.map(type => (
                            <div key={type.id} className="p-2 hover:bg-gray-800 rounded cursor-pointer flex items-center gap-2 text-sm text-gray-300">
                                <Box className="w-4 h-4 text-blue-400" />
                                {type.display_name}
                            </div>
                        ))}
                    </div>
                </div>
            }
        >
            <div className="h-full flex flex-col">
                <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#111418]">
                    <h1 className="font-bold text-white flex items-center gap-2">
                        <Network className="w-5 h-5 text-purple-500" />
                        Ontology Manager
                    </h1>
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'graph' ? 'primary' : 'secondary'}
                            onClick={() => setViewMode('graph')}
                            size="sm"
                        >
                            Graph View
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'secondary'}
                            onClick={() => setViewMode('list')}
                            size="sm"
                        >
                            List View
                        </Button>
                    </div>
                </div>

                <div className="flex-1 bg-[#1a2332] relative">
                    {viewMode === 'graph' ? (
                        <OntologyGraph objectTypes={objectTypes} />
                    ) : (
                        <div className="p-8 grid grid-cols-3 gap-4">
                            {objectTypes.map(type => (
                                <div key={type.id} className="bg-[#1C2127] border border-gray-800 p-4 rounded hover:border-blue-500 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Box className="w-5 h-5 text-blue-500" />
                                        <span className="font-bold text-white">{type.display_name}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono mb-4">{type.api_name}</div>
                                    <div className="text-xs text-gray-400">
                                        {type.property_definitions.length} Properties
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </WorkspaceLayout>
    );
}
