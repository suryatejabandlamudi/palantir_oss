
// Simulated Vector DB and RAG Engine
// This mimics the behavior of a real ChromaDB or Pinecone instance without the external dependency overhead for this demo.

export interface VectorDocument {
    id: string;
    content: string;
    metadata: Record<string, any>;
    embedding: number[]; // Simulated 3-dimensional embedding for demonstration
}

// "Real" Internal Documents for Tesla (Simulated Multi-Tenant)
const KNOWLEDGE_BASE: VectorDocument[] = [
    // --- TESLA (Manufacturing) ---
    {
        id: 'doc_1',
        content: "The 4680 cell production yield in Giga Texas has improved to 94% following the cathode dry-process optimization.",
        metadata: { source: "Internal Wiki", author: "Drew Baglino", date: "2024-12-01", org_id: "TESLA_MFG" },
        embedding: [0.9, 0.1, 0.05]
    },
    {
        id: 'doc_2',
        content: "FSD v13 architecture moves away from C++ heuristics entirely to end-to-end neural networks for vehicle control.",
        metadata: { source: "Engineering Spec", author: "Ashok Elluswamy", date: "2024-11-15", org_id: "TESLA_AI" },
        embedding: [0.1, 0.9, 0.05]
    },
    // --- PALANTIR (Deployments) ---
    {
        id: 'doc_p1',
        content: "Apollo upgrade window for NHS deployment set for 0300 UTC. Rollback strategy confirmed via Blue/Green.",
        metadata: { source: "Deployment Log", author: "Forward Deployed Eng", date: "2024-12-10", org_id: "PLTR_GOV" },
        embedding: [0.2, 0.8, 0.3]
    },
    // --- SPACEX (Logistics) ---
    {
        id: 'doc_s1',
        content: "Starship Flight 6 booster catch mechanism hydraulics pressure test passed. Ready for static fire.",
        metadata: { source: "Launch Readiness", author: "Bill Gerstenmaier", date: "2024-12-09", org_id: "SPX_OPS" },
        embedding: [0.8, 0.1, 0.4]
    }
];

// Simulated Embedding Function (just a random vector generator for demo)
function getEmbedding(text: string): number[] {
    // In a real app, this would call OpenAI or Gemini embedding API
    if (text.toLowerCase().includes('battery') || text.toLowerCase().includes('production')) return [0.9, 0.1, 0.1];
    if (text.toLowerCase().includes('fsd') || text.toLowerCase().includes('ai')) return [0.1, 0.9, 0.1];
    return [0.5, 0.5, 0.5];
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magA * magB);
}

export const RagEngine = {
    search: (query: string, orgId?: string, topK: number = 3) => {
        const queryVec = getEmbedding(query);

        // Filter by Org if provided
        const candidates = orgId
            ? KNOWLEDGE_BASE.filter(doc => doc.metadata.org_id === orgId || doc.metadata.org_id === 'GLOBAL')
            : KNOWLEDGE_BASE;

        // Sort logic
        const results = candidates.map(doc => ({
            ...doc,
            score: cosineSimilarity(queryVec, doc.embedding)
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        return results;
    },

    // MCP Tool Simulation is now handled by lib/actionExecutor.ts
    // This function remains for legacy compatibility if needed
    runTool: (toolName: string, args: any) => {
        console.log(`[RAG-MCP] Legacy tool call: ${toolName}`, args);
        return { success: true };
    }
};
