
import requests
import json

API_URL = "http://localhost:8000"

def test_aip_logic():
    print("🧠 Testing AIP Logic Engine...")
    
    # 1. Define a simple DAG
    # Goal: Get an input name, generate a greeting (Prompt), and create a task (Tool)
    
    graph = {
        "nodes": [
            {
                "id": "input_1",
                "type": "input",
                "config": {"key": "user_name"}
            },
            {
                "id": "prompt_1",
                "type": "prompt",
                "config": {"template": "Write a funny welcome message for {{input_1}} related to Supply Chain."}
            },
            {
                "id": "code_1",
                "type": "code",
                "config": {
                    "code": "output = inputs['prompt_1'].upper()"
                }
            },
            {
                "id": "output_1",
                "type": "output",
                "config": {"key": "final_message"}
            }
        ],
        "edges": [
            {"source": "input_1", "target": "prompt_1"},
            {"source": "prompt_1", "target": "code_1"},
            {"source": "code_1", "target": "output_1"}
        ]
    }
    
    payload = {
        "graph": graph,
        "inputs": {"user_name": "Elon Musk"}
    }
    
    try:
        response = requests.post(f"{API_URL}/aip/logic/run", json=payload)
        if response.status_code == 200:
            print("✅ AIP Logic Execution Success!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Execution Failed: {response.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_aip_logic()
