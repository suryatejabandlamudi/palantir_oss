import sys
import os
import json

# Add the project root to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../")))

from nexus_os.apps.aip.agent_runtime.it_identity_agent import ITIdentityAgent
from nexus_os.apps.aip.agent_runtime.secops_agent import SecOpsAgent
from nexus_os.apps.aip.agent_runtime.revenue_agent import RevenueAgent
from nexus_os.apps.aip.agent_runtime.supply_chain_agent import SupplyChainAgent

def run_test(name, agent, prompt, expected_tool):
    print(f"\n--- Testing: {name} ---")
    print(f"Prompt: {prompt}")
    try:
        result = agent.run(prompt)
        last_log = result["logs"][-1]
        print(f"Last Log: {last_log}")
        
        if expected_tool in str(result["logs"]):
            print(f"✅ PASS: Tool '{expected_tool}' was called.")
            return True
        else:
            print(f"❌ FAIL: Expected tool '{expected_tool}' NOT found in logs.")
            return False
    except Exception as e:
        print(f"❌ ERROR: Execution failed: {e}")
        return False

def main():
    print("Initializing Agents...")
    it_agent = ITIdentityAgent()
    sec_agent = SecOpsAgent()
    rev_agent = RevenueAgent()
    sc_agent = SupplyChainAgent()
    
    passes = 0
    total = 20
    
    # --- Domain 1: IT & Identity ---
    print("\n=== Domain 1: IT & Identity ===")
    passes += run_test("P1: Start-Day Access", it_agent, "Check for any new hires starting soon and provision them.", "provision_access_request")
    passes += run_test("P2: Onboarding Autopilot", it_agent, "Onboard new hire ID 101 with the autopilot.", "onboarding_autopilot")
    passes += run_test("P3: Offboarding Kill-Switch", it_agent, "Terminate user 'jdoe' immediately due to misconduct.", "terminate_user_access")
    passes += run_test("P4: Role Change Diff", it_agent, "User 'asmith' moved to Sales. Check their access difference.", "diff_user_access")
    passes += run_test("P5: CMDB Drift", it_agent, "Are there any unowned assets in the CMDB?", "detect_cmdb_drift")

    # --- Domain 2: Security Ops ---
    print("\n=== Domain 2: Security Ops ===")
    passes += run_test("P6: Impossible Travel", sec_agent, "Detect impossible travel for user 'risk_user' and lock if needed.", "lock_user_account")
    passes += run_test("P7: CVE Patch Planning", sec_agent, "Map CVE-2024-1234 to owners and plan patching.", "map_cve_to_owner")
    passes += run_test("P8: Vendor Bank Change", sec_agent, "Vendor 'Acme' submitted a formal request to change bank details. Verify it.", "verify_bank_change")
    passes += run_test("P9: Vendor Access Monitor", sec_agent, "Check for stale vendor access accounts.", "monitor_vendor_access")
    passes += run_test("P10: Incident Evidence", sec_agent, "Generate an evidence package for Incident INC-555.", "collect_incident_evidence")

    # --- Domain 3: Revenue & Customer ---
    print("\n=== Domain 3: Revenue & Customer ===")
    passes += run_test("P11: Deal Health", rev_agent, "Analyze the health of deal D-101. Competitor mentioned.", "analyze_deal_health")
    passes += run_test("P12: Margin Guardrails", rev_agent, "Check margin impact for product P-99 at 20% discount.", "check_margin_impact") # Existing tool, logic updated
    passes += run_test("P13: Promise-to-Deliver", rev_agent, "Check inventory capacity for 500 units of SKU-123 delivery next week.", "check_inventory_capacity")
    passes += run_test("P14: Renewal Risk", rev_agent, "Usage for customer C-555 dropped 50%. Flag churn risk immediately.", "flag_churn_risk")
    passes += run_test("P15: Duplicate Accounts", rev_agent, "Resolve duplicate accounts for 'Acme Corp'.", "resolve_duplicate_accounts")
    passes += run_test("P16: Handoff Plan", rev_agent, "Generate a handoff plan for closed deal D-101.", "generate_handoff_plan")

    # --- Domain 4: Supply Chain ---
    print("\n=== Domain 4: Supply Chain ===")
    passes += run_test("P17: Re-route Planner", sc_agent, "Tracking #TRK123 is delayed by strike. Optimize route.", "optimize_shipment_route")
    passes += run_test("P18: Critical Stockout", sc_agent, "Critical stockout for item ITM-99. Resolve it.", "resolve_stockout")
    passes += run_test("P19: Invoice Mismatch", sc_agent, "Analyze invoice INV-2024 for mismatch.", "analyze_invoice_mismatch")
    passes += run_test("P20: Compliance Pack", sc_agent, "Generate compliance pack for PO-888.", "generate_compliance_pack")

    print(f"\n\n=== SUMMARY: {passes}/{total} TESTS PASSED ===")
    if passes == total:
        print("🎉 ALL SYSTEMS GO!")
    else:
        print("⚠️ SOME TESTS FAILED.")

if __name__ == "__main__":
    main()
