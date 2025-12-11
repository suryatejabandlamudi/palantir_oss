import { create } from 'zustand';
import { Protocol, INITIAL_PROTOCOLS } from './protocols';

// Re-export specific types if needed by legacy components, or update components to import from library
export type { Protocol, ProtocolAction, ProtocolCondition, ProtocolSteps, ProtocolTrigger } from './protocols';

// --- Domain Types ---

export interface Signal {
    id: string;
    type: 'IOT' | 'MARKET' | 'LOGISTIC' | 'SECURITY';
    intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    source: string;
    timestamp: string;
    message: string;
}

export interface FactoryState {
    id: string;
    name: string;
    efficiency: number; // 0-100
    activeWorkers: number;
    energyUsage: number; // kW
    status: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
}

export interface FSDBuild {
    version: string;
    compileStatus: 'IDLE' | 'COMPILING' | 'TESTING' | 'DEPLOYED' | 'FAILED';
    progress: number;
    regressions: number;
    lastRun?: string;
}

// --- Ontology / Digital Twin Types ---
export interface GraphNode {
    id: string;
    label: string;
    type: 'VEHICLE' | 'PART' | 'FACTORY' | 'SUPPLIER' | 'MATERIAL';
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    data: {
        description: string;
        inventory?: number;
        leadTime?: string;
    };
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    label: string; // e.g., "CONSUMES", "PRODUCED_AT"
}

export interface OntologyState {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

const INITIAL_ONTOLOGY: OntologyState = {
    nodes: [
        { id: 'VEH-MY', label: 'Model Y', type: 'VEHICLE', status: 'OPTIMAL', data: { description: 'Mid-size SUV', inventory: 4500 } },
        { id: 'FAC-TX', label: 'Giga Texas', type: 'FACTORY', status: 'WARNING', data: { description: 'Manufacturing Hub', inventory: 0 } },
        { id: 'PART-PACK', label: 'Structural Pack', type: 'PART', status: 'OPTIMAL', data: { description: 'Integrated Battery Structure', inventory: 120 } },
        { id: 'PART-4680', label: '4680 Cell', type: 'PART', status: 'WARNING', data: { description: 'High-Energy Li-Ion Cell', inventory: 15000 } },
        { id: 'MAT-LITH', label: 'Lithium Hydroxide', type: 'MATERIAL', status: 'OPTIMAL', data: { description: 'Battery Grade Trend: Stable', inventory: 50000 } },
        { id: 'SUP-ALB', label: 'Albemarle Corp', type: 'SUPPLIER', status: 'OPTIMAL', data: { description: 'Lithium Mining Partner' } },
        { id: 'PART-CAST', label: 'Mega Casting (Rear)', type: 'PART', status: 'OPTIMAL', data: { description: 'Single-piece Al Casting', inventory: 45 } },
    ],
    edges: [
        { id: 'e1', source: 'FAC-TX', target: 'VEH-MY', label: 'PRODUCES' },
        { id: 'e2', source: 'PART-PACK', target: 'VEH-MY', label: 'INSTALLED_IN' },
        { id: 'e3', source: 'PART-4680', target: 'PART-PACK', label: 'COMPOSED_OF' },
        { id: 'e4', source: 'MAT-LITH', target: 'PART-4680', label: 'RAW_MATERIAL' },
        { id: 'e5', source: 'SUP-ALB', target: 'MAT-LITH', label: 'SUPPLIES' },
        { id: 'e6', source: 'PART-CAST', target: 'VEH-MY', label: 'CHASSIS_COMPONENT' },
        { id: 'e7', source: 'FAC-TX', target: 'PART-CAST', label: 'CASTS' },
    ]
};

// --- Mock Data ---
// (Signals, Factories, FSD Builds, etc. - keeping as is, but removing Protocols block which is now imported)

const INITIAL_SIGNALS: Signal[] = [
    { id: 'SIG-001', type: 'IOT', intensity: 'HIGH', source: 'Giga Texas - Casting', timestamp: '2 mins ago', message: 'Pressure variance detected in Giga Press #4.' },
    { id: 'SIG-002', type: 'MARKET', intensity: 'MEDIUM', source: 'Demand AI', timestamp: '15 mins ago', message: 'Model Y order velocity in EU up 12% WoW.' },
    { id: 'SIG-003', type: 'LOGISTIC', intensity: 'CRITICAL', source: 'Global Supply', timestamp: '1 hr ago', message: 'Lithium shipment delayed at Port of LA.' },
    { id: 'SIG-004', type: 'SECURITY', intensity: 'HIGH', source: 'SOC', timestamp: 'Now', message: 'Impossible Travel detected: User J.Doe logged in from SF and Tokyo within 1hr.' },
];

const INITIAL_FACTORIES: FactoryState[] = [
    { id: 'F1', name: 'Giga Texas', efficiency: 94, activeWorkers: 12500, energyUsage: 4500, status: 'ONLINE' },
    { id: 'F2', name: 'Giga Berlin', efficiency: 88, activeWorkers: 8000, energyUsage: 3200, status: 'MAINTENANCE' },
    { id: 'F3', name: 'Giga Shanghai', efficiency: 98, activeWorkers: 15000, energyUsage: 5100, status: 'ONLINE' },
];

const INITIAL_FSD_BUILDS: FSDBuild[] = [
    { version: 'v12.3.1', compileStatus: 'DEPLOYED', progress: 100, regressions: 0, lastRun: '2h ago' },
    { version: 'v12.4.0-beta', compileStatus: 'TESTING', progress: 85, regressions: 2, lastRun: 'running...' },
];

// --- Store ---

interface TeslaState {
    // State
    fsdBuilds: any[];
    isLive: boolean;
    ontology: OntologyState; // NEW
    protocols: Protocol[];   // UPDATED to new Schema
    signals: Signal[];
    factories: FactoryState[];

