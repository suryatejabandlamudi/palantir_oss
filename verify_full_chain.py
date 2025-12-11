import requests
import json
import time

# The exact prompts used in the Frontend Buttons
SCENARIOS = [
    {
        "name": "ERP: Supply Chain Resolution",
        "prompt": "I noticed a low stock alert for Titanium Alloy Casing. Check inventory levels for Titanium Alloy Casing (P-1002) and then create a purchase order for 50 units from Vendor VEN-999."
    },
    {
        "name": "CRM: Competitive Counter-Offer",
        "prompt": "Analyze the Cyberdyne offer compared to our proposal. Generate a counter-offer for Umbrella Corp highlighting our superior security features and match their 15% discount."
    },
    {
        "name": "ITSM: Security Containment",
        "prompt": "Security Alert: User 'jdoe' flagged for Impossible Travel. Lock the account immediately in Active Directory and scan Outlook logs for exfiltration attempts."
    }
]

def run_scenario(scenario):
    print(f"\n--- Running Scenario: {scenario['name']} ---")
    print(f"Prompt: {scenario['prompt']}\n")
    
    try:
        # Use stream=True to handle SSE
        with requests.post('http://localhost:8000/api/agent/run', json={"prompt": scenario['prompt']}, stream=True) as r:
            for line in r.iter_lines():
                if line:
                    decoded = line.decode('utf-8')
                    if decoded.startswith("data: "):
                        data = decoded[6:]
                        if data == "[DONE]": break
                        try:
                            event = json.loads(data)
                            event_type = event.get('type')
                            
                            if event_type == 'thought':
                                print(f"🤖 THOUGHT: {event.get('content')}")
                            elif event_type == 'tool_start':
                                print(f"🛠️  TOOL CALL: {event.get('tool')} ({event.get('input')})")
                            elif event_type == 'tool_end':
                                print(f"✅ TOOL RESULT: {event.get('output')}")
                            elif event_type == 'final_response':
                                print(f"🏁 FINAL: {event.get('content')}")
                                
                        except Exception as e:
                            pass
    except Exception as e:
        print(f"Error: {e}")

def main():
    for scenario in SCENARIOS:
        run_scenario(scenario)
        print("\n" + "="*50)
        time.sleep(1)

if __name__ == "__main__":
    main()
