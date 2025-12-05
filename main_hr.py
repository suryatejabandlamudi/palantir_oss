from agent.hr_agent import HRAgent

def main():
    print("Initializing Enterprise Process Brain - HR Attrition Radar...")
    agent = HRAgent()
    
    prompt = "Flag teams with >2σ burnout from Outlook/Teams cadence + Workday PTO anomalies; draft outreach."
    
    print(f"\n>>> HR DASHBOARD: Executing Prompt <<<\n'{prompt}'")
    agent.run(prompt)

if __name__ == "__main__":
    main()
