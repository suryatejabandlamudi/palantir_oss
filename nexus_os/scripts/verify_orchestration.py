import sys
import os

# Add project root to path
sys.path.append("/Volumes/ssd/personal_projects/palantir_oss")

from nexus_os.apps.aip.agent_runtime.orchestrator import Orchestrator

def test_orchestrator():
    print("--- Testing Orchestrator ---")
    orch = Orchestrator()
    
    print("Orchestrator initialized.")
    
    task = "How do I optimize a supply chain network?"
    print(f"Sending task: {task}")
    
    response = orch.process_request(task)
    
    print("\n--- Response ---")
    print(response)
    
    if "<thinking>" in response:
        print("SUCCESS: Orchestrator (Manager) is thinking.")
    else:
         print("WARNING: Logic check failed.")

if __name__ == "__main__":
    test_orchestrator()
