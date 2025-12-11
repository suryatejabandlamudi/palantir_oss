# Pain Point 2: Onboarding Autopilot

## 1. The Pain (Before Nexus)
**Scenario:**
HR hires a new full-time employee, "Sarah." HR marks "Hired" in Workday. This should trigger a cascade of events, but in reality, it triggers... a siloed checklist.
- HR emails IT: "Sarah needs a laptop."
- HR emails Facilities: "Sarah needs a badge."
- HR emails Ops: "Sarah needs a desk."
IT images the laptop but forgets to install the specific "Financial Analysis" software Sarah needs. Facilities makes the badge but forgets to enable "Server Room" access. On Day 1, Sarah has a laptop she can't use fully and can't get into the room she works in.

**Friction Points:**
- **Fragmented Fulfillment:** Three different departments work in three different queues (ServiceNow, Jira, Email).
- **No Single Owner:** HR thinks "IT handled it." IT thinks "HR didn't specify software."
- **Checklist Fatigue:** Manual spreadsheets tracking "Did we do X?" often have missed rows.

**Business Impact:**
- **Financial:** Lost productivity, recurring IT support costs to fix "missing setup" tickets later.
- **Operational:** High friction on every single hire. Scaling is painful.
- **Human:** "Death by a thousand cuts" for the new hire trying to just do their job.

## 2. The Cure (With Nexus)
**The Nexus Approach:**
Nexus OS treats Onboarding not as a list of tasks, but as a **State Transition**: `Candidate` -> `Productive Employee`. It acts as the "General Contractor," spawning sub-tasks to IT, Facilities, and Ops, and monitoring them all on a single dashboard. It doesn't consider the job done until *all* sub-tasks are complete.

**Key Features Used:**
- **Cross-Module Orchestration:** Talks to IT (AD/Device), Facilities (Badge), and Ops (SaaS) simultaneously.
- **Ontology State Tracking:** Maintains a persistent "Onboarding Object" that links the Person, their Device, their Access, and their Badge.
- **Proactive Alerting:** "3 days to start, but Laptop is not 'Shipped'. Escalating to IT Manager."

## 3. Implementation Logic
### Trigger
**Event:** `Employee.Status` changes to `Pre-Boarding`.
**Source System:** HRIS (Workday).

### Intelligence (The "Brain")
**Context Gathered:**
- **Role Profile:** "Financial Analyst"
- **Location:** "HQ - Floor 3"
- **Standard Bundle:** Laptop Type B, Excel Advanced, Bloomberg Terminal access.

**Decision Logic:**
- Create IT Ticket: "Provision Laptop Type B + Install Bloomberg".
- Create Facility Ticket: "Badge Access: HQ Main + Finance Wing".
- Create Ops Task: "Assign Desk".
- **Monitor:** Check status every 6 hours. If any ticket > SLA, Escalated.

### Actions Taken
1. **Parallel Provisioning:** Launch workflows in all 3 systems at once.
2. **Unified Status View:** Create a "Onboarding Card" in the Manager's Nexus Dashboard showing 3/3 tasks green.
3. **Day 1 Welcome:** Send Sarah a "Ready to Go" email with all her login details and desk location.

## 4. Step-by-Step Walkthrough
1. **System Event:** User simulates "New Hire: Sarah (Finance)" in the Nexus Simulator.
2. **Nexus Detection:** "New hire profile detected. Initiating Onboarding Autopilot."
3. **Execution:**
   - **Step 1 (Identity):** Create AD Account (Simulated).
   - **Step 2 (Device):** Assign Inventory Asset `LAPTOP-992`.
   - **Step 3 (Software):** Auto-add `Bloomberg` to entitlement group.
4. **Outcome:** The "Onboarding" incident in ITSM is marked "Resolved" only when all sub-tasks confirm success.

## 5. Verification
**Test Case:**
1. Go to "Protocols" -> **Protocol 02: Onboarding Autopilot**.
2. Input: Name="Sarah Jones", Role="Finance".
3. Click **Run**.
4. Observe the flow:
   - "Creating Identity..." -> Done.
   - "Provisioning Assets..." -> Done.
   - "Assigning Permissions..." -> Done.
5. Verify the "Onboarding Progress" bar hits 100%.

**Success Criteria:**
- [ ] Identity created.
- [ ] Correct software bundle applied based on Role.
- [ ] Progress dashboard accurately reflects real-time status.
