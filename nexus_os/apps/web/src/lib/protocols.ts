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

export type SystemType = 'SLACK' | 'TEAMS' | 'EMAIL' | 'WORKDAY' | 'SAP' | 'SALESFORCE' | 'SERVICENOW' | 'JIRA' | 'SPLUNK' | 'CROWDSTRIKE';

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
    contextSchema: Record<string, string>; // e.g. { "velocity": "number (mph)", "last_login": "ISO Date" }
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

export const INITIAL_PROTOCOLS: Protocol[] = [];

// --- NEW ARCHITECTURE (Gemini 3 / Redesign) ---

export type AgentModel = 'GEMINI_PRO_1_5' | 'GEMINI_FLASH_1_5' | 'GEMINI_ULTRA' | 'GPT_4_O';

export interface MCPTool {
    id: string;
    name: string; // e.g. "salesforce_lookup_opportunity"
    description: string;
    schema: string; // JSON Schema string for args
    system: SystemType;
}

export interface AgentNode {
    id: string;
    name: string;
    role: string; // e.g. "Senior Revenue Analyst"
    model: AgentModel;
    temperature: number; // 0.0 to 1.0 (Creativity)
    systemPrompt: string; // The "Context Engineering" core
    knowledgeBase?: string[]; // IDs of attached docs
    tools: string[]; // IDs of MCPTools allowed
}

export interface PipelineLink {
    id: string;
    source: string; // AgentNode ID or Trigger ID
    target: string; // AgentNode ID or ToolNode ID
    condition?: string; // Optional logic (e.g. "if sentiment < 0.2")
}

export interface PipelineTrigger {
    id: string;
    type: 'WEBHOOK' | 'SCHEDULE' | 'MANUAL' | 'EVENT';
    config: Record<string, any>; // e.g. { event: "salesforce.opp.created" }
}

export interface AgentPipeline {
    id: string;
    title: string;
    description: string;
    active: boolean;
    nodes: AgentNode[];
    triggers: PipelineTrigger[];
    links: PipelineLink[];
    createdAt: string;
    updatedAt: string;
}
