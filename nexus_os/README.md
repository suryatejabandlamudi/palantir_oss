# Nexus OS - Protocol-First Enterprise Operating System

> **The Central Nervous System for the Autonomous Enterprise.**

Nexus OS is a next-generation platform that unifies enterprise systems (SAP, Salesforce, ServiceNow, Workday) under a single "Protocol-Driven" architecture. It replaces manual handoffs and siloed workflows with AI Agents that strictly enforce business logic ("The Law").

## 🧠 Core Architecture: Protocol-First

In Nexus OS, **Protocols are supreme**. They are the single source of truth for how the business operates.

1.  **Define**: Protocols are defined in `lib/protocols.ts` (The Law).
2.  **Enforce**: `agentCore.ts` (The Enforcer) uses **Gemini 3 Pro** to strictly follow these protocols.
3.  **Execute**: Actions are executed via `actionExecutor.ts` (MCP-Lite) against real 3rd-party APIs or simulated environments.
4.  **Visualize**: `ProtocolRunner.tsx` provides a transparent "Thinking" UI for every decision.

## 🚀 The 20 Enterprise Protocols (Implemented)

Nexus OS comes pre-loaded with solutions for 20 critical enterprise pain points:

### 🛡️ Security & IT (SecOps/ITSM)
*   **SEC-001**: Impossible Travel Containment (Geo-Velocity Checks)
*   **SEC-002**: Critical CVE Patch Planning (Tenable -> Jira)
*   **SEC-003**: Vendor Bank Change Fraud Guard (SAP -> ServiceNow)
*   **SEC-004**: Third-Party Access Monitor (Idle Vendor Revocation)
*   **SEC-005**: Incident Evidence Packager (High-Sev Auto-War Room)
*   **IT-001**: Start-Day Access Preflight (Contractor Onboarding)
*   **IT-002**: Onboarding Autopilot (Identity/Device/App Orchestration)
*   **IT-003**: Offboarding Kill-Switch (Immediate Termination)
*   **IT-004**: Role Change Access Diff (Department Transfer Cleanup)
*   **IT-005**: CMDB Drift Detector (Unmanaged Asset Tagging)

### 💰 Revenue & Operations (RevOps/Supply Chain)
*   **REV-001**: Competitor Counter-Offer (Salesforce Competitive Analysis)
*   **REV-002**: Margin Guardrails (Real-time ERP Cost Check)
*   **REV-003**: Renewal Risk Warning (Churn Prevention)
*   **OPS-001**: Promise-to-Deliver Check (Inventory-Aware Commits)
*   **OPS-002**: Supply Chain Disruption (Port Strike Re-routing)

### ⚖️ Finance, HR & Legal (The "Tail")
*   **FIN-001**: Duplicate Invoice Blocker (AP Fraud Prevention)
*   **FIN-002**: CapEx Policy Enforcer (Budget Variance Approval)
*   **HR-001**: Benefit Enrollment Validator (HSA/HDHP Logic)
*   **HR-002**: Payroll Variance Anomaly Detection (>10% Check)
*   **LEG-001**: Legal Hold Automator (Cross-Platform Data Freeze)

## 🛠️ Technical Stack

*   **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
*   **AI Intelligence**: Google Gemini 3.0 Pro (Preview)
*   **Context Engine**: Vector RAG (Multi-Tenant Support)
*   **Execution Layer**: MCP-Lite Action Registry
*   **Backend**: Python (FastAPI/Flask) / Next.js API Routes

## 🚀 Getting Started

1.  **Install Dependencies**: `npm install`
2.  **Configure Environment**: Set `GOOGLE_API_KEY` (Gemini 3 enabled).
3.  **Run Dev Server**: `npm run dev`
4.  **View Protocols**: Navigate to `/protocols` to see the registry.

---
*Built for the Autonomous Future.*
