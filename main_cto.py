from agent.cto_agent import CTOAgent

def main():
    print("Initializing Enterprise Process Brain - CTO Release-Risk Gate...")
    agent = CTOAgent()
    
    prompt = "Summarize top risky changes for tonight's deploy and block those missing rollback."
    
    print(f"\n>>> CTO DASHBOARD: Executing Prompt <<<\n'{prompt}'")
    agent.run(prompt)

if __name__ == "__main__":
    main()
