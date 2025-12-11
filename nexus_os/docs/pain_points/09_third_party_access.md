# Pain Point 9: Third-Party Access Monitor

## 1. The Pain (Before Nexus)
**Scenario:**
A vendor ("SecureOps Support") needed access to a production server to fix a database issue 6 months ago. IT created a VPN account `vendor_secureops` and enabled it.
The issue was fixed in 2 days.
Today, that account is still active. The password hasn't been changed. The vendor employee usage is unmonitored. This is a "Backdoor" waiting to be found. 
(Target 2013 Breach: HVAC vendor credentials were the entry point).

**Friction Points:**
- **Set-and-Forget:** No "Time To Live" (TTL) on accounts.
- **Invisible Users:** Vendor accounts often sit outside the main HRIS cycle.
- **No Ownership:** "Who is the internal sponsor for this vendor account?" "I think he left last year."

**Business Impact:**
- **Security:** Major attack surface.
- **Compliance:** Failing SOC2/ISO audits for "Access Review."
- **Operational:** Difficulty in attributing actions ("Who did this change? Oh, the shared vendor account").

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS implements "Just-In-Time" (JIT) or "Leased" access for third parties. It continuously scans for *stale* vendor accounts. If an account is open but unused, or open past its intended window, Nexus flagged it for revocation.

**Key Features Used:**
- **Access Ontology:** Ties `VendorAccount` -> `InternalSponsor` -> `ContractEndDate`.
- **Usage Analytics:** Monitors "Last Login" and "Activity".
- **expiration Logic:** Enforces discrete end-dates for all external access.

## 3. Implementation Logic
### Trigger
**Event:** `Schedule: Daily Access Review` OR `Account Inactivity > 30 Days`.
**Source System:** IDP (Okta/Active Directory).

### Intelligence (The "Brain")
**Context Gathered:**
- **Account Type:** Vendor / External.
- **Last Active:** 45 days ago.
- **Sponsor:** `Internal_User_A`.
- **Contract Status:** Active.

**Decision Logic:**
- IF `Type` == `Vendor` AND `Inactive` > 30 days -> **Suggestion: Disable**.
- IF `Sponsor` is `Terminated` -> **Risk: Orphaned Account**.
- Action: "Revoke" or "Re-certify".

### Actions Taken
1. **Identify Stale Accounts:** Query list of vendor users with no login > 30 days.
2. **Notify Sponsor:** Email/Slack the internal employee: "The account `vendor_bob` hasn't been used in a month. Do they still need it?"
3. **Auto-expire:** If no response in 3 days -> **Disable Account**.
4. **Renewal:** If "Yes", requires setting a new end-date.

## 4. Step-by-Step Walkthrough
1. **System Event:** Daily Job runs. Finds `vendor_hvac` account inactive for 90 days.
2. **Nexus Detection:** "Stale External Access Detected."
3. **Agent Reasoning:** "Standard Policy: Vendor accounts disable after 30 days inactivity. Flagging for review."
4. **Execution:**
   - Creates review task: "Access Verification: vendor_hvac".
   - Pings Sponsor: "Please certify this access."
5. **Outcome:** Sponsor realizes the project ended. Clicks "Revoke". Account deleted. Attack surface reduced.

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 09: Third-Party Access Monitor**.
2. Simulate Accounts:
   - `Vendor_A`: Active yesterday.
   - `Vendor_B`: Active 60 days ago.
3. Click **Run Audit**.
4. Observe:
   - `Vendor_A`: Marked "Healthy".
   - `Vendor_B`: Marked "Stale - At Risk".
5. Action: Select `Vendor_B` -> Click **Revoke Access**.
6. Verify status updates to "Disabled".

**Success Criteria:**
- [ ] Correctly filters accounts by inactivity threshold.
- [ ] Identifies external/vendor accounts specifically.
- [ ] Allows immediate revocation action.
