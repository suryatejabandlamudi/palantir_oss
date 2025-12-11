// --- Shared Protocol Library ---
// This file is the SINGLE SOURCE OF TRUTH for all Protocols.
// Imported by:
// 1. Client State (teslaState.ts) -> For UI Protocol Builder
// 2. Server API (agent/sec-001/route.ts) -> For AI Enforcement

export interface ProtocolTrigger {
    id: string;
    system: string; // e.g., "SPLUNK", "WORKDAY"
    event: string;  // e.g., "geo.velocity.violation"
    description: string;
}

export interface ProtocolCondition {
    id: string;
    field: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
    value: string | number | boolean;
}

export interface ProtocolAction {
    id: string;
    type: 'AUTOMATION' | 'AI_AGENT' | 'HUMAN_APPROVAL';
    system: string;
    action: string; // e.g., "lock_user", "send_email"
    params: Record<string, any>;
    agentRole?: string; // e.g., "SOC Analyst"
}

export interface ProtocolSteps {
    trigger: ProtocolTrigger;
    conditions: ProtocolCondition[];
    actions: ProtocolAction[];
}

export interface ProtocolStepResult {
    thoughts: string[];
    decision: 'EXECUTE' | 'WAIT' | 'BLOCK';
    action: ProtocolAction;
    raw_response?: string;
}

export interface Protocol {
    id: string;
    title: string;
    description: string;
    category: 'ITSM' | 'SecOps' | 'Revenue' | 'SupplyChain' | 'HR';
    status: 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'ARCHIVED';
    createdAt: string;
    updatedAt: string;
    steps: ProtocolSteps;
    stats?: {
        runs: number;
        successRate: number;
    };
}

