# Pain Point 4: Role Change Access Diff

## 1. The Pain (Before Nexus)
**Scenario:**
"Emily" is promoted from "Sales Representative" to "Sales Operations Manager."
- **Good:** IT gives her the new "Ops Manager" permissions (access to commission tables, territory config).
- **Bad:** IT *forgets* to remove her old "Sales Rep" permissions (ownership of individual leads, quota limiters).
Now Emily has a hybrid "Super User" state. Even worse, if she moves to a completely different department (e.g., Engineering -> Marketing), she might retain access to the source code *and* the marketing budget. This allows "Permission Bloom" or "Privilege Creep."

**Friction Points:**
- **Add-Only Culture:** It's safer for IT to "add" access than "remove" (fear of breaking work).
- **Invisible Risks:** No dashboard shows "User has conflicting roles."
- **Compliance Nightmares:** SOC2 auditors flag "Why does a marketing person have DB write access?"

**Business Impact:**
- **Security:** Violation of "Least Privilege" principle.
- **Operational:** Confusing user experience (cluttered menus/apps).
- **Compliance:** Audit findings requiring manual remediation.

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS implements a "State Diff" logic. When a role changes, it calculates:
`New State` = (`Old Rights` - `Rights Unique to Old Role`) + `Rights for New Role`.
It proactively identifies "Toxic Combinations" (e.g., can Create Vendor AND Approve Paymet) and flags them.

**Key Features Used:**
- **Ontology Role Matrix:** Defines "Sales Rep" vs. "Sales Ops" clearly.
- **Diff Engine:** Automates the "What to keep, what to drop" logic.
- **Approval Workflow:** Asks the new manager: "Emily still has access to 'Engineering Git'. Should we remove it?"

## 3. Implementation Logic
### Trigger
**Event:** `Employee.Role` changes.
**Source System:** HRIS / Identity Provider.

### Intelligence (The "Brain")
**Context Gathered:**
- **Old Role:** Engineering.
- **New Role:** Product Manager.
- **Current Entitlements:** `[Git_Write, AWS_Deploy, Jira_Admin]`.
- **Target Entitlements:** `[Jira_User, Confluence_Write, Analytics_View]`.

**Decision Logic:**
- **Diff:** `Git_Write` and `AWS_Deploy` are NOT in Target.
- **Recommendation:** Revoke `Git_Write`, `AWS_Deploy`. Grant `Analytics_View`.
- **Safety Check:** "Is `Jira_Admin` allowed for Product Manager?" -> No -> Revoke.

### Actions Taken
1. **Generate Diff:** Create a visual "Before vs. After" card.
2. **Request Confirmation:** Present to Manager/IT Admin.
3. **Execute Remediation:** Batch remove old groups, add new groups.

## 4. Step-by-Step Walkthrough
1. **System Event:** Nexus detects Emily's title change in HR feed.
2. **Nexus Detection:** "Role Change Alert: 'Eng' -> 'PM'. initiating Access Review."
3. **Agent Reasoning:** "Detected 3 obsolete permissions (Code Access). Flagging for removal."
4. **UI Interaction:**
   - Command Center shows: **"Access Review: Emily"**.
   - User clicks **"Apply Recommended Changes"**.
5. **Outcome:** Permissions are cleanly swapped. Zero "Privilege Creep."

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 04: Role Change Access Diff**.
2. Select User: "Emily".
3. Change Role: "Engineer" -> "Product Manager".
4. Click **Analyze Access**.
5. Observe:
   - "Suggested Removals": `Github_Write`, `Prod_Deploy`.
   - "Suggested Additions": `Roadmap_Edit`.
6. Click **Apply Changes**.
7. Verify `User.entitlements` updated correctly.

**Success Criteria:**
- [ ] Correctly identifies permissions to effectively remove.
- [ ] Correctly identifies new permissions to add.
- [ ] Successfully executes the "Swap".
