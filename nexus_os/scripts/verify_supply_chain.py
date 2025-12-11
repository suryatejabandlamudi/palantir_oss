import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from nexus_os.apps.aip.agent_runtime.supply_chain_agent import SupplyChainAgent
import json

def main():
    print("--- Verifying Supply Chain Agent ---")
    
    agent = SupplyChainAgent()
    
    # Scenario 1: Shipment Delay
    print("\nScenario 1: Shipment Delay")
    prompt1 = "Shipment TRK-987654 is stuck in Hamburg. This is critical for production next week. Fix it."
    result1 = agent.run(prompt1)
    print(json.dumps(result1, indent=2))
    
    # Scenario 2: Stockout
    print("\nScenario 2: Critical Stockout")
    prompt2 = "We are out of 'P-1002'. Production halting in 2 days. Source alternatives."
    result2 = agent.run(prompt2)
    print(json.dumps(result2, indent=2))

if __name__ == "__main__":
    main()
