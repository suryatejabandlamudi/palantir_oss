import { Protocol, ProtocolAction, ProtocolStepResult } from './protocols';

// Fallback model if 3.0 preview is unavailable/unstable
const GEMINI_MODEL = 'gemini-2.0-flash';
const FALLBACK_KEY = 'REDACTED_API_KEY'; // Validated AIza Key

interface AgentContext {
    [key: string]: any;
}

export async function runProtocolAgent(protocol: Protocol, context: AgentContext): Promise<ProtocolStepResult> {
    // Force specific key for stability during demo
    const apiKey = 'REDACTED_API_KEY';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const systemPrompt = constructSystemPrompt(protocol);
    const userPrompt = constructUserPrompt(protocol, context);

    try {
        const payload = {
            contents: [{
                parts: [
                    { text: systemPrompt },
                    { text: userPrompt }
                ]
            }],
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Empty response from Gemini");
        }

        // console.log(`Agent Logic:\n${text}`);

        return parseAgentResponse(text, protocol.steps.actions);

    } catch (e: any) {
        // Fallback for demo/simulation if API fails or rate limits
        console.error("Agent Execution Failed:", e.message);
        return {
            thoughts: ["Critical Failure: Model execution error", `Error: ${e.message}`],
            decision: "BLOCK",
            action: { id: "ERROR", type: "AUTOMATION", system: "INTERNAL", action: "log_error", params: { error: e.message } },
            raw_response: e.message
        };
    }
}

function constructSystemPrompt(protocol: Protocol): string {
    return `
    ROLE: NEXUS OS PROTOCOL ENFORCER
    
    You are the incorruptible logic engine for the "${protocol.title}" workflow.
    
    THE LAW (PROTOCOL DEFINITION):
    ${JSON.stringify(protocol.steps, null, 2)}

    REQUIRED DATA SCHEMA:
    The "Context" you receive MUST align with this schema. If data is missing for a condition, output action_id: "NO_ACTION" (or "DATA_MISSING" if critical).
    ${JSON.stringify(protocol.contextSchema, null, 2)}
    
    DIRECTIVES:
    1. You MUST select an Action defined in the "actions" list above.
    2. You CANNOT invent new actions.
    3. You must strictly evaluate the "conditions" in the protocol against the provided Context.
    4. If no conditions are met, output action_id: "NO_ACTION".
    5. Your specific goal is: ${protocol.description}
    `;
}

function constructUserPrompt(protocol: Protocol, context: AgentContext): string {
    return `
    CURRENT SITUATION (CONTEXT):
    ${JSON.stringify(context, null, 2)}

    YOUR ORDERS:
    Analyze the Context against the Protocol Conditions.
    Decide the Next Best Action.
    
    OUTPUT FORMAT ONLY:
    {
      "thoughts": ["step-by-step reasoning", "checking condition X..."],
      "decision": "EXECUTE" | "WAIT" | "BLOCK",
      "action_id": "exact_id_from_protocol"
    }
    `;
}

function parseAgentResponse(text: string, validActions: ProtocolAction[]): ProtocolStepResult {
    try {
        // Simple JSON extraction if wrapped in code blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleanText);

        const action = validActions.find(a => a.id === json.action_id);

        if (!action) {
            // Fallback if AI invents an ID
            if (json.action_id === 'NO_ACTION') {
                return {
                    thoughts: json.thoughts,
                    decision: 'WAIT',
                    action: { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} },
                    raw_response: text
                }
            }
            throw new Error(`Invalid Action ID: ${json.action_id}`);
        }

        return {
            thoughts: json.thoughts,
            decision: json.decision,
            action: action,
            raw_response: text
        };

    } catch (e) {
        return {
            thoughts: ["Parsing Error", text],
            decision: 'BLOCK',
            action: { id: 'PARSE_ERROR', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_error', params: { raw: text } },
            raw_response: text
        };
    }
}
