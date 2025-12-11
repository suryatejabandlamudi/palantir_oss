import { NextResponse } from 'next/server';
import { ExternalSystemMocks } from '@/lib/external_mocks';

// Simulate realistic network/thinking latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request) {
    const body = await req.json();
    const { protocolId, trigger } = body;

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
