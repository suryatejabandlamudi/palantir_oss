# Pain Point 11: Competitor Counter-Offer

## 1. The Pain (Before Nexus)
**Scenario:**
A Sales Rep is closing a $200k deal. The customer calls: "Cyberdyne Systems just offered us a similar package for 12% less. Match it by 5 PM or we sign with them."
The Rep emails the Deal Desk. The Deal Desk manager is in a meeting. Finance needs to approve any discount > 10%.
5 PM comes and goes. The approval comes the next morning at 9 AM.
The customer has already signed with Cyberdyne.

**Friction Points:**
- **Serial Approval Chains:** Request -> Manager -> Finance -> Reply. Linear time kills deals.
- **Lack of Context:** Approvers see "12%" but not "Strategic Account" or "Customer Lifetime Value".
- **Blind Pricing:** Reps guess the discount instead of knowing the "Walk-Away" price.

**Business Impact:**
- **Financial:** Lost Revenue (Deal Size).
- **Strategic:** Market Share loss to key competitor.
- **Human:** Sales rep demoralization.

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS treats "Competitive Threat" as a high-velocity event. It calculates the "Safe Zone" for discounts instantly based on pre-defined margins and customer value. If the counter-offer is within the Safe Zone, it auto-approves. If slightly outside, it pages the VP of Sales immediately with a "One-Click Approve" button.

**Key Features Used:**
- **Algorithmic Pricing:** CRM (Deal Value) + ERP (Cost Basis) = Real-time Margin.
- **Competitor Intelligence:** Tracks "Cyberdyne" win/loss ratios to suggest aggressive/preservative strategies.
- **Orchestrated Action:** Generates the new Quote PDF instantly upon approval.

## 3. Implementation Logic
### Trigger
**Event:** `Deal.Stage` == `Negotiation` AND `Competitor` added OR `Discount` requested.
**Source System:** Salesforce / CRM.

### Intelligence (The "Brain")
**Context Gathered:**
- **Deal Size:** $200k.
- **Cost:** $80k. (Margin = 60%).
- **Competitor:** Cyberdyne (Aggressive).
- **Request:** 12% Discount.

**Decision Logic:**
- **Metric:** New Margin = $200k * 0.88 - $80k = $96k (48%).
- **Policy:** "Auto-Approve if Margin > 45%".
- **Result:** **AUTO-APPROVE**.

### Actions Taken
1. **Calculate Impact:** Verify margin safety.
2. **Auto-Approve:** Bypass human Deal Desk for safe bets.
3. **Generate Quote:** Create PDF with new terms.
4. **Notify Rep:** "Counter-offer approved. Document ready to send."

## 4. Step-by-Step Walkthrough
1. **User Action:** Rep clicks "Competitor Counter" button in Nexus CRM. Inputs: "Cyberdyne", "12% drop".
2. **Nexus Detection:** "Competitor Threat Analysis initiated."
3. **Agent Reasoning:** "margin remains healthy (48%). Strategic account. Auto-approving to block competitor."
4. **Execution:**
   - Updates CRM Deal.
   - Generates Quote #Q-992.
   - Emails Rep: "Go get 'em."
5. **Outcome:** Rep sends the quote at 2:05 PM. Deal saved.

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 11: Competitor Counter-Offer**.
2. Simulate Deal: $500k. Cost: $200k.
3. Simulate Threat: "15% discount".
4. Click **Analyze**.
5. Observe:
   - "Margin Calculation" shows healthy profit.
   - Status: "Green - Auto-Approved".
   - "Quote Generation" detected.
6. Simulate "30% discount" (Unsafe).
   - Status: "Red - VP Approval Required".

**Success Criteria:**
- [ ] Correctly calculates real-time margin.
- [ ] Applies Policy Rules (Auto-Approve vs. Escalate).
- [ ] Generates artifact (Quote).
