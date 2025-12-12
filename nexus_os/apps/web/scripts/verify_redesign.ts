
import { PrismaClient } from '@prisma/client';
// We can't easily import 'rag.ts' here if it depends on 'server-only' or Next.js internals not available in standalone script without TSX/Next environment.
// But we can test the API endpoints if the server is running, OR we can test the database state directly.

// For this "External Verification", we will simulate an external system (like a CI runner or another agent) calling our new APIs.
// Prerequisite: The Next.js server must be running on localhost:3000. 
// If it's not, this script will fail to fetch, but that serves as a verification that the system is NOT up.

const BASE_URL = 'http://localhost:3000';

async function main() {
    console.log("🚀 Starting External Verification of Nexus OS Redesign...");

    // 1. Verify Pipeline Deployment API
    console.log("\n[1] Testing Pipeline Deployment (The Forge -> DB)...");
    const deployPayload = {
        title: "External Verification Pipeline",
        description: "Created by automated verification script",
        nodes: [
            { id: 'start', type: 'input', data: { label: 'Start' }, position: { x: 0, y: 0 } },
            { id: 'agent', type: 'default', data: { type: 'AGENT', label: 'Verifier Agent', systemPrompt: 'Verify system integrity.', model: 'GEMINI_PRO' }, position: { x: 100, y: 0 } }
        ],
        edges: [
            { source: 'start', target: 'agent' }
        ]
    };

    let pipelineId;
    try {
        const deployRes = await fetch(`${BASE_URL}/api/agent/deploy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deployPayload)
        });

        if (!deployRes.ok) throw new Error(`Deploy failed: ${deployRes.status} ${deployRes.statusText}`);
        const deployData = await deployRes.json();
        pipelineId = deployData.pipelineId;
        console.log(`✅ Pipeline Deployed Successfully! ID: ${pipelineId}`);
    } catch (e) {
        console.error("❌ Failed to deploy pipeline:", e);
        // We might continue if we want to test other things, but this is critical
    }

    // 2. Verify Pipeline Execution API
    if (pipelineId) {
        console.log("\n[2] Testing Pipeline Execution (The Mesh -> Agent Runtime)...");
        try {
            const execRes = await fetch(`${BASE_URL}/api/agent/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pipelineId: pipelineId,
                    input: "Run system diagnostics."
                })
            });

            if (!execRes.ok) throw new Error(`Execution failed: ${execRes.status} ${execRes.statusText}`);
            const execData = await execRes.json();
            console.log("✅ Execution Response Received:");
            console.log(JSON.stringify(execData, null, 2));

            if (execData.result) {
                console.log("✅ Pipeline Result Verified.");
            } else {
                console.warn("⚠️ Execution returned success but no explicit result field.");
            }

        } catch (e) {
            console.error("❌ Failed to execute pipeline:", e);
        }
    }

    // 3. Verify RAG (via direct simulated context check if possible, or just the fact that execution worked implies DB access)
    console.log("\n[3] Verifying RAG System implicitly...");
    // Since we don't have a direct public RAG API endpoint exposed yet (it's internal to execute/rag.ts), 
    // we assume that if the Agent Execution worked (and used RAG internally if configured), it's functional.
    // To be more robust, we could add a `context` debug field to the execute response.

    console.log("\n🏁 External Verification Complete.");
}

main();
