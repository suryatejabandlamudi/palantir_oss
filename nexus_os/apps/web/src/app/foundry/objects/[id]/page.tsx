'use client';

import React, { useEffect, useState } from 'react';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Database, Filter, Search, Table as TableIcon } from 'lucide-react';
import { Button, Input } from '@nexus/ui';
import { fetchObjects, fetchObjectTypes } from '@/lib/api';
import ObjectGrid from '@/components/ObjectGrid';

export default function ObjectExplorerPage({ params }: { params: { id: string } }) {
    const [objects, setObjects] = useState<any[]>([]);
    const [objectType, setObjectType] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const types = await fetchObjectTypes();
                const type = types.find((t: any) => t.id === params.id);
                setObjectType(type);

                if (type) {
                    const data = await fetchObjects(type.id);
                    setObjects(data);
                }
            } catch (e) {
                console.error("Failed to load objects", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [params.id]);

    return (
        <WorkspaceLayout
            sidebar={
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800">
                        <h2 className="text-sm font-bold text-gray-400 mb-3">FILTERS</h2>
                        <Input placeholder="Search objects..." />
                    </div>
                    <div className="p-4">
                        <div className="text-xs text-gray-500 mb-2">PROPERTIES</div>
                        {objectType?.property_definitions?.map((prop: any) => (
                            <div key={prop.name} className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                                <input type="checkbox" className="rounded bg-gray-800 border-gray-700" />
                                <span>{prop.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            }
            bottomPanel={
                <div className="h-full flex flex-col">
                    <div className="h-8 bg-[#1C2127] border-b border-gray-800 flex items-center px-4">
                        <span className="text-xs font-bold text-gray-400">OBJECT PREVIEW</span>
                    </div>
                    <div className="flex-1 p-4 text-sm text-gray-500">
                        Select an object to view details
                    </div>
                </div>
            }
        >
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="h-12 border-b border-gray-800 flex items-center px-6 justify-between bg-[#111418]">
                    <h1 className="font-bold text-white flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-500" />
                        {objectType?.display_name || 'Object Explorer'}
                        <span className="text-gray-500 text-sm font-normal">({objects.length})</span>
                    </h1>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm">
                            <Filter className="w-3 h-3 mr-1" />
                            Filter
                        </Button>
                        <Button variant="primary" size="sm">
                            <TableIcon className="w-3 h-3 mr-1" />
                            Views
                        </Button>
                    </div>
                </div>

                {/* Main Content - AG Grid */}
                <div className="flex-1 bg-[#1a2332] overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-500">Loading objects...</div>
                    ) : (
                        <ObjectGrid data={objects} />
                    )}
                </div>
            </div>
        </WorkspaceLayout>
    );
}
