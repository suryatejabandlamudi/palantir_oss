import requests
import json
import sys

URL = "http://127.0.0.1:8001/agents/simulate/security-incident"

def verify_simulation():
    print(f"Connecting to Simulation Stream: {URL}")
    try:
        with requests.get(URL, stream=True) as r:
            r.raise_for_status()
            print("Stream Connected. Reading events...")
            for line in r.iter_lines():
                if line:
                    event = json.loads(line)
                    print(f"[{event['agent']['name']}] {event['type'].upper()}: {event['content']}")
                    if event['type'] == 'complete':
                         print("✅ SUCCESS: Simulation completed successfully.")
                         return
    except Exception as e:
        print(f"❌ FAILURE: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_simulation()
