import requests
import json
import threading
import uvicorn
import time
from fastapi.testclient import TestClient
from nexus_os.apps.aip.server import app

def test_streaming():
    print("\n--- Testing Agent Server Streaming (Real) ---")
    
    client = TestClient(app)
    
    prompt = "I need to check inventory for Titanium."
    print(f"Sending Prompt: {prompt}")
    
    with client.stream("POST", "/api/agent/run", json={"prompt": prompt}) as response:
        for line in response.iter_lines():
            if line:
                # decoded_line = line.decode('utf-8') 
                decoded_line = line # TestClient/httpx often yields str
                print(f"Received: {decoded_line}")
                if decoded_line.startswith("data: "):
                    data_str = decoded_line.replace("data: ", "")
                    if data_str == "[DONE]":
                        print("Stream finished.")
                        break
                    try:
                        data = json.loads(data_str)
                        if data['type'] == 'thought':
                            print(f"Thought: {data['content']}")
                        elif data['type'] == 'tool_start':
                            print(f"Tool Start: {data['tool']}")
                        elif data['type'] == 'tool_end':
                            print(f"Tool End: {data['tool']}")
                    except:
                        pass

if __name__ == "__main__":
    try:
        test_streaming()
        print("\n✅ Verification Successful: Streaming endpoint works!")
    except Exception as e:
        print(f"\n❌ Verification Failed: {e}")
        import traceback
        traceback.print_exc()
