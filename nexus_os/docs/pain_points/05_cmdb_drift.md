# Pain Point 5: CMDB Drift Detector

## 1. The Pain (Before Nexus)
**Scenario:**
Reviewing the CMDB (Configuration Management Database), IT sees an entry: `Server-005`.
- **Owner:** "John Doe" (Who left 3 years ago).
- **Status:** "Active".
- **Application:** "Unknown".
In reality, `Server-005` is powering a critical customer-facing API. When a vulnerability hits `Server-005`, security teams page John Doe (fail), then mass-email "Who owns this?". Meanwhile, the server remains unpatched. This is "CMDB Drift"—the map no longer matches the territory.

**Friction Points:**
- **Static Data:** CMDB relies on manual updates ("Please update the sheet when you deploy"). No one does.
- **Orphaned Assets:** Servers/VMs run forgotten, consuming budget and increasing attack surface.
- **Incident Chaos:** When `Server-005` crashes, MTTR (Mean Time To Resolution) explodes because nobody knows what it does.

**Business Impact:**
- **Financial:** Cloud waste (paying for zombie VMs).
- **Security:** Unpatched "Unknown" assets are prime targets.
- **Operational:** Slow incident response.

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS treats the CMDB as a *living* graph, not a database. It continuously reconciles "What is running" (via Cloud APIs/Scanning) vs. "What is documented". When it finds a gap (Drift), it launches a protocol to find the owner.

**Key Features Used:**
- **Cloud/Infra Integration:** Polls AWS/Azure/VMware for live asset lists.
- **Heuristic Ownership:** "This server talks to the Finance DB and was deployed by Sarah's Terraform key. Sarah (or Finance) is the likely owner."
- **Interactive Resolution:** Bots message suspected owners: "Is this yours?"

## 3. Implementation Logic
### Trigger
**Event:** `Asset` detected in Scan but missing/stale in CMDB. OR `Owner` field refers to inactive user.
**Source System:** AWS Config, ServiceNow CMDB.

### Intelligence (The "Brain")
**Context Gathered:**
- **Tags:** Does the AWS resource have `Project: X` tag?
- **Traffic:** Who logs into it? Who deployed it?
- **Cost Center:** Who pays the bill for it?

**Decision Logic:**
- IF `Asset` is unmapped -> initiate **Owner Hunt**.
- IF `Owner` is Terminated -> Assign to `Owner's Manager`.
- IF `Asset` is Idle (0% CPU for 30 days) -> Suggest **Decommission**.

### Actions Taken
1. **Flag Drift:** Mark Asset as "Unverified" (Yellow status).
2. **Auto-Assign:** Update Owner temporarily to "Unassigned / Cloud Ops".
3. **Inquiry:** Send Slack message to last known user: "You deployed `i-09123` 45 days ago. Please confirm project code."
4. **Self-Heal:** Update CMDB with response.

## 4. Step-by-Step Walkthrough
1. **System Event:** Nexus Scan detects `EC2-Instance-X`. CMDB has no record.
2. **Agent Reasoning:** "Instance created by User:Mike. Tag: 'Project-Alpha'. Mike is in Engineering."
3. **Execution:**
   - Nexus creates a "CMDB Repair" task.
   - Nexus Slacks Mike: "Is `EC2-Instance-X` part of Project Alpha? [Yes/No]"
4. **User Response:** Mike clicks "Yes".
5. **Outcome:** CMDB updated: `Name: EC2-Instance-X`, `Owner: Mike`, `App: Project Alpha`. Drift Resolved.

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 05: CMDB Drift Detector**.
2. Simulate Input: "Orphaned Server `SRV-LEGACY` found in AWS."
3. Click **Scan & Resolve**.
4. Observe:
   - Nexus flags the server.
   - Nexus "guesses" the owner based on simulated logs.
   - "Verification Needed" card appears.
   - Clicking "Confirm" updates the mock CMDB.

**Success Criteria:**
- [ ] Drift detected (Asset vs Record mismatch).
- [ ] Logical owner inferred.
- [ ] CMDB record successfully updated (healed).
