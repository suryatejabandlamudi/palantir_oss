# Pain Point 12: Margin Guardrails

## 1. The Pain (Before Nexus)
**Scenario:**
A Sales Rep quotes a price of $100 per unit, aiming for a 20% margin (Cost = $80).
However, the Rep is looking at "Standard Costs" in the CRM from last year.
In reality, the ERP shows that "Freight Surcharges" and "Copper Prices" have spiked. The *actual* current cost is $95.
The deal closes. The company makes $5 per unit (5% margin) instead of $20. After commissions, the deal loses money.
Finance realizes this only *after* the invoice is sent.

**Friction Points:**
- **Stale Data:** CRM price books are static; ERP costs are dynamic.
- **Disconnect:** Sales cares about Revenue; Finance cares about Margin. They use different dashboards.
- **Erosion:** Small leaks on every deal sum to massive profitability misses.

**Business Impact:**
- **Financial:** Direct Profit Erosion.
- **Strategic:** "Empty Revenue" (Growing topline but shrinking bottom line).

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS injects **Real-Time Cost Intelligence** into the quoting process. Before a quote can be drafted, Nexus queries the ERP for the *current* weighted average cost (including variances) and calculates the *true* margin. If the margin dips below the floor, the Quote is blocked or flagged.

**Key Features Used:**
- **Live ERP Query:** Fetches `Item.CurrentCost` and `Logistic.Surcharges` from SAP/Dynamics.
- **Guardrail Logic:** "Minimum Margin = 15%".
- **Feedback Loop:** Shows the Sales Rep *why* the price needs to be higher.

## 3. Implementation Logic
### Trigger
**Event:** `Quote.Draft` initiated.
**Source System:** Salesforce / CRM.

### Intelligence (The "Brain")
**Context Gathered:**
- **Product:** `Widget-X`.
- **Proposed Price:** $100.
- **ERP Cost:** $95 (Commodity spike).

**Decision Logic:**
- **Calculation:** Margin = ($100 - $95) / $100 = 5%.
- **Policy:** Min Margin = 15%.
- **Action:** Block Quote. Message: "Price is too low. Minimum price is $112 to maintain margin."

### Actions Taken
1. **Fetch Cost:** Real-time API call to ERP.
2. **Evaluate:** Compare Margin vs. Rules.
3. **Intervene:**
   - **Block:** Disable "Send to Customer" button.
   - **Educate:** Display "Cost basis increased due to Copper Surcharge".
   - **Suggest:** "Target Price: $115".

## 4. Step-by-Step Walkthrough
1. **User Action:** Rep creates quote for 1000 units @ $100.
2. **Nexus Detection:** "Pre-Quote Margin Check."
3. **Agent Reasoning:** "ERP reports cost spike. Proposed price yields 5% margin. Violates floor."
4. **Execution:**
   - UI Warning: "⚠️ MARGIN ALERT: 5%".
   - Recommendation: "Raise price to $112."
5. **Outcome:** Rep adjusts price to $112. Deal closes with healthy margin.

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 12: Margin Guardrails**.
2. Select Product: "Steel Chassis".
3. Set ERP Cost (Simulated): $90.
4. Try to Quote: $95.
5. Click **Validate**.
6. Observe:
   - "Validation Failed".
   - "Margin (5%) < Threshold (15%)".
   - "Submit" button disabled.
7. Update Quote: $110.
   - "Validation Passed".

**Success Criteria:**
- [ ] Connects to ERP cost data (simulated).
- [ ] Blocks/Flags low-margin quotes.
- [ ] Provides actionable price guidance.
