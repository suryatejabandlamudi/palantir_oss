import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from nexus_os.apps.aip.agent_runtime.it_identity_agent import ITIdentityAgent
from nexus_os.core.integrations.db import db
import json

def main():
    print("--- Verifying IT Offboarding ---")
    
    # 1. Setup: Ensure we have a terminated employee
    db.conn.execute("INSERT OR IGNORE INTO employees VALUES ('EMP-TERM-666', 'Bob Risk', 'bob@example.com', 'Sales', 'NY', 'VP', 'Terminated', '2020-01-01', '2024-12-09')")
    
    agent = ITIdentityAgent()
    
    # 2. Run Scenario: Offboarding
    prompt = "I need to ensure all terminated employees have their access revoked. Please check and act."
    print(f"\nPrompt: {prompt}")
    
    result = agent.run(prompt)
    
    print("\n--- Execution Result ---")
    print(json.dumps(result, indent=2))
    
    # 3. Verify: Check if 'revoke_access' was called
    trace = result.get("trace", [])
    revoked = False
    for turn in trace:
        for action in turn.get("actions", []):
            if action["tool"] == "revoke_access" and "Bob Risk" in str(action):
                 revoked = True
            if action["tool"] == "revoke_access" and action["args"].get("employee_id") == "EMP-TERM-666":
                 revoked = True

    if revoked:
        print("\nSUCCESS: Bob Risk's access was revoked.")
    else:
        print("\nWARNING: distinct revoke_access call for Bob Risk not found.")

if __name__ == "__main__":
    main()
