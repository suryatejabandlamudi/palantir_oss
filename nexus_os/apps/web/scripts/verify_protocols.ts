
import { useTeslaStore, ResolutionProtocol, Signal } from '../src/lib/teslaState';

// ------------------------------------------------------------------
// 1. Mock Fetch for Node Environment (Simulates /api/agent/execute)
// ------------------------------------------------------------------
global.fetch = ((url: string, options: any) => {
    const body = JSON.parse(options.body as string);
    const { protocolId, trigger } = body;

    // Simulate API Response based on Protocol ID
    const steps = [
        { type: 'thought', content: `[MOCKED API] Analyzing trigger: ${trigger}...` },
        { type: 'action', content: `[MOCKED API] Executing tool for ${protocolId}...` },
        { type: 'result', content: `[MOCKED API] Operation successful for ${protocolId}.` }
    ];

    // Add specific verification snippets expected by the test
    if (protocolId === 'ITSM-001') steps[2].content = "Request #REQ-991 created. Okta group membership staged.";
    if (protocolId === 'ITSM-002') steps[2].content = "Laptop shipped (FedEx #7712). Welcome email scheduled.";
    if (protocolId === 'ITSM-003') steps[2].content = "User suspended. All active sessions terminated in < 200ms.";
    if (protocolId === 'ITSM-004') steps[2].content = "Permissions updated. 'prod-access' revoked.";
    if (protocolId === 'ITSM-005') steps[2].content = "Asset mapped to 'Test Environment'. Owner assigned: QA Team.";

    if (protocolId === 'SEC-001') steps[2].content = "Account Locked. Sessions Revoked. Sev-1 Ticket #SEC-882 created.";
    if (protocolId === 'SEC-002') steps[2].content = "Owner identified: PaymentTeam. Patching scheduled for next maintenance window.";
    if (protocolId === 'SEC-003') steps[2].content = "Payment Blocked. Verification email + SMS sent to validated contact.";
    if (protocolId === 'SEC-004') steps[2].content = "Stale account disabled. Security posture improved.";
    if (protocolId === 'SEC-005') steps[2].content = "Evidence package (2.4GB) uploaded to Box. Post-mortem template created.";

    if (protocolId === 'REV-001') steps[2].content = "Counter-offer approved (Margin impact: -2%). Draft sent to AM.";
    if (protocolId === 'REV-002') steps[2].content = "Quote Blocked. Deal Desk alerted for Exception Approval.";
    if (protocolId === 'REV-003') steps[2].content = "Shortfall (-500). Recommendation: Expedite or Split Ship.";
    if (protocolId === 'REV-004') steps[2].content = "Churn Risk Flagged. CSM deployed.";
    if (protocolId === 'REV-005') steps[2].content = "Accounts merged. Single Source of Truth restored.";

    if (protocolId === 'SUP-001') steps[2].content = "Shipment re-routed. ETA delta reduced to +4h.";
    if (protocolId === 'SUP-002') steps[2].content = "Emergency PO #PO-9912 created. Vendor confirmed 24h delivery.";
    if (protocolId === 'SUP-003') steps[2].content = "Master Data updated. Safety stock calculation adjusted.";
    if (protocolId === 'SUP-004') steps[2].content = "Payment Released. Variance auto-coded to GL-999.";
    if (protocolId === 'SUP-005') steps[2].content = "Compliance Pack generated. 450 artifacts compiled.";

    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ steps })
    });
}) as any;

// ------------------------------------------------------------------
// 2. Test Runner
// ------------------------------------------------------------------
async function testProtocol(p: ResolutionProtocol, triggerSignal: Signal, expectedResultSnippet: string) {
    const store = useTeslaStore.getState();

    // Reset
    store.signals = [];
    store.protocols.forEach(proto => store.updateProtocolStatus(proto.id, 'idle'));

    // Inject
    store.addSignal(triggerSignal);

    // Run (Async) - This calls the mock fetch
    await store.evaluateProtocols();

    // Verify
    const updated = useTeslaStore.getState().protocols.find(proto => proto.id === p.id);
    const resultStep = updated?.steps.find(s => s.type === 'result');

    // Check if status is correct steps are populated, and result matches
    const passed = updated?.status === 'completed'
        && updated.steps.length >= 3
        && resultStep?.content.includes(expectedResultSnippet);

    if (passed) {
        console.log(`✅ [${p.id}] ${p.title} - PASSED`);
        return true;
    } else {
        console.log(`❌ [${p.id}] ${p.title} - FAILED`);
        console.log(`   Status: ${updated?.status} (Expected: completed)`);
        console.log(`   Steps: ${updated?.steps.length} (Expected: >=3)`);
        console.log(`   Result: ${resultStep?.content}`);
        console.log(`   Expected Snippet: "${expectedResultSnippet}"`);
        return false;
    }
}

