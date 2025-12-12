export const INITIAL_PROTOCOLS = [
    // --- LEGACY / DEMOS ---
    {
        id: 'SEC-001',
        title: 'Impossible Travel Containment',
        description: 'Locks account if logins detected in distant locations.',
        contextSchema: {
            user_id: 'string',
            velocity: 'number (mph)',
            last_location: 'string (City, Country)',
            current_location: 'string (City, Country)',
            time_diff: 'number (hours)'
        },
        category: 'SecOps',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 't_sec1', system: 'SPLUNK', event: 'geo.velocity.violation', description: 'Geo-velocity violation detected' },
            conditions: [{ id: 'c_sec1', field: 'velocity', operator: 'GREATER_THAN', value: 600 }],
            actions: [
                { id: 'a_sec1', type: 'AUTOMATION', system: 'SALESFORCE', action: 'lock_user', params: { reason: 'impossible_travel' } },
                { id: 'a_sec2', type: 'AI_AGENT', system: 'SLACK', action: 'alert_secops', params: { channel: '#soc-critical' }, agentRole: 'SOC Analyst' }
            ]
        },
        stats: { runs: 142, successRate: 99 }
    },

    // --- BATCH 1: IT & SECURITY ---
    {
        id: 'IT-001',
        title: 'Start-Day Access Preflight',
        description: 'Ensure new contractors have access on Day 1 by detecting missing permissions 72h prior.',
        contextSchema: {
            contractor_name: 'string',
            days_until_start: 'number',
            access_request_status: "string ('missing' | 'complete')"
        },
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
        contextSchema: {
            new_hire_id: 'string',
            onboarding_status: "string ('pending' | 'in_progress' | 'complete')",
            device_provisioned: 'boolean'
        },
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
        contextSchema: {
            cve_id: 'string',
            cvss_score: 'number (0-10)',
            public_exposure: 'boolean',
            affected_assets: 'string[]'
        },
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
        contextSchema: {
            vendor_id: 'string',
            request_source: "string ('email' | 'portal')",
            verification_status: "string ('verified' | 'pending' | 'failed')"
        },
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
    },

    // --- BATCH 2: REVENUE & OPS ---
    {
        id: 'REV-001',
        title: 'Competitor Counter-Offer',
        description: 'Drafts competitive quotes based on intel.',
        contextSchema: {
            opportunity_id: 'string',
            competitor_name: 'string',
            margin: 'percentage',
            deal_size: 'currency (USD)'
        },
        category: 'Revenue',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'rev_t1', system: 'SALESFORCE', event: 'competitor.mentioned', description: 'Competitor mentioned in Opportunity' },
            conditions: [
                { id: 'rev_c1', field: 'margin', operator: 'GREATER_THAN', value: '20%' },
                { id: 'rev_c2', field: 'competitor_name', operator: 'CONTAINS', value: 'Cyberdyne' }
            ],
            actions: [
                { id: 'rev_draft_response', type: 'AI_AGENT', system: 'SALESFORCE', action: 'draft_quote', params: { discount: '5%', tone: 'competitive' }, agentRole: 'Sales Coach' },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'REV-002',
        title: 'Margin Guardrails',
        description: 'Prevents negative margin quotes by checking real-time ERP costs.',
        contextSchema: {
            quote_id: 'string',
            projected_margin: 'percentage',
            sku: 'string'
        },
        category: 'Revenue',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'rev_t2', system: 'SALESFORCE', event: 'quote.drafted', description: 'Quote drafted > $100k' },
            conditions: [
                { id: 'rev_c3', field: 'projected_margin', operator: 'LESS_THAN', value: '5%' }
            ],
            actions: [
                { id: 'rev_check_erp_cost', type: 'AUTOMATION', system: 'SAP', action: 'get_latest_cost', params: { sku: 'context.sku' } },
                { id: 'rev_block_quote', type: 'AUTOMATION', system: 'SALESFORCE', action: 'block_quote_submission', params: { reason: 'margin_violation' } },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'OPS-001',
        title: 'Promise-to-Deliver Check',
        description: 'Validates ship dates against real inventory and production constraints.',
        contextSchema: {
            order_id: 'string',
            inventory_level: 'number',
            order_quantity: 'number'
        },
        category: 'SupplyChain',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'ops_t1', system: 'SALESFORCE', event: 'order.commit', description: 'Sales rep commits date' },
            conditions: [
                { id: 'ops_c1', field: 'inventory_level', operator: 'LESS_THAN', value: 'order_quantity' }
            ],
            actions: [
                { id: 'ops_check_production', type: 'AUTOMATION', system: 'SAP', action: 'check_production_schedule', params: {} },
                { id: 'ops_propose_date', type: 'AI_AGENT', system: 'SALESFORCE', action: 'update_commit_date', params: { buffer: '3d' }, agentRole: 'Supply Planner' },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'OPS-002',
        title: 'Supply Chain Disruption',
        description: 'Re-routes logistics upon detecting port strikes or weather delays.',
        contextSchema: {
            incident_type: 'string',
            delay_impact: 'number (hours)',
            affected_lanes: 'string[]'
        },
        category: 'SupplyChain',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'ops_t2', system: 'CONTROL_TOWER', event: 'logistics.delay', description: 'Port delay detected' },
            conditions: [
                { id: 'ops_c2', field: 'delay_impact', operator: 'GREATER_THAN', value: 48 }
            ],
            actions: [
                { id: 'ops_find_routes', type: 'AI_AGENT', system: 'SAP', action: 'optimize_route', params: { mode: 'air' }, agentRole: 'Logistics Manager' },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },

    // --- BATCH 3: IT & SEC DEEP DIVE ---
    {
        id: 'SEC-004',
        title: 'Third-Party Access Monitor',
        description: 'Detects and revokes idle third-party vendor access after 30 days.',
        contextSchema: {
            vendor_id: 'string',
            days_inactive: 'number',
            vendor_type: "string ('contractor' | 'partner')"
        },
        category: 'SecOps',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'sec_t4', system: 'OAUTH_LOGS', event: 'vendor_idle_detected', description: 'Vendor idle > 30d' },
            conditions: [
                { id: 'sec_c6', field: 'days_inactive', operator: 'GREATER_THAN', value: 30 },
                { id: 'sec_c7', field: 'vendor_type', operator: 'EQUALS', value: 'contractor' }
            ],
            actions: [
                { id: 'sec_revoke_keys', type: 'AUTOMATION', system: 'OKTA', action: 'revoke_session', params: { target: 'vendor_id' } },
                { id: 'sec_notify_vendor', type: 'AUTOMATION', system: 'EMAIL', action: 'send_notice', params: { template: 'access_revoked' } },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'SEC-005',
        title: 'Incident Evidence Packager',
        description: 'Auto-collects logs, charts, and user activity for High Severity incidents.',
        contextSchema: {
            incident_id: 'string',
            severity: "string ('SEV-1' | 'SEV-2')",
            source: 'string'
        },
        category: 'SecOps',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'sec_t5', system: 'PAGERDUTY', event: 'incident.high_sev', description: 'High Sev Incident Created' },
            conditions: [
                { id: 'sec_c8', field: 'severity', operator: 'EQUALS', value: 'SEV-1' }
            ],
            actions: [
                { id: 'sec_collect_logs', type: 'AUTOMATION', system: 'SPLUNK', action: 'export_logs', params: { window: 'last_1h' } },
                { id: 'sec_create_war_room', type: 'AI_AGENT', system: 'SLACK', action: 'create_channel', params: { name: 'war-room-inc-123' }, agentRole: 'Incident Commander' },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'IT-003',
        title: 'Offboarding Kill-Switch',
        description: 'Instant revocation of all access upon "Terminated" status in HRIS.',
        contextSchema: {
            employee_id: 'string',
            termination_type: "string ('voluntary' | 'involuntary')"
        },
        category: 'ITSM',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'it_t3', system: 'WORKDAY', event: 'worker.terminated', description: 'Employee Terminated' },
            conditions: [
                { id: 'it_c4', field: 'termination_type', operator: 'EQUALS', value: 'involuntary' }
            ],
            actions: [
                { id: 'it_kill_switch_okta', type: 'AUTOMATION', system: 'OKTA', action: 'deactivate_user', params: { immediate: true } },
                { id: 'it_wipe_device', type: 'HUMAN_APPROVAL', system: 'JAMF', action: 'wipe_remote', params: {} },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'IT-004',
        title: 'Role Change Access Diff',
        description: 'Removes old permissions when a user changes department.',
        contextSchema: {
            user_id: 'string',
            old_dept: 'string',
            new_dept: 'string'
        },
        category: 'ITSM',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'it_t4', system: 'WORKDAY', event: 'role_change', description: 'Department Change Detected' },
            conditions: [
                { id: 'it_c5', field: 'old_dept', operator: 'NOT_EQUALS', value: 'new_dept' }
            ],
            actions: [
                { id: 'it_calc_access_diff', type: 'AI_AGENT', system: 'OKTA', action: 'suggest_revocations', params: {}, agentRole: 'Identity Architect' },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'IT-005',
        title: 'CMDB Drift Detector',
        description: 'Identifies unmanaged cloud assets and enforces tagging.',
        contextSchema: {
            asset_id: 'string',
            uptime: 'number (hours)',
            tags: 'string[]'
        },
        category: 'ITSM',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'it_t5', system: 'AWS_CONFIG', event: 'untagged_resource', description: 'Resource missing CostCenter tag' },
            conditions: [
                { id: 'it_c6', field: 'uptime', operator: 'GREATER_THAN', value: 24 }
            ],
            actions: [
                { id: 'it_auto_tag', type: 'AI_AGENT', system: 'AWS', action: 'infer_tag', params: {}, agentRole: 'Cloud FinOps' },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },

    // --- BATCH 4: HR, FIN, LEGAL ---
    {
        id: 'HR-001',
        title: 'Benefit Enrollment Error',
        description: 'Detects optional benefits selected without required base plans.',
        contextSchema: {
            employee_id: 'string',
            has_hsa: 'boolean',
            has_hdhp: 'boolean'
        },
        category: 'HR',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'hr_t1', system: 'WORKDAY', event: 'benefit_selection_submitted', description: 'Benefit selection submitted' },
            conditions: [
                { id: 'hr_c1', field: 'has_hsa', operator: 'EQUALS', value: true },
                { id: 'hr_c2', field: 'has_hdhp', operator: 'EQUALS', value: false }
            ],
            actions: [
                { id: 'hr_auto_correct', type: 'AUTOMATION', system: 'WORKDAY', action: 'flag_enrollment_error', params: { code: 'HSA_WITHOUT_HDHP' } },
                { id: 'hr_notify_employee', type: 'AI_AGENT', system: 'SLACK', action: 'explain_benefit_error', params: { policy: 'HSA_REQ' }, agentRole: 'Benefits Assistant' },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'HR-002',
        title: 'Payroll Variance Check',
        description: 'Flags payroll cycles with >10% variance from average.',
        contextSchema: {
            pay_period: 'string',
            total_variance: 'percentage',
            previous_average: 'currency'
        },
        category: 'HR',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'hr_t2', system: 'WORKDAY', event: 'payroll_preview_ready', description: 'Payroll preview generated' },
            conditions: [
                { id: 'hr_c3', field: 'total_variance', operator: 'GREATER_THAN', value: '10%' }
            ],
            actions: [
                { id: 'hr_analyze_variance', type: 'AI_AGENT', system: 'WORKDAY', action: 'analyze_payroll_diff', params: { depth: 'detailed' }, agentRole: 'Payroll Auditor' },
                { id: 'hr_hold_approval', type: 'HUMAN_APPROVAL', system: 'WORKDAY', action: 'require_cfo_approval', params: {} },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'FIN-001',
        title: 'Duplicate Invoice Check',
        description: 'Blocks payment of invoices with identical amounts/dates/vendors.',
        contextSchema: {
            invoice_id: 'string',
            is_potential_duplicate: 'boolean',
            vendor_name: 'string'
        },
        category: 'Revenue',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'fin_t1', system: 'SAP', event: 'invoice_received', description: 'Vendor invoice received' },
            conditions: [
                { id: 'fin_c1', field: 'is_potential_duplicate', operator: 'EQUALS', value: true }
            ],
            actions: [
                { id: 'fin_block_payment', type: 'AUTOMATION', system: 'SAP', action: 'hold_payment', params: { reason: 'duplicate_suspicion' } },
                { id: 'fin_verify_vendor', type: 'AI_AGENT', system: 'EMAIL', action: 'request_clarification', params: { vendor_contact: 'primary' }, agentRole: 'AP Specialist' },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'FIN-002',
        title: 'CapEx Policy Enforcer',
        description: 'Routes unbudgeted CapEx >$50k for special committee approval.',
        contextSchema: {
            requisition_id: 'string',
            amount: 'currency (USD)',
            is_budgeted: 'boolean'
        },
        category: 'Revenue',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'fin_t2', system: 'COUPA', event: 'pr_submitted', description: 'Purchase Requisition Submitted' },
            conditions: [
                { id: 'fin_c2', field: 'amount', operator: 'GREATER_THAN', value: 50000 },
                { id: 'fin_c3', field: 'is_budgeted', operator: 'EQUALS', value: false }
            ],
            actions: [
                { id: 'fin_route_approval', type: 'AUTOMATION', system: 'COUPA', action: 'add_approver', params: { role: 'InvestmentCommittee' } },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    },
    {
        id: 'LEG-001',
        title: 'Legal Hold Automator',
        description: 'Freezes data deletion policies for users under investigation.',
        contextSchema: {
            hold_id: 'string',
            user_id: 'string',
            reason: 'string'
        },
        category: 'SecOps',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: {
            trigger: { id: 'leg_t1', system: 'ONETRUST', event: 'legal_hold_issued', description: 'Legal hold issued for user' },
            conditions: [],
            actions: [
                { id: 'leg_freeze_email', type: 'AUTOMATION', system: 'OFFICE365', action: 'apply_retention_policy', params: { policy: 'infinite_hold' } },
                { id: 'leg_freeze_slack', type: 'AUTOMATION', system: 'SLACK', action: 'disable_retention', params: { user_id: 'context.user_id' } },
                { id: 'NO_ACTION', type: 'AUTOMATION', system: 'INTERNAL', action: 'log_info', params: {} }
            ]
        },
        stats: { runs: 0, successRate: 0 }
    }
];