export const INITIAL_PROTOCOLS: Protocol[] = [
    // --- ITSM ---
    {
        id: 'ITSM-001',
        title: 'Start-Day Access Preflight',
        description: 'Automated access provisioning for new contractors.',
        category: 'ITSM',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 't1', system: 'WORKDAY', event: 'contractor.created', description: 'New Contractor Record < 72h before start' },
            conditions: [{ id: 'c1', field: 'start_date', operator: 'LESS_THAN', value: '72h' }],
            actions: [
                { id: 'a1', type: 'AUTOMATION', system: 'SERVICENOW', action: 'create_request', params: { type: 'access' } },
                { id: 'a2', type: 'AUTOMATION', system: 'SLACK', action: 'notify_manager', params: {} }
            ]
        },
        stats: { runs: 45, successRate: 98 }
    },
    {
        id: 'ITSM-003',
        title: 'Offboarding Kill-Switch',
        description: 'Instant revocation of access upon termination.',
        category: 'ITSM',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 't3', system: 'WORKDAY', event: 'worker.terminated', description: 'Employee Terminated' },
            conditions: [],
            actions: [
                { id: 'a3', type: 'AUTOMATION', system: 'SALESFORCE', action: 'freeze_user', params: {} },
                { id: 'a4', type: 'AI_AGENT', system: 'SLACK', action: 'audit_log', params: {}, agentRole: 'Security Bot' }
            ]
        },
        stats: { runs: 12, successRate: 100 }
    },

    // --- SecOps ---
    {
        id: 'SEC-001',
        title: 'Impossible Travel Containment',
        description: 'Locks account if logins detected in distant locations.',
        category: 'SecOps',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 't_sec1', system: 'SPLUNK', event: 'geo.velocity.violation', description: 'Geo-velocity violation detected' },
            conditions: [{ id: 'c_sec1', field: 'velocity', operator: 'GREATER_THAN', value: '600mph' }],
            actions: [
                { id: 'a_sec1', type: 'AUTOMATION', system: 'SALESFORCE', action: 'lock_user', params: { reason: 'impossible_travel' } }, // Using SF as proxy for Okta in this schema
                { id: 'a_sec2', type: 'AI_AGENT', system: 'SLACK', action: 'alert_secops', params: { channel: '#soc-critical' }, agentRole: 'SOC Analyst' }
            ]
        },
        stats: { runs: 142, successRate: 99 }
    },

    // --- Revenue ---
    {
        id: 'REV-001',
        title: 'Competitor Counter-Offer',
        description: 'Drafts competitive quotes based on intel.',
        category: 'Revenue',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 't_rev1', system: 'SALESFORCE', event: 'competitor.mentioned', description: 'Competitor mentioned in Opportunity' },
            conditions: [{ id: 'c_rev1', field: 'margin', operator: 'GREATER_THAN', value: '20%' }],
            actions: [
                { id: 'a_rev1', type: 'AI_AGENT', system: 'EMAIL', action: 'draft_response', params: { tone: 'competitive' }, agentRole: 'Sales Coach' }
            ]
        },
        stats: { runs: 8, successRate: 85 }
    },

    // --- Supply Chain ---
    {
        id: 'SUP-001',
        title: 'Shipment Delay Re-route',
        description: 'Suggests alternative logistics for delayed cargo.',
        category: 'SupplyChain',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 't_sup1', system: 'SAP', event: 'vessel.delayed', description: 'Vessel Delay Event > 24h' },
            conditions: [{ id: 'c_sup1', field: 'cargo_value', operator: 'GREATER_THAN', value: '$50k' }],
            actions: [
                { id: 'a_sup1', type: 'AI_AGENT', system: 'SAP', action: 'check_routes', params: {}, agentRole: 'Logistics Planner' },
                { id: 'a_sup2', type: 'HUMAN_APPROVAL', system: 'EMAIL', action: 'approve_air_freight', params: {} }
            ]
        },
        stats: { runs: 3, successRate: 100 }
    },
    // --- BATCH 1: IT & SECURITY ---
    {
        id: 'IT-001',
        title: 'Start-Day Access Preflight',
        description: 'Ensure new contractors have access on Day 1 by detecting missing permissions 72h prior.',
        category: 'ITSM',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'it_t1', system: 'WORKDAY', event: 'contractor_start_date_approaching', description: 'Contractor start < 72h' },
            conditions: [
                { id: 'it_c1', field: 'days_until_start', operator: 'LESS_THAN', value: 3 },
                { id: 'it_c2', field: 'access_request_status', operator: 'EQUALS', value: 'missing' }
            ],
            actions: [
                { id: 'it_draft_access_request', type: 'AUTOMATION', system: 'SERVICENOW', action: 'draft_request', params: { type: 'access' } },
                { id: 'it_notify_manager', type: 'AUTOMATION', system: 'SLACK', action: 'notify_manager', params: { channel: 'general' } },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'IT-002',
        title: 'Onboarding Autopilot',
        description: 'Orchestrate valid onboarding across Identity, Device, and Apps queues.',
        category: 'ITSM',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'it_t2', system: 'WORKDAY', event: 'new_hire_confirmed', description: 'New hire confirmed' },
            conditions: [
                { id: 'it_c3', field: 'onboarding_status', operator: 'NOT_EQUALS', value: 'complete' }
            ],
            actions: [
                { id: 'it_create_onboarding_tasks', type: 'AUTOMATION', system: 'SERVICENOW', action: 'create_tasks', params: { template: 'onboarding_bundle' } },
                { id: 'it_escalate_sla_risk', type: 'AI_AGENT', system: 'SLACK', action: 'escalate_risk', params: { priority: 'high' }, agentRole: 'IT Coordinator' },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'SEC-002',
        title: 'CVE Patch Plan',
        description: 'Map Critical CVEs to App Owners and auto-generate patch plans.',
        category: 'SecOps',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'sec_t2', system: 'TENABLE', event: 'critical_cve_detected', description: 'Critical CVE > 9.0' },
            conditions: [
                { id: 'sec_c2', field: 'cvss_score', operator: 'GREATER_THAN', value: 9.0 },
                { id: 'sec_c3', field: 'public_exposure', operator: 'EQUALS', value: true }
            ],
            actions: [
                { id: 'sec_map_owner', type: 'AUTOMATION', system: 'CMDB', action: 'find_owner', params: { asset_id: 'context.asset_id' } },
                { id: 'sec_generate_patch_plan', type: 'AI_AGENT', system: 'JIRA', action: 'create_patch_plan', params: { priority: 'P0' }, agentRole: 'Security Analyst' },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'SEC-003',
        title: 'Vendor Bank-Change Guard',
        description: 'Prevent AP fraud by enforcing 2-channel verification for bank changes.',
        category: 'SecOps',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'sec_t3', system: 'SAP', event: 'vendor_bank_update_request', description: 'Bank update request from Email' },
            conditions: [
                { id: 'sec_c4', field: 'request_source', operator: 'EQUALS', value: 'email' },
                { id: 'sec_c5', field: 'verification_status', operator: 'NOT_EQUALS', value: 'verified' }
            ],
            actions: [
                { id: 'sec_block_change', type: 'AUTOMATION', system: 'SAP', action: 'block_update', params: { reason: 'unverified_source' } },
                { id: 'sec_initiate_fraud_check', type: 'AI_AGENT', system: 'SERVICENOW', action: 'create_fraud_case', params: { vendor_id: 'context.vendor_id' }, agentRole: 'Fraud Analyst' },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    }
];
