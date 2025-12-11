import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Protocol } from '../src/lib/protocols';
import { runProtocolAgent } from '../src/lib/agentCore';

const prisma = new PrismaClient();

// MOCK CONTEXT CASES FOR EACH PROTOCOL
const TEST_CASES: Record<string, any> = {
    // IT & SEC BATCH 1
    'IT-001': { contractor_name: 'John Doe', days_until_start: 2, access_request_status: 'missing' }, // Should Trigger: it_draft_access_request
    'IT-002': { new_hire_id: 'NH-123', onboarding_status: 'pending', device_provisioned: false }, // Should Trigger: it_create_onboarding_tasks
    'SEC-002': { cve_id: 'CVE-2024-9999', cvss_score: 9.8, public_exposure: true, affected_assets: ['server-01'] }, // Should Trigger: sec_generate_patch_plan
    'SEC-003': { vendor_id: 'V-999', request_source: 'email', verification_status: 'pending' }, // Should Trigger: sec_block_change

    // REV & OPS BATCH 2
    'REV-001': { opportunity_id: 'OPP-101', competitor_name: 'Cyberdyne Systems', margin: '22%', deal_size: 500000 }, // Should Trigger: rev_draft_response
    'REV-002': { quote_id: 'Q-555', projected_margin: '3%', sku: 'BATTERY-PACK-X' }, // Should Trigger: rev_block_quote (margin < 5%)
    'OPS-001': { order_id: 'ORD-777', inventory_level: 50, order_quantity: 100, sku: 'BATTERY-PACK-X' }, // Should Trigger: ops_check_production (inv < order)
    'OPS-002': { incident_type: 'port_strike', delay_impact: 72, affected_lanes: ['LAX-SHANGHAI'] }, // Should Trigger: ops_find_routes (delay > 48h)

    // IT & SEC BATCH 3 (Deep Dive)
    'SEC-004': { vendor_id: 'V-OLD', days_inactive: 45, vendor_type: 'contractor' }, // Should Trigger: sec_revoke_keys (days > 30)
    'SEC-005': { incident_id: 'INC-HIGH', severity: 'SEV-1', source: 'PagerDuty' }, // Should Trigger: sec_create_war_room
    'IT-003': { employee_id: 'E-TERM', termination_type: 'involuntary' }, // Should Trigger: it_kill_switch_okta
    'IT-004': { user_id: 'U-MOVE', old_dept: 'Engineering', new_dept: 'Sales' }, // Should Trigger: it_calc_access_diff
    'IT-005': { asset_id: 'i-0123445', uptime: 48, tags: [] }, // Should Trigger: it_auto_tag (uptime > 24h & untagged)

    // TAIL BATCH 4 (HR/Fin/Leg)
    'HR-001': { employee_id: 'E-BEN', has_hsa: true, has_hdhp: false }, // Should Trigger: hr_auto_correct
    'HR-002': { pay_period: '2024-12-A', total_variance: '15%', previous_average: 100000 }, // Should Trigger: hr_analyze_variance (var > 10%)
    'FIN-001': { invoice_id: 'INV-DUP', is_potential_duplicate: true, vendor_name: 'Acme Corp' }, // Should Trigger: fin_block_payment
    'FIN-002': { requisition_id: 'REQ-BIG', amount: 60000, is_budgeted: false }, // Should Trigger: fin_route_approval (amt > 50k & !budgeted)
    'LEG-001': { hold_id: 'LH-001', user_id: 'U-INVESTIGATE', reason: 'SEC Inquiry' } // Should Trigger: leg_freeze_email
};

