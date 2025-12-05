# Enterprise Process Brain - Setup & Data Guide

This guide details the accounts you need to create and the specific data you should ingest to perfectly showcase the "Enterprise Process Brain" product.

## 1. Required Accounts

To run the full "Real Integration" demo, you will need developer/sandbox accounts for the following platforms.

### A. AI & Orchestration
*   **Google AI Studio (Gemini API):**
    *   **Sign up:** [https://aistudio.google.com/](https://aistudio.google.com/)
    *   **Action:** Create an API Key.
    *   **Config:** Set `GEMINI_API_KEY` in your environment.
    *   **Model:** We use `gemini-1.5-flash` for speed and `gemini-1.5-pro` for complex reasoning.

### B. Enterprise Systems (Systems of Record)
*   **SAP (ERP):**
    *   **Sign up:** [SAP Developers](https://developers.sap.com/) (Get a BTP Trial Account).
    *   **Alternative:** Use the built-in `Mock` mode in our `SAPConnector` if a full SAP instance is too heavy.
    *   **Config:** `SAP_URL`, `SAP_USERNAME`, `SAP_PASSWORD`.

*   **Salesforce (CRM):**
    *   **Sign up:** [Salesforce Developer Edition](https://developer.salesforce.com/signup).
    *   **Action:** Enable API access.
    *   **Config:** `SALESFORCE_INSTANCE_URL`, `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET`.

*   **ServiceNow (ITSM):**
    *   **Sign up:** [ServiceNow Developer Program](https://developer.servicenow.com/).
    *   **Action:** Request a "Personal Developer Instance" (PDI).
    *   **Config:** `SERVICENOW_INSTANCE`, `SERVICENOW_USERNAME`, `SERVICENOW_PASSWORD`.

*   **Workday (HRIS):**
    *   **Note:** Workday does not offer open developer trials.
    *   **Action:** Use our `WorkdayConnector` in **Mock Mode** (default) or connect to an existing enterprise sandbox if you have one.

*   **Microsoft 365 (Productivity):**
    *   **Sign up:** [Microsoft 365 Developer Program](https://developer.microsoft.com/en-us/microsoft-365/dev-program).
    *   **Action:** Get a free E5 sandbox. Register an App in Azure AD (Entra ID) with Graph API permissions (`Mail.Read`, `Files.Read`, `User.Read`).
    *   **Config:** `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`, `GRAPH_CLIENT_SECRET`.

---

## 2. Data Ingestion Strategy (The "Truth" Data)

To make the demo "meaningful" and "wow" the stakeholders, you must seed these systems with interconnected data. Do not use random strings. Use a coherent story.

### Story Arc: "The High-Stakes Delay"
*   **Context:** A critical component (`COMP-X`) for a strategic product is delayed.
*   **Impact:** Affects a major customer (`Tesla`) and a standard customer (`Apple`).
*   **Resolution:** The Agent identifies the risk, updates dates, and triggers an incident for the strategic account.

### Data to Create (Manual or Scripted)

#### 1. SAP (ERP) - The Source of Truth for Orders
Create the following **Sales Orders**:
*   **Order 1:**
    *   `OrderID`: `SO-1001`
    *   `Customer`: `Apple Inc.` (Standard)
    *   `Item`: `COMP-X` (Quantity: 1000)
    *   `Promised Date`: `2025-10-15`
    *   `Amount`: `$500,000`
*   **Order 2:**
    *   `OrderID`: `SO-1002`
    *   `Customer`: `Tesla Inc.` (Strategic)
    *   `Item`: `COMP-X` (Quantity: 5000)
    *   `Promised Date`: `2025-10-12`
    *   `Amount`: `$1,200,000`

#### 2. Salesforce (CRM) - The Context for Customers
Create **Accounts** to define the "Strategic" value:
*   **Account 1:**
    *   `Name`: `Tesla Inc.`
    *   `Type`: `Strategic Partner`
    *   `AnnualRevenue`: `$80B`
    *   `AccountManager`: `Elon M.`
*   **Account 2:**
    *   `Name`: `Apple Inc.`
    *   `Type`: `Customer`

#### 3. ServiceNow (ITSM) - The Action Layer
*   **No pre-data needed.** The Agent *creates* data here.
*   **Expected Outcome:** A new Incident created automatically:
    *   `Short Description`: "Supply Chain Delay Impacting Tesla (SO-1002)"
    *   `Urgency`: `High`

#### 4. Workday (HRIS) - For the "People" Wedge (Optional)
If showing the **HR Attrition Radar**:
*   **Employee:** `Sarah Connor` (Engineering Lead)
*   **Data:**
    *   `TimeOffBalance`: `120 hours` (High - not taking leave)
    *   `LastPromotion`: `3 years ago`
    *   `Performance`: `Exceeds Expectations`

#### 5. Microsoft 365 (Comms) - The "Noise"
*   **Email:** Send an email to yourself (the user) from "Supplier":
    *   `Subject`: "Urgent: Delay on Component X"
    *   `Body`: "We are facing a 9-day delay on PO-998877 for Component X."

---

## 3. How to Run the Demo

1.  **Configure:** Fill in `.env` or export variables for the platforms you have set up.
2.  **Run Supply Chain Agent:**
    ```bash
    python3 main_supply_chain.py
    ```
    *   *Note: If you lack real credentials, the system automatically falls back to the "Perfect Demo" mock data.*

3.  **Observe:**
    *   Agent notices the delay event.
    *   Agent queries SAP for affected orders.
    *   Agent identifies Tesla as "Strategic" (via Salesforce logic).
    *   Agent updates SAP delivery dates.
    *   Agent opens a ServiceNow incident for the high-value risk.
