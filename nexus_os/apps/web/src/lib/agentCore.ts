import { GoogleGenerativeAI } from '@google/generative-ai';
import { Protocol, ProtocolAction, ProtocolStepResult } from './protocols';

// Global Configuration
const MODEL_ID = 'gemini-3-pro-preview';
const FALLBACK_KEY = 'REDACTED_API_KEY'; // Validated AIza Key

interface AgentContext {
    protocol: Protocol;
    data: any; // The "World State" (Simulated or Real)
    userParams?: any; // e.g. "Lock account ID 123"
}

export async function runProtocolAgent(
    protocol: Protocol,
    contextData: any,
    apiKey: string = process.env.GOOGLE_API_KEY || FALLBACK_KEY
): Promise<ProtocolStepResult> {

    if (!apiKey) {
        throw new Error("Missing Google API Key");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: MODEL_ID,
        systemInstruction: {
            role: "system",
            parts: [{ text: constructSystemPrompt(protocol) }]
        },
        generationConfig: {
            temperature: 0.1, // Strict adherence
            maxOutputTokens: 1000,
            responseMimeType: "application/json"
        }
    });

    // Construct the "Case File" for the Agent
    const prompt = `
    CURRENT SITUATION (CONTEXT):
    ${JSON.stringify(contextData, null, 2)}

    YOUR MISSION:
    Analyze the Context against the Protocol.
    Decide the Next Best Action (NBA).
    
    OUTPUT FORMAT (JSON ONLY):
    {
        "thought_process": ["Step 1 observation", "Step 2 rule match", "Step 3 decision"],
        "decision": {
            "action_id": "ACTION_ID_FROM_PROTOCOL",
            "reasoning": "Why this action?",
            "parameters": { ...key value pairs based on context... }
        },
        "status": "APPROVED" | "DENIED" | "NEEDS_APPROVAL"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const response = JSON.parse(text);

        // Basic Validation: Ensure action exists in protocol
        const actionId = response.decision?.action_id;
        const knownAction = protocol.steps.actions.find(a => a.id === actionId);

        if (actionId && !knownAction && actionId !== 'NO_ACTION') {
            return {
                thoughts: response.thought_process || ["Error: Agent hallucinated an unknown action."],
                decision: 'BLOCK',
                action: { id: 'ERROR', system: 'INTERNAL', type: 'AUTOMATION', action: 'error_handler', params: { error: 'Invalid Action ID' } },
                raw_response: text
            };
        }

        return {
            thoughts: response.thought_process || [],
            decision: response.status === 'APPROVED' ? 'EXECUTE' : 'WAIT',
            action: knownAction || { id: 'NO_ACTION', system: 'INTERNAL', type: 'AUTOMATION', action: 'log_no_action', params: {} },
            raw_response: text
        };

    } catch (error) {
        console.error("Agent Execution Failed:", error);
        return {
            thoughts: ["Critical Failure: Model execution error", String(error)],
            decision: 'BLOCK',
            action: { id: 'ERROR', system: 'INTERNAL', type: 'AUTOMATION', action: 'system_failure', params: { error: String(error) } },
            raw_response: String(error)
        };
    }
}

function constructSystemPrompt(protocol: Protocol): string {
    return `
    ROLE: NEXUS OS PROTOCOL ENFORCER
    
    You are the incorruptible logic engine for the "${protocol.title}" workflow.
    
    THE LAW (PROTOCOL DEFINITION):
    ${JSON.stringify(protocol.steps, null, 2)}
    
    DIRECTIVES:
    1. You MUST select an Action defined in the "actions" list above.
    2. You CANNOT invent new actions.
    3. You must strictly evaluate the "conditions" in the protocol against the provided Context.
    4. If no conditions are met, output action_id: "NO_ACTION".
    5. Your specific goal is: ${protocol.description}
    `;
}
