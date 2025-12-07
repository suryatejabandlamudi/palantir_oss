'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PropertyDefinition {
    name: string;
    type: string;
    title?: string;
}

interface ObjectType {
    id: string;
    api_name: string;
    display_name: string;
    icon: string;
    color: string;
    property_definitions: PropertyDefinition[];
}

interface ObjectInstance {
    id: string;
    title: string;
    object_type_id: string;
    properties: Record<string, any>;
}

export default function ObjectExplorerPage() {
    const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
    const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
    const [objects, setObjects] = useState<ObjectInstance[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newObjectProperties, setNewObjectProperties] = useState<Record<string, string>>({});
    const [newObjectTitle, setNewObjectTitle] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/ontology/types')
            .then(res => res.json())
            .then(data => {
                setObjectTypes(data);
                if (data.length > 0) setSelectedTypeId(data[0].id);
            });
    }, []);

    useEffect(() => {
        if (selectedTypeId) {
            fetch(`http://localhost:8000/objects?object_type_id=${selectedTypeId}`)
                .then(res => res.json())
                .then(data => {
                    setObjects(data);
                });
        }
    }, [selectedTypeId]);

    const handleCreate = async () => {
        if (!selectedTypeId) return;

        const selectedType = objectTypes.find(t => t.id === selectedTypeId);
        if (!selectedType) return;

        try {
            const res = await fetch('http://localhost:8000/objects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    object_type_id: selectedTypeId,
                    title: newObjectTitle,
                    properties: newObjectProperties
                }),
            });

            if (res.ok) {
                const created = await res.json();
                setObjects([...objects, created]);
                setShowCreateModal(false);
                setNewObjectTitle('');
                setNewObjectProperties({});
            }
        } catch (err) {
            console.error('Failed to create object', err);
        }
    };

    const selectedType = objectTypes.find(t => t.id === selectedTypeId);

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar: Object Types */}
            <div style={{ width: '250px', background: '#182026', borderRight: '1px solid #293742', padding: '20px' }}>
                <h3 style={{ color: '#8a9ba8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px' }}>Object Types</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {objectTypes.map(type => (
                        <div
                            key={type.id}
                            onClick={() => setSelectedTypeId(type.id)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                background: selectedTypeId === type.id ? '#2d72d2' : 'transparent',
                                color: selectedTypeId === type.id ? 'white' : '#bfccd6',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                        >
                            <div style={{ width: '10px', height: '10px', background: type.color, borderRadius: '2px' }}></div>
                            {type.display_name}
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '20px', borderTop: '1px solid #293742', paddingTop: '20px' }}>
                    <Link href="/foundry" className="btn" style={{ display: 'block', textAlign: 'center' }}>Manage Ontology</Link>
                </div>
            </div>

            {/* Main Content: Data Grid */}
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>{selectedType?.display_name || 'Select Type'} Explorer</h1>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} disabled={!selectedType}>
                        + New {selectedType?.display_name}
                    </button>
                </div>

                <div style={{ flex: 1, background: '#182026', border: '1px solid #293742', borderRadius: '3px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#202b33' }}>
                            <tr>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #293742', color: '#8a9ba8' }}>Title</th>
                                {selectedType?.property_definitions.map(pt => (
                                    <th key={pt.name} style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #293742', color: '#8a9ba8' }}>{pt.title || pt.name}</th>
                                ))}
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #293742', color: '#8a9ba8' }}>ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {objects.map(obj => (
                                <tr key={obj.id} style={{ borderBottom: '1px solid #293742' }}>
                                    <td style={{ padding: '10px' }}>
                                        <Link href={`/foundry/objects/${obj.id}`} style={{ color: '#2d72d2', fontWeight: 'bold' }}>
                                            {obj.title}
                                        </Link>
                                    </td>
                                    {selectedType?.property_definitions.map(pt => (
                                        <td key={pt.name} style={{ padding: '10px' }}>{obj.properties[pt.name] || '-'}</td>
                                    ))}
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px', color: '#5c7080' }}>{obj.id.substring(0, 8)}...</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {objects.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#8a9ba8' }}>
                            No objects found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && selectedType && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '500px' }}>
                        <h2 style={{ marginTop: 0 }}>New {selectedType.display_name}</h2>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Title (Display Name)</label>
                            <input
                                className="input"
                                value={newObjectTitle}
                                onChange={e => setNewObjectTitle(e.target.value)}
                                placeholder={`e.g. ${selectedType.display_name} 001`}
                            />
                        </div>

                        {selectedType.property_definitions.map(pt => (
                            <div key={pt.name} style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>{pt.title || pt.name} <span style={{ opacity: 0.5 }}>({pt.type})</span></label>
                                <input
                                    className="input"
                                    value={newObjectProperties[pt.name] || ''}
                                    onChange={e => setNewObjectProperties({ ...newObjectProperties, [pt.name]: e.target.value })}
                                />
                            </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button className="btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate}>Create Object</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
