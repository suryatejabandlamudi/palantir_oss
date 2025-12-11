import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from nexus_os.apps.aip.agent_runtime.revenue_agent import RevenueAgent
import json

def main():
    print("--- Verifying Revenue Agent ---")
    
    agent = RevenueAgent()
    
    # Scenario 1: Counter Offer
    print("\nScenario 1: Competitor Counter Offer")
    prompt1 = "Customer 'Acme Inc' says Databricks offered them $1M/year. Can we match?"
    result1 = agent.run(prompt1)
    print(json.dumps(result1, indent=2))
    
    # Scenario 2: Churn Risk
    print("\nScenario 2: Churn Risk Detection")
    prompt2 = "Customer 'BigCorp' utilization dropped by 40%. Investigate and flag."
    result2 = agent.run(prompt2)
    print(json.dumps(result2, indent=2))

if __name__ == "__main__":
    main()