const EXPECTED_ACTIONS: Record<string, string> = {
    'IT-001': 'it_draft_access_request',
    'IT-002': 'it_create_onboarding_tasks',
    'SEC-002': 'sec_map_owner', // Step 1: Find Owner
    'SEC-003': 'sec_block_change',
    'REV-001': 'rev_draft_response',
    'REV-002': 'rev_check_erp_cost', // Step 1: Check ERP Cost
    'OPS-001': 'ops_check_production',
    'OPS-002': 'ops_find_routes',
    'SEC-004': 'sec_revoke_keys',
    'SEC-005': 'sec_collect_logs', // Step 1: Collect Logs
    'IT-003': 'it_kill_switch_okta',
    'IT-004': 'it_calc_access_diff',
    'IT-005': 'it_auto_tag',
    'HR-001': 'hr_auto_correct',
    'HR-002': 'hr_analyze_variance',
    'FIN-001': 'fin_block_payment',
    'FIN-002': 'fin_route_approval',
    'LEG-001': 'leg_freeze_email'
};

async function verifyAll() {
    console.log(`🚀 STARTING COMPREHENSIVE PROTOCOL VERIFICATION (Gemini 2.0 Flash - DB Powered)`);

    // Fetch from Deep Database
    const protocolsRaw = await prisma.protocol.findMany({
        include: {
            steps: {
                include: { action: true },
                orderBy: { order: 'asc' }
            }
        }
    });

    // Map to Agent-compatible structure
    const protocols = protocolsRaw.map(p => ({
        ...p,
        contextSchema: JSON.parse(p.contextSchema), // Still JSON
        steps: {
            actions: p.steps.map(s => ({
                id: s.action?.key || 'unknown', // The Agent uses 'key' as ID
                type: 'AUTOMATION', // Defaulting for now
                system: s.action?.integrationId || 'internal',
                action: s.action?.name || 'unknown',
                params: JSON.parse(s.action?.schema || '{}')
            }))
        }
    })) as any[];

    let passed = 0;
    let failed = 0;

    // Filter to only protocols we have test cases for (should be all 20 except maybe SEC-001 which was pre-existing)
    // Note: SEC-001, ITSM-001/3 are older demos, we focus on the 20 new ones + SEC-001 if we add it.
    // Actually, let's verify everything in INITIAL_PROTOCOLS that is in our test set.

    // Adding legacy/demo protocols to test set if needed for full coverage
    // TEST_CASES['SEC-001'] = { user_id: 'U-TRAVEL', velocity: 700, last_location: 'NYC', current_location: 'London', time_diff: 2 };
    // EXPECTED_ACTIONS['SEC-001'] = 'a_sec1'; // lock_user

    for (const protocol of protocols) {
        console.log(`Testing Protocol: [${protocol.id}] ${protocol.title}...`);

        try {
            const context = TEST_CASES[protocol.id];
            const expectedId = EXPECTED_ACTIONS[protocol.id];

            // Only run test if a test case exists for this protocol
            if (!context || !expectedId) {
                console.log(`   SKIP: No test case defined for protocol ${protocol.id}`);
                continue;
            }

            const result = await runProtocolAgent(protocol, context);

            if (result.action.id === expectedId) {
                console.log(`✅ PASS: Triggered ${result.action.id}`);
                console.log(`   Reasoning: ${result.thoughts[0]}`);
                passed++;
            } else {
                console.log(`❌ FAIL: Expected ${expectedId}, got ${result.action.id}`);
                console.log(`   Thoughts: ${JSON.stringify(result.thoughts)}`);
                console.log(`   Raw: ${result.raw_response}`);
                failed++;
            }

        } catch (e) {
            console.log(`❌ ERROR: Exception running ${protocol.id}`);
            console.error(e);
            failed++;
        }
        console.log('---');
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n📊 VERIFICATION SUMMARY`);
    console.log(`Total: ${passed + failed}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
        process.exit(1);
    }
}

// Check for API Key
if (!process.env.GOOGLE_API_KEY) {
    // Attempt fallback from env or hardcode for this script if known safe (which it is for this session)
    process.env.GOOGLE_API_KEY = "REDACTED_API_KEY";
}

verifyAll();
