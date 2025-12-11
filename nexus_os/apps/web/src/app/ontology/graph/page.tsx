import React from 'react';
import OntologyGraph from '@/components/visualizations/OntologyGraph';

export default function OntologyPage() {
    return (
        <div className="h-full w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ontology Knowledge Graph</h1>
                    <p className="text-slate-500">Visualize object relationships, dependencies, and cascading risks.</p>
                </div>
            </div>

            <div className="h-[600px] w-full bg-white rounded-lg border shadow-sm">
                <OntologyGraph />
            </div>
        </div>
    );
}
