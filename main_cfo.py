from agent.cfo_agent import CFOAgent

def main():
    print("Initializing Enterprise Process Brain - CFO Cash-Conversion Cockpit...")
    agent = CFOAgent()
    
    prompt = "Given SAP AR/AP aging and Salesforce commit, show next-14-day cash trough and 3 vendor pay-deferral options with risk."
    
    print(f"\n>>> CFO DASHBOARD: Executing Prompt <<<\n'{prompt}'")
    agent.run(prompt)

if __name__ == "__main__":
    main()
