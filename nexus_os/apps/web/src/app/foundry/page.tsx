'use client';

import { useState, useEffect } from 'react';

interface ObjectType {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
}

export default function FoundryPage() {
    const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newType, setNewType] = useState({ name: '', description: '', icon: 'cube', color: '#3B82F6' });

    useEffect(() => {
        fetch('http://localhost:8000/ontology/types')
            .then(res => res.json())
            .then(data => setObjectTypes(data))
            .catch(err => console.error('Failed to fetch object types', err));
    }, []);

    const handleCreate = async () => {
        try {
            const res = await fetch('http://localhost:8000/ontology/types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newType,
                    property_types: [] // Initialize with empty properties
                }),
            });
            if (res.ok) {
                const created = await res.json();
                setObjectTypes([...objectTypes, created]);
                setShowModal(false);
                setNewType({ name: '', description: '', icon: 'cube', color: '#3B82F6' });
            }
        } catch (err) {
            console.error('Failed to create object type', err);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#bfccd6' }}>Ontology Manager</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New Object Type
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {objectTypes.map(type => (
                    <div key={type.id} className="card" style={{ borderTop: `4px solid ${type.color}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ marginRight: '10px', fontSize: '20px' }}>📦</div> {/* Placeholder for Icon */}
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{type.name}</h3>
                        </div>
                        <p style={{ color: '#8a9ba8', fontSize: '14px' }}>{type.description || 'No description'}</p>
                    </div>
                ))}
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '400px' }}>
                        <h2 style={{ marginTop: 0 }}>Create Object Type</h2>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Name</label>
                            <input
                                className="input"
                                value={newType.name}
                                onChange={e => setNewType({ ...newType, name: e.target.value })}
                                placeholder="e.g. Aircraft"
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Description</label>
                            <textarea
                                className="input"
                                value={newType.description}
                                onChange={e => setNewType({ ...newType, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate}>Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
