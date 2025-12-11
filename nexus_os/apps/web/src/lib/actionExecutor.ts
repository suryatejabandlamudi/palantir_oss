import { ProtocolAction } from './protocols';

/**
 * MCP-Lite: Action Executor
 * Maps Protocol Actions to executable code.
 * In a real deployment, this would call external APIs via Model Context Protocol (MCP).
 * Here, we simulate the execution with logging and mock returns.
 */

export interface ActionResult {
    success: boolean;
    data?: any;
    error?: string;
    timestamp: number;
}

// Registry of "Real" System Actions
type ActionHandler = (params: any) => Promise<ActionResult>;

const ACTION_REGISTRY: Record<string, ActionHandler> = {
    // --- ServiceNow Actions ---
    'draft_request': async (params) => {
        console.log('[ServiceNow] Drafting Request:', params);
        return { success: true, data: { ticket_id: 'RITM' + Math.floor(Math.random() * 10000), status: 'draft' }, timestamp: Date.now() };
    },
    'create_tasks': async (params) => {
        console.log('[ServiceNow] Creating Bundle:', params);
        return { success: true, data: { bundle_id: 'TASK_' + Math.floor(Math.random() * 1000), count: 3 }, timestamp: Date.now() };
    },
    'create_fraud_case': async (params) => {
        console.log('[ServiceNow] Creating Fraud Case:', params);
        return { success: true, data: { case_id: 'SEC-' + Math.floor(Math.random() * 1000), severity: 'High' }, timestamp: Date.now() };
    },

    // --- Workday / HR Actions ---
    'freeze_user': async (params) => {
        console.log('[Identity] Freezing User Account:', params);
        return { success: true, data: { account_status: 'locked' }, timestamp: Date.now() };
    },
    'flag_enrollment_error': async (params) => {
        console.log('[Workday] Flagging Enrollment Error:', params);
        return { success: true, data: { alert_id: 'BEN-ERR-' + Math.floor(Math.random() * 1000) }, timestamp: Date.now() };
    },
    'explain_benefit_error': async (params) => {
        console.log('[Slack] Providing Benefit Guidance:', params);
        return { success: true, data: { thread_id: 'th_' + Date.now() }, timestamp: Date.now() };
    },
    'analyze_payroll_diff': async (params) => {
        console.log('[Workday] Analyzing Payroll Variance:', params);
        // Simulate a "thinking" delay
        await new Promise(r => setTimeout(r, 500));
        return { success: true, data: { variance_root_cause: 'Bonus Payouts', diff: '+$1.2M' }, timestamp: Date.now() };
    },
    'require_cfo_approval': async (params) => {
        console.log('[Workday] Routing for CFO Approval:', params);
        return { success: true, data: { approval_flow_id: 'wf_cfo_123' }, timestamp: Date.now() };
    },

    // --- Finance / Coupa Actions ---
    'hold_payment': async (params) => {
        console.log('[SAP] Holding Payment:', params);
        return { success: true, data: { invoice_status: 'ON_HOLD' }, timestamp: Date.now() };
    },
    'request_clarification': async (params) => {
        console.log('[Email] Requesting Vendor Clarification:', params);
        return { success: true, data: { email_sent: true }, timestamp: Date.now() };
    },
    'add_approver': async (params) => {
        console.log('[Coupa] Adding Ad-Hoc Approver:', params);
        return { success: true, data: { approver_added: params.role }, timestamp: Date.now() };
    },

    // --- Legal / Compliance Actions ---
    'apply_retention_policy': async (params) => {
        console.log('[Office365] Applying Legal Hold:', params);
        return { success: true, data: { policy_applied: true }, timestamp: Date.now() };
    },
    'disable_retention': async (params) => {
        console.log('[Slack] Disabling Retention Expiry:', params);
        return { success: true, data: { user_scope: 'preserved' }, timestamp: Date.now() };
    },

    // --- Slack Actions ---
    'notify_manager': async (params) => {
        console.log('[Slack] Notification Sent:', params);
        return { success: true, data: { msg_id: 'ts_' + Date.now() }, timestamp: Date.now() };
    },
    'escalate_risk': async (params) => {
        console.log('[Slack] Risk Escalation:', params);
        return { success: true, data: { channel: '#incident-response', mentions: ['@ciso'] }, timestamp: Date.now() };
    },

    // --- SAP / ERP Actions ---
    'block_update': async (params) => {
        console.log('[SAP] Blocking Vendor Update:', params);
        return { success: true, data: { vendor_blocked: true, reason: params.reason }, timestamp: Date.now() };
    },
    'find_owner': async (params) => {
        console.log('[CMDB] Looking up Asset Owner:', params);
        return { success: true, data: { owner_email: 'app_owner@example.com', cost_center: 'CC-123' }, timestamp: Date.now() };
    },

    // --- JIRA Actions ---
    'create_patch_plan': async (params) => {
        console.log('[Jira] Creating Patching Epic:', params);
        return { success: true, data: { epic_key: 'SEC-8821', timeline: '48h' }, timestamp: Date.now() };
    },

    // --- Internal/System Actions ---
    'log_info': async (params) => {
        console.log('[System] Logging Info:', params);
        return { success: true, timestamp: Date.now() };
    },
    'log_no_action': async (params) => {
        console.log('[System] No Action Required.');
        return { success: true, timestamp: Date.now() };
    },
    'system_failure': async (params) => {
        console.error('[System] CRITICAL FAILURE:', params);
        return { success: false, error: params.error, timestamp: Date.now() };
    },
    'error_handler': async (params) => {
        console.error('[System] Action Error:', params);
        return { success: false, error: params.error, timestamp: Date.now() };
    }
};

export async function executeAction(action: ProtocolAction): Promise<ActionResult> {
    const handler = ACTION_REGISTRY[action.action];

    if (!handler) {
        // Fallback for actions defined in protocol but not yet implemented in registry
        console.warn(`[ActionExecutor] Missing handler for action: ${action.action}`);
        return {
            success: false,
            error: `Not Implemented: ${action.action}`,
            timestamp: Date.now()
        };
    }

    try {
        return await handler(action.params);
    } catch (e) {
        return {
            success: false,
            error: String(e),
            timestamp: Date.now()
        };
    }
}
