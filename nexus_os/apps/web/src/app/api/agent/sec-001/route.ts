import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { INITIAL_PROTOCOLS } from '../../../../lib/protocols';

export async function GET() {
    // 1. Setup Simulation Data
    const home = {
        city: "San Francisco",
        country: "USA",
        lat: 37.7749,
        lng: -122.4194,
        ip: "98.12.44.102",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        device: "MacBook Pro 16 (Corporate)"
    };

    const attacker = {
        city: "Lagos",
        country: "Nigeria",
        lat: 6.5244,
        lng: 3.3792,
        ip: "197.210.64.2",
        timestamp: new Date().toISOString(),
        device: "Unknown Linux Device"
    };

    const velocity = {
        distance_miles: 7542,
        time_diff_hours: 2,
        speed_mph: 3771
    };

    // 2. Load "The Law" (Protocol)
    const protocol = INITIAL_PROTOCOLS.find(p => p.id === 'SEC-001');

    // 3. Perform REAL AI Analysis
    let agentThoughts = [];

    // UPDATED: User-provided key (potentially OAuth or Vertex AI Key)
    const apiKeyOrToken = process.env.GOOGLE_API_KEY || "REDACTED_API_KEY";

    if (!apiKeyOrToken || apiKeyOrToken.includes("your_key")) {
        agentThoughts = ["ERROR: Google API Key/Token missing."];
    } else {
        try {
            const isApiKey = apiKeyOrToken.startsWith("AIza");

            if (isApiKey) {
                // Standard SDK Path
                const genAI = new GoogleGenerativeAI(apiKeyOrToken);
                const model = genAI.getGenerativeModel({
                    model: "gemini-3-pro-preview",
                    systemInstruction: {
                        parts: [{
                            text: `You are the Nexus OS Security Orchestrator. 
                        Your PRIMARY DIRECTIVE is to STRICTLY FOLLOW Protocol ${protocol?.id}: "${protocol?.title}".
                        
                        PROTOCOL DEFINITION (THE LAW):
                        ${JSON.stringify(protocol?.steps, null, 2)}
                        
                        You must:
                        1. Verify the TRIGGER (System: ${protocol?.steps.trigger.system}, Event: ${protocol?.steps.trigger.event}).
                        2. Evaluate ALL CONDITIONS.
                        3. If conditions met, RECOMMEND the defined ACTIONS (${protocol?.steps.actions.map(a => a.action).join(', ')}).
                        4. Do NOT hallucinate actions not in the protocol.
                        `}]
                    }
                });

                const result = await model.generateContent(createPrompt(home, attacker, velocity, protocol));
                const text = result.response.text();
                agentThoughts = processResponse(text);
                agentThoughts.unshift(`Mode: API KEY | Strategy: Protocol Enforcer | Model: Gemini 3 Pro Preview`);
            } else {
                // Raw Fetch Path (Bearer Token or OAuth)
                // Note: User mentioned 'gemini-3-pro-previous', likely 'gemini-3-pro-preview' or specific vertex endpoint.
                // We sticking to the generativelanguage endpoint for now as it's the standard for this key type usually.
                const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent";
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKeyOrToken}`
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: createPrompt(home, attacker, velocity, protocol) }]
                        }],
                        system_instruction: {
                            parts: [{
                                text: `You are the Nexus OS Security Orchestrator. 
                            Your PRIMARY DIRECTIVE is to STRICTLY FOLLOW Protocol ${protocol?.id}: "${protocol?.title}".
                            
                            PROTOCOL DEFINITION (THE LAW):
                            ${JSON.stringify(protocol?.steps, null, 2)}
                            
                            You must:
                            1. Verify the TRIGGER.
                            2. Evaluate ALL CONDITIONS.
                            3. If conditions met, RECOMMEND the defined ACTIONS.
                            `}]
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis generated.";
                    agentThoughts = processResponse(text);
                    agentThoughts.unshift(`Mode: OAUTH TOKEN | Strategy: Protocol Enforcer | Model: Gemini 3 Pro Preview`);
                } else {
                    const errorText = await response.text();
                    console.error("Gemini Oauth Error", errorText);
                    agentThoughts = [
                        "Authentication Failed with provided token.",
                        `Status: ${response.status}`,
                        "Falling back to emergency protocols..."
                    ];
                }
            }

        } catch (error) {
            console.error("Gemini API Error:", error);
            agentThoughts = [
                "Connection to Neural Core failed.",
                `Error: ${error instanceof Error ? error.message : String(error)}`
            ];
        }
    }

    // 4. Construct Graph Data
    const graphElements = [
        { id: 'user', type: 'user', data: { label: 'Alice Engineer' }, position: { x: 300, y: 0 } },
        { id: 'okta', type: 'credential', data: { label: 'Okta SSO' }, position: { x: 300, y: 150 } },
        { id: 'sf_node', type: 'device', data: { label: 'MacBook (SF)' }, position: { x: 100, y: 300 } },
        { id: 'lagos_node', type: 'ip', data: { label: 'IP 197.xx (Lagos)' }, position: { x: 500, y: 300 } },

        { id: 'e1', source: 'user', target: 'okta', animated: true, type: 'smoothstep' },
        { id: 'e2', source: 'okta', target: 'sf_node', animated: true, type: 'smoothstep', style: { stroke: '#e4e4e7' } },
        { id: 'e3', source: 'okta', target: 'lagos_node', animated: true, type: 'smoothstep', style: { stroke: '#ef4444' } },
    ];

    return NextResponse.json({
        home,
        attacker,
        velocity,
        graphElements,
        agentThoughts
    });
}

function createPrompt(home: any, attacker: any, velocity: any, protocol: any) {
    return `
    INCIDENT DATA:
    Login 1: ${home.city} (${home.ip}) at ${home.timestamp}.
    Login 2: ${attacker.city} (${attacker.ip}) at ${attacker.timestamp}.
    Velocity: ${velocity.speed_mph} MPH.
    
    EXECUTION STEPS:
    1. Compare Velocity (${velocity.speed_mph}mph) against Protocol Condition (${protocol?.steps.conditions[0].value}).
    2. Confirm if Condition is Met.
    3. State the defined ACTIONS to take.
    4. Keep output concise (bullet points).
    `;
}

function processResponse(text: string) {
    return text.split('\n').filter(line => line.trim().length > 0).slice(0, 10);
}
