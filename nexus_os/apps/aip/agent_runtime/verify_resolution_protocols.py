import asyncio
import json
import logging
from typing import Dict, Any
from nexus_os.apps.aip.agent_runtime.it_identity_agent import ITIdentityAgent
from nexus_os.apps.aip.agent_runtime.secops_agent import SecOpsAgent
from nexus_os.apps.aip.agent_runtime.revenue_agent import RevenueAgent
from nexus_os.apps.aip.agent_runtime.supply_chain_agent import SupplyChainAgent

# Mock the GeminiClient to avoid real API costs and ensure deterministic testing?
# Or use the real one if configured. The agents default to GeminiClient() which uses the API.
# For this verification, we want to see the AGENT call the TOOLS given a specific PROMPT.
# We will trust the LLM to pick the right tool (that's what we are verifying: the prompt engineering).

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ResolutionVerifier")

PAIN_POINTS = [
    # --- IT IDENTIY ---
    {
        "id": "P1",
        "agent": "ITIdentity",
        "prompt": "New contractor 'David Contractor' is starting tomorrow. Check if he is provisioned and if not, fix it.",
        "expected_tool": "check_new_hires"
    },
    {
        "id": "P2",
        "agent": "ITIdentity",
        "prompt": "Start the onboarding autopilot for new hire 'Alice Smith' (ID: EMP-123).",
        "expected_tool": "onboarding_autopilot"
    },
    {
        "id": "P3",
        "agent": "ITIdentity",
        "prompt": "URGENT: Offboard user 'bad_actor' immediately. They were fired for cause.",
        "expected_tool": "terminate_user_access"
    },
    {
        "id": "P4",
        "agent": "ITIdentity",
        "prompt": "User 'John Doe' moved from Sales to Engineering. Check his access for excessive privileges.",
        "expected_tool": "diff_user_access"
    },
    {
        "id": "P5",
        "agent": "ITIdentity",
        "prompt": "Scan the CMDB for unowned assets and drift.",
        "expected_tool": "detect_cmdb_drift"
    },

    # --- SECOPS ---
    {
        "id": "P6",
        "agent": "SecOps",
        "prompt": "Alert: User 'james_bond' logged in from London and Lagos within 1 hour. Investigate impossible travel.",
        "expected_tool": "check_travel_velocity"
    },
    {
        "id": "P7",
        "agent": "SecOps",
        "prompt": "New CVE-2024-9999 found on server-01. Plan the patch and deploy it.",
        "expected_tool": "deploy_patch" # or map_cve_to_owner
    },
    {
        "id": "P8",
        "agent": "SecOps",
        "prompt": "Vendor 'Acme Corp' sent a request to change their bank account number. Verify this immediately.",
        "expected_tool": "verify_bank_change"
    },
    {
        "id": "P9",
        "agent": "SecOps",
        "prompt": "Audit all third-party vendor access accounts for staleness.",
        "expected_tool": "monitor_vendor_access"
    },
    {
        "id": "P10",
        "agent": "SecOps",
        "prompt": "Incident INC-555 confirmed. Collect all evidence packages for the last 24 hours.",
        "expected_tool": "collect_incident_evidence"
    },

    # --- REVENUE ---
    {
        "id": "P11",
        "agent": "Revenue",
        "prompt": "Competitor 'Databricks' offered a lower price on Deal 'DL-123'. Analyze the competitor offer details: '$1M/year'.",
        "expected_tool": "analyze_competitor_offer"
    },
    {
        "id": "P12",
        "agent": "Revenue",
        "prompt": "Sales wants to offer 25% discount on product 'P-100'. Check if this hits our margin guardrails.",
        "expected_tool": "check_margin_impact"
    },
    {
        "id": "P13",
        "agent": "Revenue",
        "prompt": "Can we promise delivery of 500 units of SKU-999 by next Friday?",
        "expected_tool": "check_inventory_capacity"
    },
     {
        "id": "P14",
        "agent": "Revenue",
        "prompt": "Check customer 'Globex' (ID: CUST-GLOBEX) for any churn risk signals.",
        "expected_tool": "flag_churn_risk"
    },
    {
        "id": "P15",
        "agent": "Revenue",
        "prompt": "I see two accounts for 'Acme Corp'. Please resolve these duplicates.",
        "expected_tool": "resolve_duplicate_accounts"
    },

    # --- SUPPLY CHAIN ---
    {
        "id": "P16",
        "agent": "SupplyChain",
        "prompt": "Shipment TRK-987654 is delayed. Calculate an optimized re-route.",
        "expected_tool": "optimize_shipment_route"
    },
    {
        "id": "P17",
        "agent": "SupplyChain",
        "prompt": "We have a critical stockout on item 'Bearing-X'. Resolve this.",
        "expected_tool": "resolve_stockout"
    },
    {
        "id": "P18",
        "agent": "SupplyChain",
        "prompt": "Audit supplier 'HeavyMetals Inc' for lead-time drift.",
        "expected_tool": "audit_supplier_performance"
    },
    {
        "id": "P19",
        "agent": "SupplyChain",
        "prompt": "Invoice INV-2024-001 has a mismatch. Analyze and resolve it.",
        "expected_tool": "analyze_invoice_mismatch"
    },
    {
        "id": "P20",
        "agent": "SupplyChain",
        "prompt": "Auditors are here. Generate the compliance pack for PO-99812.",
        "expected_tool": "generate_compliance_pack"
    }
]

def run_verification():
    print("--- Nexus OS: Enterprise Pain Point High-Velocity Verification ---")
    
    agents = {
        "ITIdentity": ITIdentityAgent(),
        "SecOps": SecOpsAgent(),
        "Revenue": RevenueAgent(),
        "SupplyChain": SupplyChainAgent()
    }

    results = []

    for idx, point in enumerate(PAIN_POINTS):
        p_id = point["id"]
        agent_name = point["agent"]
        prompt = point["prompt"]
        expected = point["expected_tool"]

        print(f"\n[Running {p_id}] Agent: {agent_name} | Scenario: {prompt[:60]}...")
        
        agent = agents[agent_name]
        try:
            # We run the agent. It should call tools.
            # The agent.run() returns a dict with "logs" and "trace"
            response = agent.run(prompt)
            
            trace = response.get("trace", [])
            tool_found = False
            details = ""

            for turn in trace:
                for action in turn.get("actions", []):
                    tool_name = action.get("tool")
                    if tool_name == expected:
                        tool_found = True
                        details = str(action.get("result"))
                        break
                if tool_found: break
            
            if tool_found:
                print(f"✅ PASS: Tool '{expected}' called.")
                # print(f"   Result: {details[:100]}...")
                results.append({"id": p_id, "status": "PASS", "details": details})
            else:
                print(f"❌ FAIL: Expected '{expected}' but it was not called.")
                print(f"   Trace: {json.dumps(trace, indent=2)}")
                results.append({"id": p_id, "status": "FAIL"})
                
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            results.append({"id": p_id, "status": "ERROR", "error": str(e)})

    print("\n--- Final Report ---")
    passed = len([r for r in results if r["status"] == "PASS"])
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 ALL SYSTEMS GO. READY FOR DEMO.")
    else:
        print("⚠️ SOME CHECKS FAILED.")

if __name__ == "__main__":
    run_verification()
