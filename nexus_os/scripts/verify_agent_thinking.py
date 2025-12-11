import sys
import os

# Add project root to path
sys.path.append("/Volumes/ssd/personal_projects/palantir_oss")

from nexus_os.apps.aip.agent_runtime.agent import Agent

def test_agent_thinking():
    print("--- Testing Agent Thinking ---")
    agent = Agent(
        name="AnalystAlpha",
        role="Data Analyst",
        description="You analyze business data and provide insights."
    )
    
    task = "Compare the benefits of SQL vs NoSQL for a high-traffic social media app."
    print(f"Task: {task}")
    
    response = agent.run(task)
    
    print("\n--- Response ---")
    print(response)
    print("\n--- Verification ---")
    
    if "<thinking>" in response and "</thinking>" in response:
        print("SUCCESS: Thinking tags detected.")
    else:
        print("WARNING: Thinking tags NOT detected.")

if __name__ == "__main__":
    test_agent_thinking()
