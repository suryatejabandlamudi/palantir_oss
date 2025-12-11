"use client";

import React from 'react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Card, Button, Badge } from '@nexus/ui';
import { Package, Truck, AlertTriangle, ArrowRight, Activity, ShoppingCart } from 'lucide-react';
import { useThinking } from '../../components/ui/ThinkingContext';

export default function ERPPage() {
    const { runAgent } = useThinking();
    return (
        <ModuleLayout
            title="Enterprise Resource Planning"
            description="SAP S/4HANA Integration - Inventory, Orders, and Supply Chain"
            icon="🏭"
            color="bg-orange-500 text-white"
            action={
                <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Create Purchase Order
                </Button>
            }
        >
            <div className="grid grid-cols-12 gap-6">
                {/* Critical Alerts */}
                <div className="col-span-12">
                    <div className="flex gap-4">
                        <AlertCard
                            title="Low Stock Warning"
                            message="3 SKUs below safety stock levels. Reorder recommended immediately."
                            type="critical"
                        />
                        <AlertCard
                            title="Shipping Delay"
                            message="Shipment #SH-9921 from Hamburg is delayed by 48 hours."
                            type="warning"
                        />
                    </div>
                </div>

                {/* Main Inventory Board */}
                <div className="col-span-8 space-y-6">
                    {/* Supplier Risk Map (Visual Upgrade) */}
                    <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
                        <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                            <div className="font-semibold text-zinc-800 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-orange-600" /> Supplier Risk Map
                            </div>
                            <Badge variant="destructive" className="animate-pulse shadow-sm">Delay Detected</Badge>
                        </div>
                        <div className="p-6 h-[400px] bg-zinc-100 relative overflow-hidden rounded-b-xl border-t border-zinc-200">
                            {/* Abstract Map Visualization */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#fff_0%,#e4e4e7_100%)]"></div>

                            {/* Route Line */}
                            <div className="absolute top-1/2 left-10 right-10 h-1 bg-zinc-300"></div>
                            <div className="absolute top-1/2 left-10 w-1/2 h-1 bg-red-400 animate-[pulse_2s_infinite]"></div>

                            {/* Hamburg Node */}
                            <div className="absolute top-1/2 left-[10%] -translate-y-1/2 flex flex-col items-center">
                                <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                <div className="mt-2 text-xs font-bold text-zinc-700">Hamburg Port</div>
                                <div className="text-[10px] text-red-700 font-bold bg-red-100 px-1.5 rounded border border-red-200 mt-1">DELAYED +48h</div>
                            </div>

                            {/* Atlantic Node */}
                            <div className="absolute top-1/2 left-[50%] -translate-y-1/2 flex flex-col items-center">
                                <Truck className="w-6 h-6 text-zinc-600 animate-bounce" />
                                <div className="mt-2 text-xs font-bold text-zinc-500">In Transit</div>
                            </div>

                            {/* NY Node */}
                            <div className="absolute top-1/2 right-[10%] -translate-y-1/2 flex flex-col items-center">
                                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                <div className="mt-2 text-xs font-bold text-zinc-700">New York (PL-01)</div>
                                <div className="text-[10px] text-orange-700 font-bold bg-orange-100 px-1.5 rounded border border-orange-200 mt-1">Low Stock</div>
                            </div>
                        </div>
                        <div className="border-t border-zinc-200 p-4 bg-white flex justify-between items-center">
                            <div className="text-sm font-medium text-zinc-700">Affected Material: <span className="font-mono bg-zinc-100 px-2 py-1 rounded border border-zinc-200 text-zinc-600">Titanium Alloy Casing (P-1002)</span></div>
                            <div className="text-xs text-zinc-500">Last Update: GPS Signal 2 mins ago</div>
                        </div>
                    </Card>

                    <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
                        <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                            <div className="font-semibold text-zinc-800 flex items-center gap-2">
                                <Truck className="w-4 h-4" /> Logistics Overview
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-3 gap-8 bg-white">
                            <div className="text-center p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                                <div className="text-3xl font-bold text-zinc-900">98.5%</div>
                                <div className="text-sm text-zinc-500 mt-1 font-medium">On-Time Delivery</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                                <div className="text-3xl font-bold text-zinc-900">14</div>
                                <div className="text-sm text-zinc-500 mt-1 font-medium">Active Shipments</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                                <div className="text-3xl font-bold text-zinc-900">$12.4k</div>
                                <div className="text-sm text-zinc-500 mt-1 font-medium">Freight Cost (Mo)</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar - AI & Orders */}
                <div className="col-span-4 space-y-6">
                    {/* AI Insight Card */}
                    <Card className="p-0 overflow-hidden border-orange-200 shadow-lg ring-1 ring-orange-100">
                        <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white flex justify-between items-center shadow-inner">
                            <div className="font-bold flex items-center gap-2">
                                <span className="text-xl">📈</span> Supply Chain AI
                            </div>
                        </div>
                        <div className="p-5 bg-white">
                            <div className="flex items-start gap-3 mb-5">
                                <Activity className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                                <div className="text-sm text-zinc-700 leading-relaxed">
                                    Detected spike in demand for <strong className="text-zinc-900">Thermal Sensors</strong>. Based on production lead time (3 weeks), you will stock out in <strong className="text-red-600 bg-red-50 px-1 rounded">5 days</strong>.
                                </div>
                            </div>
                            <Button
                                className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-sm transition-all hover:scale-[1.02]"
                                onClick={() => runAgent("I noticed a low stock alert for Titanium Alloy Casing. Check inventory levels for Titanium Alloy Casing (P-1002) and then create a purchase order for 50 units from Vendor VEN-999.")}
                            >
                                Resolve: Create Transfer Order
                            </Button>
                        </div>
                    </Card>

                    {/* Sales Orders */}
                    <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
                        <div className="p-4 border-b border-zinc-100 font-semibold bg-zinc-50/50 text-zinc-800">Recent Sales Orders</div>
                        <div className="p-2 space-y-1 bg-white">
                            <OrderRow id="SO-49221" client="SpaceX" amount="$45,200" status="Processing" />
                            <OrderRow id="SO-49220" client="Blue Origin" amount="$12,500" status="Shipped" />
                            <OrderRow id="SO-49219" client="NASA" amount="$128,000" status="Delivered" />
                        </div>
                    </Card>
                </div>
            </div>
        </ModuleLayout>
    );
}

function AlertCard({ title, message, type }: { title: string, message: string, type: 'critical' | 'warning' }) {
    const isCritical = type === 'critical';
    return (
        <Card className={`flex-1 p-4 border-l-4 shadow-sm ${isCritical ? 'border-l-red-500 bg-red-50 border-t border-r border-b border-red-100' : 'border-l-amber-500 bg-amber-50 border-t border-r border-b border-amber-100'}`}>
            <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-red-600' : 'text-amber-600'}`} />
                <div>
                    <div className="font-bold text-zinc-900">{title}</div>
                    <div className="text-sm text-zinc-600 mt-1">{message}</div>
                </div>
            </div>
        </Card>
    );
}

function OrderRow({ id, client, amount, status }: any) {
    return (
        <div className="flex justify-between items-center p-3 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all cursor-pointer group">
            <div>
                <div className="font-medium text-sm text-zinc-900 group-hover:text-blue-600 transition-colors">{id}</div>
                <div className="text-xs text-zinc-500">{client}</div>
            </div>
            <div className="text-right">
                <div className="font-medium text-sm text-zinc-900">{amount}</div>
                <div className="text-[10px] uppercase tracking-wide text-zinc-400 font-bold">{status}</div>
            </div>
        </div>
    );
}
