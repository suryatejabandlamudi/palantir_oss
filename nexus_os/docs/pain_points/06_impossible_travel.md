# Pain Point 6: Impossible Travel Containment

## 1. The Pain (Before Nexus)
**Scenario:**
At 2:00 PM, an employee's credentials are used to log in from New York (their home office).
At 3:15 PM, the *same* credentials are used to log in from Bucharest, Romania.
This is physically impossible.
- **Security Analyst Fatigue:** The SOC receives thousands of alerts. This one might sit in the "Medium Priority" queue for 4 hours.
- **Slow Reaction:** By the time an analyst sees it, the attacker has already exfiltrated the customer database.
- **Manual Lockout:** The analyst has to log into Okta, find the user, and click "Suspend"—steps that take precious minutes.

**Friction Points:**
- **Alert Noise:** Real signals buried in false positives.
- **Manual Containment:** No "Auto-Pilot" for obvious threats.
- **Dwell Time:** Attackers have hours to roam free.

**Business Impact:**
- **Financial:** Cost of a data breach (Global avg: $4.45M).
- **Reputational:** "Company hacks customer data."
- **Operational:** Massive cleanup effort post-breach.

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS accepts the "Impossible Travel" signal as a deterministic trigger for *immediate* action. It doesn't ask a human to investigate; it moves to "Safe Mode" instantly. It correlates the Identity (User) with the Threat (Location mismatch) and executes a containment protocol in seconds.

**Key Features Used:**
- **Security Orchestration (SOAR):** Automates the "Detection -> Response" loop.
- **Identity Graph:** Knows "User A usually logs in from NY."
- **Active Containment:** Can write back to the Identity Provider (Okta/AD) to lock accounts programmatically.

## 3. Implementation Logic
### Trigger
**Event:** `Security.Alert: Impossible Travel` (Velocity Check Failure).
**Source System:** Azure Sentinel / Okta ThreatInsight / Splunk.

### Intelligence (The "Brain")
**Context Gathered:**
- **Login A:** 14:00 @ New York IP.
- **Login B:** 15:15 @ Bucharest IP.
- **User Role:** "Finance Director" (High Value Target).
- **Device:** Unrecognized Device for Login B.

**Decision Logic:**
- IF `Distance / Time` > `MaxSpeed (800mph)` -> **Confirmed Impossible Travel**.
- IF `User.Privilege` == `High` -> **Immediate Lockout**.
- IF `User.Privilege` == `Low` -> **Step-Up MFA (Challenge)**.

### Actions Taken
1. **Lock Account:** Call `Identity.SuspendUser(UserID)`.
2. **Key Rotation:** Revoke active sessions tokens.
3. **Notify SOC:** Create P1 Incident: "Active Account Takeover Blocked".
4. **Notify User:** SMS to verify: "Did you just try to log in from Romania?"

## 4. Step-by-Step Walkthrough
1. **System Event:** Attacker uses stolen credentials from a foreign IP.
2. **Nexus Detection:** Ingests webhook from Identity Provider flagging "Risk: High".
3. **Agent Reasoning:** "User traveled 5,000 miles in 1 hour. Physically impossible. Threat is immanent. Executing Containment Protocol."
4. **Execution:**
   - Nexus detects High Value Target.
   - Nexus suspends account.
   - Nexus opens "Security Incident #SEC-991".
5. **Outcome:** Attacker sees "Account Locked". Breach prevented.

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 06: Impossible Travel**.
2. Simulate Login 1: "User: Admin", "Location: NY", "Time: 10:00".
3. Simulate Login 2: "User: Admin", "Location: Tokyo", "Time: 10:30".
4. Click **Analyze**.
5. Observe:
   - "Velocity Violation Detected".
   - Status changes to **"Account Locked"**.
   - Incident Card appears in Gotham feed.

**Success Criteria:**
- [ ] Correctly calculates velocity violation.
- [ ] Executes immediate lockout.
- [ ] Generates high-severity incident.
