# Pain Point 7: CVE Patch Plan

## 1. The Pain (Before Nexus)
**Scenario:**
A critical vulnerability (CVE-2024-XXXX) is announced for a popular web framework. The Security team scans the network and finds 50 exposed servers.
Then the chaos begins: "Who owns Server-12?" "Is Server-99 Prod or Dev?" "Can we patch this now or do we need a maintenance window?"
Emails fly. Spreadsheets are created. Meanwhile, hackers are scanning for this exact vulnerability. The remediation takes weeks because finding *who* to ask is harder than applying the patch.

**Friction Points:**
- **Ownership Gap:** Assets in the scanner don't map to humans in the directory.
- **Coordination Cost:** Security generates the work, Ops has to do it, Business has to approve downtime.
- **Blind Spots:** "I thought Bob patched that?"

**Business Impact:**
- **Security:** High exposure window (Time-to-Patch is the critical metric).
- **Operational:** Frantic meetings interrupting deep work.
- **Compliance:** Failing SLA for critical patches.

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS bridges the gap between the "Vulnerability Scanner" and the "CMDB/Ontology." It knows exactly which Business App runs on Server-12 and who the Technical Owner is. It automates the "Ask" -> "Plan" -> "Verify" loop.

**Key Features Used:**
- **Ontology Mapping:** `Vulnerability` -> `Software` -> `Server` -> `Application` -> `Owner`.
- **Workflow Automation:** Creates the ticket, assigns it to the right person, and suggests the patch window based on the App's SLA (e.g., "Silver App = Patch this weekend").
- **Verification Loop:** Re-scans the asset automatically after the ticket is closed.

## 3. Implementation Logic
### Trigger
**Event:** New `High Severity Vulnerability` detected on `Asset`.
**Source System:** Tenable / Qualys / AWS Inspector.

### Intelligence (The "Brain")
**Context Gathered:**
- **CVE:** Score 9.8 (Critical).
- **Asset:** `Web-Server-01`.
- **Relationship:** Powers `Customer Portal` (Tier 1 App).
- **Owner:** `Platform Team`.

**Decision Logic:**
- IF `Score` > 9.0 AND `App.Tier` == 1 -> **P0 Emergency**.
- Action: "Mandatory Patch within 24h".
- Suggestion: "Schedule window during defined maintenance hour: 02:00 UTC".

### Actions Taken
1. **Identify Impact:** Map vulnerability to business capability.
2. **Draft Plan:** Create Change Request: "Apply Patch to Web-Server-01".
3. **Notify Owner:** "Critical CVE detected on your app. Change Request #CR-55 drafted for tonight. Approve?"
4. **Ops Handoff:** Once approved, trigger Ansible playbook (optional) or notify Ops to execute.

## 4. Step-by-Step Walkthrough
1. **System Event:** Mock Scanner reports "CVE-2024-9999" on `srv-payment-01`.
2. **Nexus Detection:** "Vulnerability Ingestion. Mapping to Ontology..."
3. **Agent Reasoning:** "Server belongs to 'Payments Service'. Owner is 'FinTech Ops'. Severity Critical."
4. **Execution:**
   - Nexus opens Jira Ticket: "Emergency Patch - Payments".
   - Nexus Slacks Channel `#fintech-ops`: "CVE-2024-9999 requires patch. I've pre-approved the change window for 2AM. Please confirm readiness."
5. **Outcome:** Owner clicks "Confirm". Patch is applied. Nexus re-scans and closes the ticket.

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 07: CVE Patch Plan**.
2. Simulate CVE: "Log4j Variant", Severity: 10.
3. Target: "Frontend Server".
4. Click **Process Vulnerability**.
5. Observe:
   - "Owner Resolution" identifies the Engineering Lead.
   - "Patch Plan" is generated with a specific time window.
   - Ticket is created.
   - "Re-scan" confirms patch (simulated).

**Success Criteria:**
- [ ] Correctly maps anonymous server to business owner.
- [ ] Assigns correct priority based on App Tier.
- [ ] Generates actionable remediation plan.