// ------------------------------------------------------------------
// 3. Main Execution
// ------------------------------------------------------------------
async function runVerification() {
    console.log("🚀 Starting Verification of 20 Pain Point Protocols (with Mocked Backend)...\n");
    const allProtocols = useTeslaStore.getState().protocols;
    let passedCount = 0;
    let failedCount = 0;

    const tests = [
        { id: 'ITSM-001', signal: { type: 'INTELLIGENCE', title: 'New Contractor record created', metadata: { trigger: 'ITSM-001' } }, expect: 'Request #REQ-991 created' },
        { id: 'ITSM-002', signal: { type: 'OPERATIONAL', title: 'Offer Accepted event', metadata: { trigger: 'ITSM-002' } }, expect: 'Laptop shipped' },
        { id: 'ITSM-003', signal: { type: 'RISK', title: 'Terminated status change', metadata: { trigger: 'ITSM-003' } }, expect: 'User suspended' },
        { id: 'ITSM-004', signal: { type: 'INTELLIGENCE', title: 'Role Change detected', metadata: { trigger: 'ITSM-004' } }, expect: 'Permissions updated' },
        { id: 'ITSM-005', signal: { type: 'OPERATIONAL', title: 'Orphaned Asset detected', metadata: { trigger: 'ITSM-005' } }, expect: 'Asset mapped' },

        { id: 'SEC-001', signal: { type: 'RISK', title: 'Impossible Travel', metadata: { trigger: 'SEC-001' } }, expect: 'Account Locked' },
        { id: 'SEC-002', signal: { type: 'RISK', title: 'Critical CVE found', metadata: { trigger: 'SEC-002' } }, expect: 'Owner identified' },
        { id: 'SEC-003', signal: { type: 'RISK', title: 'Bank Update Request', metadata: { trigger: 'SEC-003' } }, expect: 'Payment Blocked' },
        { id: 'SEC-004', signal: { type: 'RISK', title: 'Vendor Access inactive', metadata: { trigger: 'SEC-004' } }, expect: 'Stale account disabled' },
        { id: 'SEC-005', signal: { type: 'OPERATIONAL', title: 'Incident Evidence', metadata: { trigger: 'SEC-005' } }, expect: 'Evidence package' },

        { id: 'REV-001', signal: { type: 'OPPORTUNITY', title: 'Competitor Mentioned', metadata: { trigger: 'REV-001' } }, expect: 'Counter-offer approved' },
        { id: 'REV-002', signal: { type: 'RISK', title: 'Margin Guardrails', metadata: { trigger: 'REV-002' } }, expect: 'Quote Blocked' },
        { id: 'REV-003', signal: { type: 'OPERATIONAL', title: 'Promise-to-Deliver', metadata: { trigger: 'REV-003' } }, expect: 'Shortfall' },
        { id: 'REV-004', signal: { type: 'RISK', title: 'Churn Risk', metadata: { trigger: 'REV-004' } }, expect: 'Churn Risk Flagged' },
        { id: 'REV-005', signal: { type: 'INTELLIGENCE', title: 'Duplicate Account', metadata: { trigger: 'REV-005' } }, expect: 'Accounts merged' },

        { id: 'SUP-001', signal: { type: 'OPERATIONAL', title: 'Shipment Delay', metadata: { trigger: 'SUP-001' } }, expect: 'Shipment re-routed' },
        { id: 'SUP-002', signal: { type: 'RISK', title: 'Critical Stockout', metadata: { trigger: 'SUP-002' } }, expect: 'Emergency PO' },
        { id: 'SUP-003', signal: { type: 'INTELLIGENCE', title: 'Lead-Time Drift', metadata: { trigger: 'SUP-003' } }, expect: 'Master Data updated' },
        { id: 'SUP-004', signal: { type: 'OPERATIONAL', title: 'Invoice Mismatch', metadata: { trigger: 'SUP-004' } }, expect: 'Payment Released' },
        { id: 'SUP-005', signal: { type: 'OPERATIONAL', title: 'Audit Evidence', metadata: { trigger: 'SUP-005' } }, expect: 'Compliance Pack generated' },
    ];

    for (const test of tests) {
        // Find protocol definition
        const proto = allProtocols.find(p => p.id === test.id);
        if (!proto) {
            console.error(`⚠️ Protocol definition not found for ${test.id}`);
            failedCount++;
            continue;
        }

        // Run test
        // @ts-ignore
        const isSuccess = await testProtocol(proto, {
            id: `TEST-${test.id}`,
            timestamp: 'Now',
            source: 'Test',
            description: 'Test Trigger',
            impact: 'None',
            ...test.signal
        }, test.expect);

        if (isSuccess) passedCount++;
        else failedCount++;
    }

    console.log(`\n---------------------------------------------------`);
    console.log(`Results: ${passedCount} Passed, ${failedCount} Failed.`);
    console.log(`---------------------------------------------------`);

    if (failedCount > 0) process.exit(1);
    process.exit(0);
}

runVerification();
