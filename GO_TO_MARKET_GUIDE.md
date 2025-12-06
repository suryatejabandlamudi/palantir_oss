# Enterprise Process Brain - Go-To-Market & Production Guide

This document is your master manual for verifying, deploying, and selling the "Enterprise Process Brain" platform. It details every step needed to move from the current "Mock Demo" state to a "Real Production Platform".

---

## Phase 1: The "Perfect" Demo (Verification)

Before selling, you must verify that the 4 "Hero Wedges" are functioning correctly. We have built a suite of demo scripts that run in **Mock Mode** by default, requiring no external API keys.

### 1. Supply Chain Wedge (The "Tesla" Scenario)
*   **Value Prop:** "Prevent revenue loss by predicting supply chain delays and automating customer communication."
*   **Test Command:** `python3 main_supply_chain.py`
*   **Success Criteria:**
    *   Agent detects `ComponentDeliveryDelayed` event.
    *   Agent queries SAP and finds orders for **Apple** and **Tesla**.
    *   Agent queries Salesforce and identifies **Tesla** as "Strategic".
    *   Agent updates SAP delivery dates.
    *   Agent creates a **ServiceNow Incident** for the strategic risk.

### 2. CFO Wedge (Cash-Conversion Cockpit)
*   **Value Prop:** "Optimize working capital by autonomously managing AP/AR and cash flow risks."
*   **Test Command:** `python3 main_cfo.py`
*   **Success Criteria:**
    *   Agent analyzes SAP AR (Receivables) and AP (Payables).
    *   Agent checks Salesforce Commit Forecast.
    *   Agent identifies a "Cash Trough" in the next 14 days.
    *   Agent recommends deferring payment to **Vendor V-INTEL**.

### 3. CTO Wedge (Release-Risk Gate)
*   **Value Prop:** "Prevent outages by blocking risky deployments that violate governance policies."
*   **Test Command:** `python3 main_cto.py`
*   **Success Criteria:**
    *   Agent scans Jira for pending deployments.
    *   Agent identifies `PROJ-101` (Migrate User DB) as **High Risk (Score 9)**.
    *   Agent consults the **Knowledge Base (RAG)** for "Deployment Policy".
    *   Agent **Blocks** the deployment because it lacks a rollback plan.

### 4. HR Wedge (Attrition Radar)
*   **Value Prop:** "Retain top talent by detecting burnout signals before they resign."
*   **Test Command:** `python3 main_hr.py`
*   **Success Criteria:**
    *   Agent checks Workday for "No Leave Taken" anomalies.
    *   Agent checks Microsoft 365 for "High Meeting Load" (>35h/week).
    *   Agent identifies **Sarah Connor** as high risk.
    *   Agent notifies her manager with a policy-backed intervention plan.

    *   Agent notifies her manager with a policy-backed intervention plan.

### 5. API Integration (Nexus OS Backend)
*   **Value Prop:** "Seamlessly integrate these agents into your existing portals via REST API."
*   **Endpoints:**
    *   `POST /agents/supply-chain/run`
    *   `POST /agents/cfo/run`
    *   `POST /agents/cto/run`
    *   `POST /agents/hr/run`
*   **Verification:**
    *   Start the API: `cd nexus-os/apps && uvicorn api.main:app --port 8000`
    *   The agents return full execution traces in JSON format for UI rendering.

---

## Phase 2: Production Readiness (Real Integrations)

To sell this to a real enterprise, you must connect it to their actual systems. Here is the exact checklist of accounts and configurations needed.

