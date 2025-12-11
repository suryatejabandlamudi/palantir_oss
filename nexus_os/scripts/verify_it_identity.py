import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from nexus_os.apps.aip.agent_runtime.it_identity_agent import ITIdentityAgent
from nexus_os.core.integrations.db import db
import json

def main():
    print("--- Verifying IT Identity Agent ---")
    
    # 1. Setup: Ensure we have a new employee to onboard
    # Insert a fresh employee
    db.conn.execute("INSERT OR IGNORE INTO employees VALUES ('EMP-NEW-001', 'Alice Green', 'alice@example.com', 'Marketing', 'London', 'Analyst', 'Active', '2024-12-01', NULL)")
    
    agent = ITIdentityAgent()
    
    # 2. Run Scenario: Onboarding
    prompt = "I see a new employee Alice Green started recently. Please onboard her."
    print(f"\nPrompt: {prompt}")
    
    result = agent.run(prompt)
    
    print("\n--- Execution Result ---")
    print(json.dumps(result, indent=2))
    
    # 3. Verify: Check if 'provision_access' was called
    trace = result.get("trace", [])
    provisioned = False
    for turn in trace:
        for action in turn.get("actions", []):
            if action["tool"] == "provision_access" and "Alice Green" in str(action):
                 provisioned = True
            # Or check arguments
            if action["tool"] == "provision_access" and action["args"].get("employee_id") == "EMP-NEW-001":
                 provisioned = True

    if provisioned:
        print("\nSUCCESS: Alice Green was provisioned.")
    else:
        print("\nWARNING: distinct provision_access call for Alice Green not found (AI might have skipped or failed).Check logs.")

if __name__ == "__main__":
    main()
