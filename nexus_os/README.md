# Nexus OS - Protocol-First Enterprise Operating System

> **The Central Nervous System for the Autonomous Enterprise.**

Nexus OS is a next-generation platform that unifies enterprise systems (SAP, Salesforce, ServiceNow, Workday) under a single "Protocol-Driven" architecture. It replaces manual handoffs and siloed workflows with AI Agents that strictly enforce business logic ("The Law").

## 🧠 Core Architecture: Protocol-First

In Nexus OS, **Protocols are supreme**. They are the single source of truth for how the business operates.

1.  **Define**: Protocols are defined in `lib/protocols.ts` (The Law).
2.  **Enforce**: `agentCore.ts` (The Enforcer) uses **Gemini 3 Pro** to strictly follow these protocols.
3.  **Execute**: Actions are executed against real 3rd-party APIs (ServiceNow, SAP, etc.) or simulated environments.

### The "Universal" Engine
Unlike traditional automation, Nexus OS actions are not hardcoded scripts.
1.  **Trigger**: An event occurs (e.g., "New Contractor in Workday").
2.  **Context**: The system gathers relevant data.
3.  **Agent Decision**: The AI Agent reviews the "Protocol" for that event.
4.  **Strict Action**: The Agent selects the *only* allowed action from the protocol (e.g., "Draft Access Request"). It cannot hallucinate new actions.

## 🚀 Key Features

*   **Gemini 3.0 Integration**: Powered exclusively by Google's latest `gemini-3-pro-preview` model for superior reasoning.
*   **20+ Enterprise Protocols**: Pre-built workflows for ITSM, SecOps, Revenue, and Supply Chain.
*   **Strict Compliance**: Agents act as "Compliance Officers," ensuring every action is auditable and pre-approved by the protocol.
*   **Real-Time War Rooms**: Dedicated interfaces for high-priority incidents (e.g., Security Containment).

## 🛠️ Technical Stack

*   **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
*   **AI Runtime**: Google Gemini API (v1beta), Python/TypeScript SDKs
*   **State Management**: Zustand (Protocol Store)
*   **Backend**: Python (FastAPI/Flask) for heavy lifting, Next.js API Routes for Agent Orchestration

## 📦 distinct Modules

*   **/gotham**: Security & Cyber Operations
*   **/foundry**: Data Integration & Ontology
*   **/itsm**: IT Service Management
*   **/crm**: Customer & Revenue Operations
*   **/erp**: Enterprise Resource Planning

## 🚀 Getting Started

1.  **Install Dependencies**: `npm install`
2.  **Configure Environment**: Set `GOOGLE_API_KEY` (Gemini 3 enabled).
3.  **Run Dev Server**: `npm run dev`
4.  **Verify Protocols**: `npx tsx scripts/verify_protocols.ts`

---
*Built for the Autonomous Future.*
