import { NextResponse } from 'next/server';
import { ExternalSystemMocks } from '@/lib/external_mocks';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simulate realistic network/thinking latency for fallback
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request) {
    const body = await req.json();
    const { protocolId, trigger, pipeline, inputs } = body;

    // --- PIPELINE LOADING FROM DB ---
    // If protocolId looks like a UUID, assume it's a DB Pipeline
    let dbPipeline = null;
    let agentNode = null;

    if (protocolId && protocolId.includes('-')) {
        try {
            // Need to import Prisma inside scope or lazily
            // Using direct fetch for simplicity in this file context, but ideally we use the prisma singleton
            // For now, let's rely on the passed 'pipeline' object if present, OR fetch it.
            // Since we can't easily import PrismaClient here without creating connection issues in edge/serverless contexts sometimes,
            // we will simulate the fetch or assume 'pipeline' body param is populated by the caller (The Mesh).

            // Actually, let's try to just assume the body has it for now to avoid 'fs' issues in Edge runtime if configured.
            // But user wants "Real DB".

            // To do this properly in Next.js App Router route handlers:
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const pipelineRecord = await prisma.agentPipeline.findUnique({
                where: { id: protocolId },
                include: { nodes: { include: { agent: true } }, edges: true }
            });

            if (pipelineRecord) {
                dbPipeline = pipelineRecord;
                // Find the agent node
                const node = dbPipeline.nodes.find((n: any) => n.config?.includes('AGENT') || n.agentId);
                if (node && node.agent) {
                    agentNode = node.agent;
                }
            }
        } catch (e) {
            console.warn("Failed to load pipeline from DB, falling back to static/mock", e);
        }
    }

    // --- REAL GEMINI INTEGRATION ---
    const apiKey = process.env.GOOGLE_API_KEY;

    if (apiKey && (dbPipeline || protocolId)) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

            // Construct Prompt based on Pipeline Context or Default Protocol logic
            let systemInstruction = "You are an autonomous AI agent for Enterprise Operations.";
            let userPrompt = `Trigger Event: ${trigger || JSON.stringify(inputs)}`;

            // Override with Real Agent from DB
            if (agentNode) {
                systemInstruction = agentNode.systemPrompt;
                userPrompt += `\nRole: ${agentNode.role}`;
                // We could also mix in RAG here
            } else if (pipeline) {
                // If we have a rich Pipeline object from the Builder
                const primaryAgent = pipeline.nodes.find((n: any) => n.id.includes('agent'));
                if (primaryAgent) {
                    systemInstruction = primaryAgent.systemPrompt;
                    userPrompt += `\nRole: ${primaryAgent.role}\nAvailable Tools: ${primaryAgent.tools.join(', ')}`;
                }
            }

            const prompt = `
            ${systemInstruction}
            
            TASK: Analyze the trigger and decide on a course of action.
            You have access to simulated enterprise tools.
            
            RESPOND IN JSON FORMAT ONLY:
            {
                "thought": "your internal reasoning",
                "tool_call": "service.function(args)",
                "final_result": "summary of action"
            }
            
            ${userPrompt}
            `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Attempt to parse JSON response
            let parsed;
            try {
                // simple cleanup in case markdown code blocks are used
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                parsed = JSON.parse(cleanText);
            } catch (e) {
                // Fallback if model didn't output JSON
                parsed = {
                    thought: text,
                    tool_call: null,
                    final_result: "Processed with Gemini (Non-JSON Output)"
                };
            }

            return NextResponse.json({
                steps: [
                    { type: 'trigger', content: `Signal Processing: ${trigger}` },
                    { type: 'thought', content: parsed.thought },
                    parsed.tool_call ? { type: 'action', content: parsed.tool_call } : null,
                    { type: 'result', content: parsed.final_result }
                ].filter(Boolean)
            });

        } catch (error) {
            console.error("Gemini API Error, falling back to simulation:", error);
            // Fallthrough to simulation
        }
    }

    // --- FALLBACK SIMULATION (Previous Logic) ---
    // Useful if no API Key or API fails

    const steps = [];

    // 1. Trigger Acknowledgment
    steps.push({
        type: 'trigger',
        content: `Signal Received: ${trigger}`
    });

    // 2. Agent Thinking (Simulated Latency)
    await delay(800);
    let thought = "";
    let toolCall = null;
    let result = "";

    // Detailed Logic for each Protocol ID
    switch (protocolId) {
        // --- ITSM ---
        case 'ITSM-001': // Start-Day Access
            thought = "New hire starts in < 72h. Checking HRIS for role definition to provision access.";
            await delay(1200);
            const employee = ExternalSystemMocks.workday.getEmployee('EMP-9982');
            toolCall = `okta.provision_user(email='alex.smith@example.com', role='${employee.Position}')`;
            result = `Account created. Welcome email scheduled for ${employee.Legal_Name}.`;
            break;

        case 'ITSM-002': // Onboarding Autopilot
            thought = "Candidate accepted offer. Initiating hardware fulfillment workflow.";
            await delay(1000);
            toolCall = "service_now.create_request(item='MacBook Pro 16', recipient='C-101')";
            const ticket = ExternalSystemMocks.serviceNow.createTicket("Hardware Provisioning");
            result = `Hardware Request ${ticket.number} created. FedEx label generated.`;
            break;

        case 'ITSM-005': // CMDB Drift
            thought = "Unidentified IP detected by Network Scanner. Correlation with ServiceNow CMDB required.";
            await delay(1500);
            toolCall = "service_now.cmdb_ci_lookup(ip='10.0.4.15')";
            const assets = ExternalSystemMocks.serviceNow.searchAssets('10.0.4.15');
            result = `Asset Identified: ${assets[0].name}. Drift record updated.`;
            break;

        // --- SecOps ---
        case 'SEC-001': // Impossible Travel
            thought = "Login detected from Lagos (IP: 197.210.x.x) 45 mins after login from NY. Velocity > 900mph.";
            await delay(1000);
            const threat = ExternalSystemMocks.secOps.analyzeThreat('197.210.22.11');
            toolCall = `okta.suspend_session(user='j.doe'); crowdstrike.isolate_host(id='H-112')`;
            result = `Threat Score: ${threat.ReputationScore}. Account Locked. Host Isolated.`;
            break;

        case 'SEC-003': // Vendor Bank Guard
            thought = "Sensitive change to Vendor Bank Details detected. Initiating Out-of-Band Verification.";
            await delay(1200);
            toolCall = "slack.notify_channel(channel='#finance-fraud', message='Verify Vendor ID 992')";
            result = "Payment Blocked. fraud-check ticket created. SMS verification sent.";
            break;

        // --- Revenue ---
        case 'REV-001': // Competitor Counter-Offer
            thought = "Competitor Offer uploaded. analyzing margin impact of matching discount.";
            await delay(1500);
            const opp = ExternalSystemMocks.salesforce.getOpportunity('OPP-1123');
            const newMargin = parseFloat(opp.Margin__c) - 5;
            toolCall = `salesforce.calculate_margin(dealId='${opp.Id}', discount='5%')`;
            result = `Counter-offer Approved. New Margin: ${newMargin.toFixed(2)}% (Safe). Draft sent to AE.`;
            break;

        case 'REV-002': // Margin Guardrails
            thought = "Quote discount exceeds delegated authority (>20%). Checking floor price.";
            await delay(1000);
            toolCall = "salesforce.submit_approval_request(quoteId='Q-991', approver='VP_SALES')";
            const approval = ExternalSystemMocks.salesforce.updateQuote('Q-991', 25);
            result = `Quote Blocked. ${approval.message}. Escalated to Deal Desk.`;
            break;

        // --- Supply Chain ---
        case 'SUP-002': // Critical Stockout
            thought = "Inventory level projected to breach safety stock in 4 days. Unconfirmed POs exist.";
            await delay(1500);
            const inv = ExternalSystemMocks.sap.checkInventory('SKU-992-A');
            toolCall = `sap.create_purchase_requisition(sku='${inv.Material}', qty=500, type='EMERGENCY')`;
            const po = ExternalSystemMocks.sap.createPO(500);
            result = `Emergency PO ${po.PurchaseOrder} created. Expedite fee approved.`;
            break;

        default:
            // Generic Fallback for other 12 protocols not explicitly mocked above (for brevity of this pivot)
            thought = "Analyzing signal context against policy engine...";
            await delay(800);
            toolCall = "workflow_engine.execute_standard_procedure()";
            result = "Protocol executed successfully. Compliance logged.";
            break;
    }

    steps.push({
        type: 'thought',
        content: thought
    });

    if (toolCall) {
        steps.push({
            type: 'action',
            content: toolCall
        });
    }

    steps.push({
        type: 'result',
        content: result
    });

    return NextResponse.json({ steps });
}