### 1. AI Core (The Brain)
*   **Provider:** Google Gemini API
*   **Action:** Get a production API Key from [Google AI Studio](https://aistudio.google.com/).
*   **Config:** Set `GEMINI_API_KEY` in `.env`.
*   **Why:** Real reasoning capabilities on live data.

### 2. ERP: SAP S/4HANA (The Backbone)
*   **Account:** [SAP BTP Trial](https://developers.sap.com/tutorials/btp-cockpit-entitlements.html) or Client Sandbox.
*   **Config:**
    *   `SAP_URL`: The OData API endpoint (e.g., `https://sandbox.api.sap.com/s4hanacloud`).
    *   `SAP_USERNAME` / `SAP_PASSWORD`: Service user credentials.
*   **Data to Seed:**
    *   Sales Orders (`SO-1001`, `SO-1002`) linked to Material `COMP-X`.

### 3. CRM: Salesforce (The Customer Context)
*   **Account:** [Salesforce Developer Edition](https://developer.salesforce.com/signup).
*   **Config:**
    *   `SALESFORCE_INSTANCE_URL`: Your dev instance URL.
    *   `SALESFORCE_CLIENT_ID` / `SALESFORCE_CLIENT_SECRET`: From "Connected Apps" in Setup.
*   **Data to Seed:**
    *   Account: "Tesla Inc." (Type: Strategic Partner).
    *   Account: "Apple Inc." (Type: Customer).

### 4. ITSM: ServiceNow (The Action Layer)
*   **Account:** [ServiceNow Personal Developer Instance (PDI)](https://developer.servicenow.com/).
*   **Config:**
    *   `SERVICENOW_INSTANCE`: Your PDI name (e.g., `dev12345`).
    *   `SERVICENOW_USERNAME` / `SERVICENOW_PASSWORD`: Admin credentials.
*   **Data to Seed:** None (Agent creates incidents).

### 5. HRIS: Workday (The People Data)
*   **Account:** Workday does not offer public developer trials.
*   **Strategy:** Use the **Mock Mode** for demos unless the client provides a sandbox tenant.
*   **Config (if available):** `WORKDAY_TENANT`, `WORKDAY_CLIENT_ID`, `WORKDAY_CLIENT_SECRET`.

### 6. Productivity: Microsoft 365 (The Signals)
*   **Account:** [M365 Developer Program](https://developer.microsoft.com/en-us/microsoft-365/dev-program) (Free E5 Sandbox).
*   **Config:**
    *   `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`, `GRAPH_CLIENT_SECRET`.
*   **Permissions:** `Calendars.Read`, `Mail.Read`, `User.Read.All`.

---

## Phase 3: The "Evidencer" (RAG Setup)

For the CTO and HR agents to cite policies correctly in production:

1.  **Vector Database:**
    *   We use **ChromaDB** (local) by default.
    *   For production, consider deploying Chroma remotely or using Pinecone/Weaviate.
2.  **Ingestion:**
    *   Place your PDF/Text policies in a folder.
    *   Run a script (to be built) to ingest them using `agent.evidencer.Evidencer.add_evidence`.
3.  **Mock Fallback:**
    *   The current `agent/evidencer.py` has hardcoded "Mock Evidence" for the demo scenarios. This ensures the demo *always works* even without a vector DB.

---

## Phase 4: Selling the Platform

When pitching to CIOs/CTOs, use this narrative:

1.  **"The Problem":** Enterprises are siloed. SAP doesn't talk to Jira. Workday doesn't talk to Outlook. Humans are the glue, and humans burn out.
2.  **"The Solution":** The Enterprise Process Brain. It's not just a chatbot; it's an **Agentic Overlay**.
3.  **"The Proof":** Show the 4 Wedges.
    *   *Show the Supply Chain demo to the COO.*
    *   *Show the CFO demo to the CFO.*
    *   *Show the CTO demo to the VP of Engineering.*
    *   *Show the HR demo to the CHRO.*
4.  **"The Tech":** Built on Palantir-inspired ontology, using Gemini 1.5 for reasoning and a modular "Tool Registry" for secure integrations.

---

## Final Checklist for You

- [ ] **Run all 4 demo scripts** locally to confirm they pass.
- [ ] **Create a Google Cloud Project** and get a Gemini API Key.
- [ ] **Sign up for a Salesforce Developer Account** (it's free and instant).
- [ ] **Sign up for a ServiceNow PDI** (it's free and instant).
- [ ] **Update `.env`** with these real credentials.
- [ ] **Run the scripts again** without `MOCK_GEMINI=true` to verify real connectivity.

**You are now ready to disrupt the enterprise software market.**
