# Pain Point 17: Tariff Impact Simulator

## 1. The Pain (Before Nexus)
**Scenario:**
News breaks: "New 25% Tariff on Aluminum imports from Country X."
The CFO asks: "How does this hit our bottom line?"
The Supply Chain team spends 3 weeks pulling data: "Which parts are aluminum?" "Which come from Country X?" "What is the HTS Code?" "What is the incoterm?"
By the time they answer ("It's a $5M hit"), the stock price has already reacted, and it's too late to hedge.

**Friction Points:**
- **Data Gap:** HTS Codes (Customs data) lives in the Logistics system; Cost data lives in ERP; Bill of Materials lives in PLM.
- **Complexity:** A product has 2,000 parts. Tracing the origin of each is manual hell.
- **Latency:** Simulation takes weeks, not minutes.

**Business Impact:**
- **Financial:** Unexpected margin collapse.
- **Strategic:** Inability to pivot supply chain quickly.

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS houses the "Digital Twin" of the Supply Chain. It links `Part` -> `Country of Origin` -> `Material Composition`. When a Tariff variable changes, Nexus runs a **Monte Carlo Simulation** across the entire graph instantly. "If Aluminum +25% -> Product Cost +$12."

**Key Features Used:**
- **Graph Traversal:** Explodes the BOM to finding all affected nodes.
- **Landed Cost Engine:** Calculates Duty + Freight + Base Cost.
- **Scenario Planning:** Allows "What-If" toggles (e.g., "What if we switch to Vietnam?").

## 3. Implementation Logic
### Trigger
**Event:** `GlobalMacro.TariffChange` OR `User.RunSimulation`.
**Source System:** External Feed / User Input.

### Intelligence (The "Brain")
**Context Gathered:**
- **Policy:** "Section 301 Tariff: +25% on Steel from China."
- **Inventory:** 50,000 units on water.
- **Contracts:** Supplier Y (China) vs Supplier Z (Mexico).

**Decision Logic:**
- **Scan:** Find all parts with `Material=Steel` AND `Origin=CN`.
- **Compute:** New Cost = Old Cost * 1.25.
- **Aggregate:** Impact = Sum(Delta * AnnualVolume).
- **Recommendation:** "Switch purchase orders to Mexico Supplier Z."

### Actions Taken
1. **Impact Report:** Generate Dashboard: "Financial Impact: $4.2M / Quarter".
2. **Part Identification:** List specific affected SKUs.
3. **Optimized Sourcing:** Suggest moving volume to non-tariff countries.

## 4. Step-by-Step Walkthrough
1. **User Action:** User inputs "Scenario: China Tariff +25%".
2. **Nexus Detection:** "Simulating impact on 15 active products."
3. **Execution:**
   - Result: "Model 3 profitability drops by 8%."
   - Recommendation: "Trigger Clause 4.2 in contract to renegotiate DDP terms."
4. **Outcome:** CFO Gets the answer in 5 minutes. Strategy shifts to diverse sourcing.

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 17: Tariff Simulator**.
2. Select Commodity: "Aluminum". Origin: "China".
3. Set Tariff: 25%.
4. Click **Run Sim**.
5. Observe:
   - "Impact: $XXX,XXX".
   - "Affected Products: [List]".
   - "Margin Erosion Graph".

**Success Criteria:**
- [ ] Accurate BOM explosion to find raw materials.
- [ ] Correct application of tariff math.
- [ ] Aggregation up to Product margins.