    // Combined domain states (placeholders for now)
    orders: any[];
    taktMetrics: any[];
    cogs: { current: number; target: number; trend: 'UP' | 'DOWN' | 'STABLE' };
    tickets: any[];
    assets: any[];
    gridPrice: number;

    // Actions
    toggleLive: () => void;
    addSignal: (signal: any) => void;
    updateFactory: (id: string, updates: Partial<any>) => void;
    generateSimulationTick: () => void;

    // Ontology Actions
    setNodeStatus: (id: string, status: 'OPTIMAL' | 'WARNING' | 'CRITICAL') => void;

    // Protocol Actions
    addProtocol: (protocol: Protocol) => void;
    updateProtocol: (id: string, updates: Partial<Protocol>) => void;
    deleteProtocol: (id: string) => void;
    updateProtocolStatus: (id: string, status: Protocol['status']) => void; // Simplified for now
    evaluateProtocols: () => void;
    fetchProtocols: () => Promise<void>;
}

export const useTeslaStore = create<TeslaState>((set, get) => ({
    // Initial state (placeholders for missing INITIAL_SIGNALS, etc.)
    signals: [], // Placeholder
    factories: [], // Placeholder
    fsdBuilds: [], // Placeholder
    isLive: false,
    ontology: INITIAL_ONTOLOGY,
    protocols: [], // Fetched via API

    // Combined domain states (placeholders)
    orders: [],
    taktMetrics: [],
    cogs: { current: 0, target: 0, trend: 'STABLE' },
    tickets: [],
    assets: [],
    gridPrice: 0,

    // Actions
    toggleLive: () => set((state) => ({ isLive: !state.isLive })),
    addSignal: (signal) => set((state) => ({ signals: [...state.signals, signal] })),
    updateFactory: (id, updates) => set((state) => ({
        factories: state.factories.map((f: any) => (f.id === id ? { ...f, ...updates } : f)),
    })),
    generateSimulationTick: () => {
        // Placeholder for simulation logic
        console.log("Generating simulation tick...");
    },

    // Ontology Actions
    setNodeStatus: (id, status) => set((state) => ({
        ontology: {
            ...state.ontology,
            nodes: state.ontology.nodes.map((node) =>
                node.id === id ? { ...node, status } : node
            ),
        },
    })),

    // Protocol Actions
    addProtocol: (protocol) => set((state) => ({
        protocols: [protocol, ...state.protocols]
    })),
    updateProtocol: (id, updates) => set((state) => ({
        protocols: state.protocols.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
    deleteProtocol: (id) => set((state) => ({
        protocols: state.protocols.filter((p) => p.id !== id),
    })),
    updateProtocolStatus: (id, status) => set((state) => ({
        protocols: state.protocols.map((p) => (p.id === id ? { ...p, status } : p)),
    })),
    fetchProtocols: async () => {
        try {
            const res = await fetch('/api/protocols');
            const data = await res.json();
            set({ protocols: data });
        } catch (e) {
            console.error('Failed to fetch protocols:', e);
        }
    },
}));
