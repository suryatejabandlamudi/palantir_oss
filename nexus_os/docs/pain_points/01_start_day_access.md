# Pain Point 1: Start-Day Access Preflight

## 1. The Pain (Before Nexus)
**Scenario:**
A new contractor, "Alex," is scheduled to start on Monday at 9:00 AM. The hiring manager signed the contract last week but—buried in meetings—forgot to file the specific IT service request for VPN access, GitHub repo permissions, and the specialized project Jira board.
Alex shows up eager to work. They possess a laptop (maybe personal or shipped) but have zero access to the actual systems needed to code. The manager realizes the mistake at 10:00 AM and frantically files a ticket. IT Service Desk, adhering to a 48-hour SLA for "Standard Access Requests," puts it in the queue.

**Friction Points:**
- **Manual Handoff:** The "Contract Signed" event in the HR/Vendor system didn't talk to the IT Ticketing system.
- **Siloed Queues:** IT has no visibility that this request is for a *today* start; it looks like just another ticket.
- **Productivity Void:** The contractor sits idle for 2-3 days, billing the company but producing nothing.

**Business Impact:**
- **Financial:** 3 days of idle contractor billing @ $150/hr = ~$3,600 wasted per contractor.
- **Operational:** Project timeline slips by half a week immediately.
- **Human:** Poor "Day 1" experience; manager looks disorganized; contractor feels undervalued.

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS eliminates the manual bridge. It listens to the "source of truth" (HRIS or Vendor Management System) and acts as the proactive orchestrator. Instead of waiting for a human to file a ticket, Nexus *pre-flights* the access needs 72 hours before start date (or immediately upon contract sign if distinct).

**Key Features Used:**
- **Unified Ontology:** Maps "Contractor Role" -> "Required Entitlements" (e.g., Role 'React Dev' requires GitHub Team 'Frontend', Jira Project 'Nexus', VPN Group 'Remote').
- **AI Orchestrator:** Detects the start date proximity and checks existing state ("Does Alex have accounts? No.").
- **Automated Service Fulfillment:** Directly calls ServiceNow APIs to create *and* fulfill the request, or drastically reduce triage time by pre-filling everything.

## 3. Implementation Logic
### Trigger
**Event:** `Contractor.StartDate` is `< 72 hours` OR `ContractStatus` changes to `Active`.
**Source System:** HRIS / VendorDB (simulated via `teslaState.ts`).

### Intelligence (The "Brain")
**Context Gathered:**
- **Identity:** Name, Email, Role (e.g., "Frontend Engineer").
- **Department:** "Engineering / Web".
- **Asset State:** Checks current Active Directory / Okta state for this user.

**Decision Logic:**
- IF `User` does not exist in `ActiveDirectory` THEN `Create Account`.
- IF `User` exists BUT misses `Entitlements` defined in `RoleMatrix` THEN `Draft Access Request`.
- IF `Start Date` == `Today` THEN `Priority = Critical`.

### Actions Taken
1. **Identify Gaps:** Compare required vs. actual access.
2. **Auto-Draft Ticket:** Create ServiceNow Incident/Request: "Day 1 Access for Alex (Frontend)".
3. **Notify Approver:** Slack message to Manager: "Alex starts today. I've drafted accessibility request #REQ-101. Reply 'Approve' to execute."
4. **Execute:** Upon approval, call `provisioning.grant_access(...)`.

## 4. Step-by-Step Walkthrough
1. **System Event:** In `teslaState`, a new contractor record is created with `startDate: <today>`.
2. **Nexus Detection:** The "Onboarding Watchdog" protocol runs (scheduled or manual trigger).
3. **Agent Reasoning:** "Found contractor Alex starting today. No GitHub access detected. Role requires 'Frontend-Core'."
4. **Execution:**
   - Nexus creates ServiceNow Ticket: `REQ-8821`.
   - Nexus pings Manager in Teams/Slack: "Ready to provision Alex?"
5. **Outcome:** User gets access within minutes of approval, not days. Dashboard shows "Ready for Start" green indicator.

## 5. Verification
**Test Case:**
1. Navigate to "Command Center".
2. Open "Protocol Library".
3. Select **Protocol 01: Start-Day Access Preflight**.
4. Click **Run Simulation**.
5. Observe:
   - A new "Contractor" appears in the state.
   - The Agent logs show "Detecting impending start date..."
   - A **ServiceNow Request Card** appears in the feed.
   - The status updates to **"Access Provisioned"**.

**Success Criteria:**
- [ ] Agent correctly identifies the missing access.
- [ ] Ticket is created with correct role-based details.
- [ ] Manager notification is simulated.
- [ ] Final state reflects "Provisioned".
