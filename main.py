import sys
from agent.graph import Agent

def main():
    print("Initializing Palantir OSS Agent...")
    agent = Agent()
    
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        response = agent.run(query)
        print(f"\nAgent Response: {response}")
    else:
        print("Entering interactive mode. Type 'exit' to quit.")
        while True:
            query = input("\nUser: ")
            if query.lower() in ["exit", "quit"]:
                break
            response = agent.run(query)
            print(f"Agent: {response}")

if __name__ == "__main__":
    main()
