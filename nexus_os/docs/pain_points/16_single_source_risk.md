# Pain Point 16: Single-Source Risk

## 1. The Pain (Before Nexus)
**Scenario:**
A procurement manager buys "Microchip-X" from "Supplier A" because they are 1 cent cheaper.
"Supplier A" has a factory fire.
Suddenly, production lines stop. The company scours the globe for a backup, but "Supplier B" has a 12-week lead time.
The company misses Q4 revenue targets because of a $0.01 part.

**Friction Points:**
- **Invisibility:** The "Single Source" risk is buried in a BOM (Bill of Materials) spreadsheet with 10,000 lines.
- **Reactive:** No one looks for a backup until the primary fails.
- **Siloed:** Engineering specs the part; Procurement buys it. They don't talk about "Resilience".

**Business Impact:**
- **Financial:** Revenue Halt (High Cost).
- **Reputational:** Unable to deliver to customers.
- **Operational:** "War Room" panic mode.

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS continuously analyzes the BOM for **Resilience Health**. It identifies parts that have `SourceCount == 1`. It calculates the "Revenue at Risk" attached to that part. It proactively tasks Procurement to "Qualify a Second Source" *before* a disaster happens.

**Key Features Used:**
- **BOM Graph:** Maps Part -> Product -> Revenue.
- **Supplier Intelligence:** Knows "Supplier A" location and risk profile.
- **Automated RFQ:** Can launch a "Request for Quote" to Supplier B automatically to start qualification.

## 3. Implementation Logic
### Trigger
**Event:** `Part.SourceCount` == 1 AND `RevenueImpact` > $1M.
**Source System:** ERP (SAP) / PLM (Windchill).

### Intelligence (The "Brain")
**Context Gathered:**
- **Part:** `Capacitor-10uf`.
- **Sources:** `[Murata]`.
- **Usage:** Used in `Flagship Product`.
- **Risk:** High (Single Point of Failure).

**Decision Logic:**
- IF `SourceCount` < 2 -> **Risk Flag**.
- Action: Create Task "Qualify Backup Supplier".
- Recommendation: "Search DigiKey for compatible alternatives."

### Actions Taken
1. **Visualize Risk:** Show the "Red Node" in the Supply Chain Graph.
2. **Quantify:** "If this part fails, we lose $50M/week."
3. **Initiate Workflow:**
   - Create Jira Ticket for Engineering: "Validate Alternative Part".
   - Create RFQ in SAP for Procurement.

## 4. Step-by-Step Walkthrough
1. **System Event:** New Product BOM imported.
2. **Nexus Detection:** "Scanning BOM for Single-Source risks..."
3. **Agent Reasoning:** "Critical Component `CPU-Z` has only 1 approved vendor. Revenue exposure is Critical."
4. **Execution:**
   - Alerts Commodity Manager.
   - Suggests 3 potential alternates based on specs.
   - Drafts qualification plan.
5. **Outcome:** Manager approves qualification of Vendor B. Risk neutralized.

## 5. Verification
**Test Case:**
1. Navigate to **Protocol 16: Single-Source Risk**.
2. Upload BOM: "Project Alpha".
3. Nexus highlights "Part-99" (Single Source).
4. Click **Analyze Impact**.
5. Observe:
   - "Revenue at Risk: $10M".
   - "Suggested Action: Qualify Alternate".
   - Click **Run Sourcing Event**.
   - Nexus simulates sending RFQs.

**Success Criteria:**
- [ ] Identifying single-source parts in a tree.
- [ ] Calculating downstream revenue impact.
- [ ] Initiating the mitigation workflow.
