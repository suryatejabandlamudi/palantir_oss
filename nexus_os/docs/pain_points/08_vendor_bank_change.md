# Pain Point 8: Vendor Bank-Change Guard

## 1. The Pain (Before Nexus)
**Scenario:**
Accounts Payable (AP) receives an email from "Acme Corp" (a trusted vendor): "Hi, we've changed our bank. Please update your records to this new IBAN for the next payment due Friday."
The email looks real (logo, signature). The AP clerk, helpful and busy, updates the Vendor Master record in the ERP.
Friday comes, $500,000 is wired.
Monday comes, the *real* Acme Corp calls: "Where is our payment?"
It was a Business Email Compromise (BEC) attack. The money is gone.

**Friction Points:**
- **Single Channel:** Requests come via email (insecure).
- **Human Trust:** Humans are engineered to be helpful, not suspicious.
- **Verification Gap:** Calling the vendor to verify is "extra work" often skipped under pressure.

**Business Impact:**
- **Financial:** Massive direct loss ($50K - $1M+).
- **Reputational:** CFO has to explain why cash controls failed.
- **Operational:** Fraud investigation freezes AP processes.

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS intercepts the process. It treats "Bank Account Change" as a **High-Risk Workflow** that *cannot* be completed by a single human action in the ERP. It enforces a "Guardrail" that requires multi-factor validation and independent verification before the record can be updated.

**Key Features Used:**
- **Fraud Detection Logic:** Analyzes the request source and context.
- **Workflow Enforcement:** Locks the ERP field (via monitoring) unless the workflow is passed.
- **Automated Verification:** Can try to verify bank details or simply force a "Call Back" protocol.

## 3. Implementation Logic
### Trigger
**Event:** `Vendor.GenericUpdate` where field `BankAccount` is modified. OR `Email` intent detected as "Update Bank".
**Source System:** ERP (SAP/Dynamics) or Email Gateway.

### Intelligence (The "Brain")
**Context Gathered:**
- **Source:** Email domain age, sender history.
- **Timing:** Just before a large scheduled payment? (Red Flag).
- **Vendor History:** Have they changed banks recently? (Unlikely).

**Decision Logic:**
- IF `Field` == `BankAccount` -> **Stop Auto-Process**.
- Triggers **Protocol: Fraud Verification**.
- Requirement: **Two-Person Rule** + **Out-of-Band Verification**.

### Actions Taken
1. **Lock Record:** Prevent ERP update. (Or flag as "Pending Approval").
2. **Assign Task:** Create "Verify Vendor Bank Change" task for a *Senior* Controller (not the clerk).
3. **Data Check:** Nexus checks the IBAN against known fraud lists (simulated).
4. **Guide User:** Display instructions: "Call Vendor at [Phone on File - NOT Check Email] to confirm."

## 4. Step-by-Step Walkthrough
1. **User Action:** AP Clerk enters new IBAN in Nexus ERP form.
2. **Nexus Detection:** "Critical Field Change Detected: Bank Details."
3. **Agent Reasoning:** "High-risk action. Triggering verification protocol. Blocking instant save."
4. **Execution:**
   - UI shows: "Change PENDING. Verification Required."
   - Nexus sends "Approval Request" to CFO/Controller.
   - Nexus instructs Clerk: "Please perform voice verification."
5. **Outcome:** A second pair of eyes reviews the change. If fraud, it's rejected. If real, approved.

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 08: Vendor Bank-Change Guard**.
2. Select Vendor: "Steelworks Inc".
3. Action: "Update Payment Details" -> Enter new IBAN.
4. Click **Submit**.
5. Observe:
   - System **Blocks** the immediate update.
   - "Fraud Risk Warning" appears.
   - "Verification Workflow" starts.
   - Simulator asks: "Did you verify via phone?"
   - Only after "Yes" + "Manager Approve" does the IBAN update.

**Success Criteria:**
- [ ] Prevents immediate data commit.
- [ ] Flags the specific high-risk field.
- [ ] Enforces multi-step approval.
