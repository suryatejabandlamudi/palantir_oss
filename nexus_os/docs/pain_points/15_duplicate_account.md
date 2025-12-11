# Pain Point 15: Duplicate Account Conflict

## 1. The Pain (Before Nexus)
**Scenario:**
- Rep A (Enterprise Team) is talking to "Alphabet Inc."
- Rep B (Mid-Market Team) is talking to "Waymo" (a subsidiary).
- Rep C (EMEA Team) is talking to "Google UK".
To the CRM, these are three different "Accounts".
All three reps call the same Procurement Officer. The customer is annoyed: "Do you guys talk to each other?"
Internally, Reps fight over commission. The deal slows down due to "Territory Conflict".

**Friction Points:**
- **Dirty Data:** Manual entry creates "Google", "Google Inc", "Alphabet".
- **Blindness:** No "Hierarchy" view linking them.
- **Customer Experience:** Disjointed communication.

**Business Impact:**
- **Reputational:** Looks unprofessional.
- **Operational:** Wasted sales cycles (duplicate effort).
- **Financial:** "Double Commission" disputes.

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS uses **Entity Resolution** (Ontology). It knows that "Waymo" *is a child of* "Alphabet". When Rep B creates an opportunity for "Waymo," Nexus alerts them: "This belongs to the Alphabet Hierarchy, owned by Rep A. Collaboration Required." It creates a "Unified Account View".

**Key Features Used:**
- **Entity Resolution:** Fuzzy matching and external enrichment (e.g., D&B data) to link companies.
- **Hierarchy Visualization:** Shows the parent/child tree.
- **Collaboration Trigger:** Forces a "Joint Account Plan".

## 3. Implementation Logic
### Trigger
**Event:** `Account.Created` OR `Opportunity.Created`.
**Source System:** Salesforce.

### Intelligence (The "Brain")
**Context Gathered:**
- **Name:** "Waymo".
- **Domain:** `@waymo.com`.
- **Enrichment:** Identify "Waymo is sub of Alphabet".
- **Existing Owners:** Alphabet owned by `Enterprise_Rep`.

**Decision Logic:**
- IF `NewEntity.Parent` == `ExistingEntity`.
- THEN **Conflict Detected**.
- Action: "Notify Existing Owner" + "Flag New Opportunity".

### Actions Taken
1. **Link Entities:** Update Ontology `Waymo` -> `child_of` -> `Alphabet`.
2. **Alert Reps:**
   - To Rep B: "Waymo is a Strategic Account owned by Rep A."
   - To Rep A: "New activity detected in your subsidiary (Waymo)."
3. **Merge/Co-term:** Suggest combining deals for better leverage.

## 4. Step-by-Step Walkthrough
1. **User Action:** Rep B types "New Lead: DeepMind UK".
2. **Nexus Detection:** "DeepMind is subsidiary of Alphabet."
3. **Agent Reasoning:** "Alphabet is an Enterprise Named Account. Rep B is Mid-Market. Routing rule violation."
4. **Execution:**
   - Auto-convert Lead to Contact under "Alphabet" Account.
   - Task assigned to Rep A: "Reach out to DeepMind contact."
   - Notification to Rep B: "Handed off to Enterprise team (Rules of Engagement)."
5. **Outcome:** Customer gets one coherent voice. Rep A manages the holistic strategy.

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 15: Duplicate Conflict**.
2. Pre-load: Account "Tesla Motors" (Owner: Alice).
3. Try Create: Account "Tesla Energy" (Owner: Bob).
4. Click **Check Conflicts**.
5. Observe:
   - Nexus identifies "Tesla Energy" matches "Tesla Motors" hierarchy.
   - "Conflict Alter" displayed.
   - Suggestion: "Merge into Tesla Motors".

**Success Criteria:**
- [ ] Identifies relationship between disparate names.
- [ ] Flags ownership conflict.
- [ ] Suggests Merge/Link action.
