import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from nexus_os.apps.aip.agent_runtime.secops_agent import SecOpsAgent
import json

def main():
    print("--- Verifying SecOps Agent ---")
    
    agent = SecOpsAgent()
    
    # Scenario 1: Impossible Travel
    print("\nScenario 1: Impossible Travel Detection")
    prompt1 = "User 'john.risk' just logged in from Lagos. Previous login was London 1 hour ago. Investigate."
    result1 = agent.run(prompt1)
    print(json.dumps(result1, indent=2))
    
    # Scenario 2: CVE Patching
    print("\nScenario 2: Critical Server Vulnerability")
    prompt2 = "Scan 'prod-db-server-01' for vulnerabilities and handle any critical issues."
    result2 = agent.run(prompt2)
    print(json.dumps(result2, indent=2))

if __name__ == "__main__":
    main()
