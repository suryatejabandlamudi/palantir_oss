
// Pure Node.js script (CommonJS) to verify the API endpoints.
// No compilation needed.

const BASE_URL = 'http://localhost:3000';

async function main() {
    console.log("🚀 Starting External Verification of Nexus OS Redesign (JS Mode)...");

    // 1. Verify Pipeline Deployment API
    console.log("\n[1] Testing Pipeline Deployment (The Forge -> DB)...");
    const deployPayload = {
        title: "External Verification Pipeline (JS)",
        description: "Created by automated verification script (JS)",
        nodes: [
            { id: 'start', type: 'input', data: { label: 'Start' }, position: { x: 0, y: 0 } },
            { id: 'agent', type: 'default', data: { type: 'AGENT', label: 'Verifier Agent JS', systemPrompt: 'Verify system integrity.', model: 'GEMINI_PRO' }, position: { x: 100, y: 0 } }
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
            // console.log(JSON.stringify(execData, null, 2));

            if (execData.result) {
                console.log("✅ Pipeline Result Verified.");
            } else {
                console.warn("⚠️ Execution returned success but no explicit result field.");
            }

        } catch (e) {
            console.error("❌ Failed to execute pipeline:", e);
        }
    }

    console.log("\n🏁 External Verification Complete.");
}

main();
