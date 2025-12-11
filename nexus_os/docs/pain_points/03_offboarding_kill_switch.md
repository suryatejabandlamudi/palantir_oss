# Pain Point 3: Offboarding Kill-Switch

## 1. The Pain (Before Nexus)
**Scenario:**
An employee, "Dave," is terminated abruptly due to a policy violation or simply resigns to join a competitor. HR processes the termination in Workday at 2:00 PM. HR notifies IT via email.
However, the IT admin is at lunch or busy with a server outage. Dave walks out of the building but his VPN access, his Salesforce login, and his AWS keys remain active.
At 4:00 PM, Dave logs in from home to "grab a few personal files" (and maybe the customer list).

**Friction Points:**
- **Latency:** The time gap between "HR Decision" and "IT Action" is the vulnerability window.
- **Zombie Accounts:** Primary AD is disabled, but "Shadow IT" accounts (Trello, specialized SaaS) often get missed because they aren't SSO-linked.
- **Audit Failure:** 6 months later, auditors ask: "Prove exactly when Dave lost access." The logs are messy and scattered.

**Business Impact:**
- **Financial:** Risk of IP theft (huge potential loss). Paying for unused licenses.
- **Operational:** scrambling to "lock everything down" manually is stressful and error-prone.
- **Security:** High-risk vulnerability (Insider Threat).

## 2. The Cure (With Nexus)
**The Nexus Approach:**
The "Kill-Switch" is a deterministic, automated protocol. The moment the "Terminated" event appears in the HRIS (or is triggered manually by an authorized HR/Legal officer), Nexus executes a synchronized lockdown across *all* connected systems instantly.

**Key Features Used:**
- **Universal API Integration:** Connects to AD, Salesforce, GitHub, Slack, and AWS simultaneously.
- **Audit Logging:** Records the exact timestamp of every revocation for compliance.
- **Orchestration Speed:** Reduces "Time to Revoke" from hours to seconds.

## 3. Implementation Logic
### Trigger
**Event:** `Employee.Status` -> `Terminated` OR `Manual Kill-Switch Activation`.
**Source System:** HRIS or Nexus Command Center (Security Persona).

### Intelligence (The "Brain")
**Context Gathered:**
- **Risk Level:** Is this "Voluntary Resignation" (Low) or "Involuntary/Hostile" (High)?
- **Access Map:** Query Ontology for "What did Dave have access to?" (Returns: AWS accounts, Salesforce, Slack channels).

**Decision Logic:**
- IF `Risk` == `High`: **Revoke All Immediately** + **Wipe Mobile Device**.
- IF `Risk` == `Low`: Disable access at close of business (COB).

### Actions Taken
1. **Identity Freeze:** Disable Okta/AD account (kills SSO).
2. **Session Termination:** Force logout on all active web sessions (Slack, Salesforce).
3. **Key Revocation:** Rotate/Disable API keys in AWS/GitHub.
4. **Log & Notify:** Create a "Termination Report" artifact for HR/Legal confirming "Access Revoked at 14:02:05".

## 4. Step-by-Step Walkthrough
1. **User Action:** HR clicks **"Execute Kill-Switch"** on Dave's profile in Nexus.
2. **Nexus Detection:** Authenticates the high-privilege request.
3. **Execution:**
   - **[ServiceNow]:** Create "Term Offboarding" ticket.
   - **[Identity]:** Set Account Status = Disabled.
   - **[SaaS]:** API calls to Salesforce (`DeactivateUser`), Slack (`DisableUser`).
4. **Outcome:** Dave's screens go black/session expired immediately. Security team gets green "Secured" confirmation.

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 03: Offboarding Kill-Switch**.
2. Select Active User: "Dave (Sales)".
3. Toggle mode: "Immediate Termination".
4. Click **Execute**.
5. Observe:
   - User status flips to "Terminated" in TeslaState.
   - "Access Diff" log appears showing 5/5 systems revoked.
   - Final status: **"User Isolation Complete"**.

**Success Criteria:**
- [ ] All connected accounts disable instantly.
- [ ] Audit log is generated.
- [ ] Admin receives confirmation of success.
