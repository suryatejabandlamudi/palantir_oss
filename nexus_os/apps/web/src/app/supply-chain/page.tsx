'use client';

import React, { useEffect, useState } from 'react';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Map, Truck, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { api } from '@/lib/api';
import GothamMap from '@/components/GothamMap'; // Reusing Map Component

export default function SupplyChainPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            // Fetch All Objects (Ideally filter by Type 'sales_order' if we knew the ID)
            // But we can fetch all and filter client side or fetch types first.
            const types = await api.getObjectTypes();
            const orderType = types.find((t: any) => t.api_name === 'sales_order' || t.display_name === 'Sales Order');

            if (orderType) {
                const data = await api.getObjects(orderType.id);
                setOrders(data);
            }
        } catch (e) {
            console.error("Failed to load supply chain data", e);
        } finally {
            setLoading(false);
        }
    }

    // Prepare Map Data (Format objects to look like what GothamMap expects)
    const mapObjects = orders.filter(o => o.properties?.latitude && o.properties?.longitude).map(o => ({
        id: o.id,
        name: o.properties?.customer || o.title,
        type: 'Order',
        latitude: o.properties.latitude,
        longitude: o.properties.longitude,
        status: o.properties?.status, // Delayed vs On Time
        properties: o.properties
    }));

    return (
        <WorkspaceLayout>
            <div className="flex h-screen bg-[#101010] text-white">
                {/* Sidebar */}
                <div className="w-96 border-r border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-800">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Map className="w-5 h-5 text-blue-500" />
                            Supply Tower
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">Global Logistics & Risk Monitoring</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Orders</div>

                        {loading && <div className="text-gray-500 animate-pulse">Loading global data...</div>}

                        {orders.map(order => {
                            const props = order.properties || {};
                            return (
                                <div key={order.id} className="bg-gray-900 border border-gray-800 p-3 rounded hover:border-gray-600 cursor-pointer transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-blue-400">{props.customer || order.title}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${props.status === 'Delayed' ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'
                                            }`}>
                                            {props.status || 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-300 flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        ${props.amount?.toLocaleString()} ({props.priority})
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        Delivery: {props.delivery_date}
                                    </div>
                                    {props.status === 'Delayed' && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-red-500 bg-red-950/30 p-1.5 rounded">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span>Risk: Production Halt Possible</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Map View */}
                <div className="flex-1 relative z-0">
                    <GothamMap objects={mapObjects} />

                    {/* Overlay Stats */}
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur border border-gray-700 p-4 rounded-lg z-10 w-64">
                        <h3 className="text-sm font-bold text-gray-200 mb-2">Network Health</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Total Orders</span>
                                <span className="text-white font-mono">{orders.length}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Delayed Value</span>
                                <span className="text-red-400 font-mono">
                                    ${orders.filter(o => o.properties?.status === 'Delayed').reduce((acc, curr) => acc + (curr.properties?.amount || 0), 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WorkspaceLayout>
    );
}
