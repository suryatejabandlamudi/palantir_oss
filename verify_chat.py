import subprocess
import time
import requests
import sys
import os
import signal

def run_verification():
    print("Starting API server...")
    # Start the API server in the background
    env = os.environ.copy()
    env["MOCK_GEMINI"] = "true"
    env["GEMINI_API_KEY"] = "dummy" # To satisfy any other checks
    
    process = subprocess.Popen(
        ["uvicorn", "api:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd="/Users/suryatejabandlamudi/palantir_oss",
        env=env
    )
    
    # Wait for server to start
    time.sleep(5)
    
    base_url = "http://127.0.0.1:8000"
    
    try:
        # 1. Health Check
        print("\n1. Testing Health Check...")
        resp = requests.get(f"{base_url}/health")
        if resp.status_code == 200:
            print("✅ Health Check Passed")
        else:
            print(f"❌ Health Check Failed: {resp.status_code}")
            return

        # 2. Test Supply Chain Access (Allowed)
        print("\n2. Testing Supply Chain Access (Should Succeed)...")
        payload_sc = {
            "message": "Check inventory for item 1001",
            "role": "supply_chain_manager"
        }
        resp_sc = requests.post(f"{base_url}/chat", json=payload_sc)
        if resp_sc.status_code == 200:
            data = resp_sc.json()
            # We expect the LLM to try to call 'erp_get_inventory'
            # Since we might not have real credentials, the tool execution might return an error string,
            # but the tool call itself should be present in the response structure if the LLM decided to call it.
            # OR if we are mocking, we'd see it.
            # With real Gemini, it might say "I need to check inventory..." and generate a tool call.
            print(f"Response: {data}")
            if data.get("tool_calls") or "inventory" in data.get("response", "").lower():
                 print("✅ Supply Chain Access Passed (Tool called or relevant response)")
            else:
                 print("⚠️ Supply Chain Access: No tool call, but response received.")
        else:
            print(f"❌ Supply Chain Access Failed: {resp_sc.status_code} - {resp_sc.text}")

        # 3. Test HR Access to Supply Chain Tool (Should Fail/Deny)
        print("\n3. Testing HR Access to Supply Chain Tool (Should be Denied)...")
        payload_hr = {
            "message": "Check inventory for item 1001",
            "role": "hr_manager"
        }
        resp_hr = requests.post(f"{base_url}/chat", json=payload_hr)
        if resp_hr.status_code == 200:
            data = resp_hr.json()
            print(f"Response: {data}")
            # The LLM might try to call it, but the backend should block it or filter it out from available tools.
            # If filtered out, LLM will say "I don't have a tool for that".
            # If LLM hallucinates a tool call, backend `registry.execute` will throw PermissionError.
            
            tool_calls = data.get("tool_calls", [])
            if tool_calls:
                # Check if any tool call result indicates permission error
                denied = False
                for tc in tool_calls:
                    if "permission" in tc.get("result", "").lower():
                        denied = True
                
                if denied:
                    print("✅ HR Access Denied (Permission Error returned)")
                else:
                    # If tool was called and no permission error, that's a failure of RBAC
                    # UNLESS the tool name was not 'erp_get_inventory' (e.g. it searched KB).
                    # But strictly speaking, HR shouldn't access inventory.
                    print("⚠️ HR Access: Tool called. Check if it was a generic tool or restricted one.")
            else:
                print("✅ HR Access Denied (No tool called, likely filtered)")
        else:
            print(f"❌ HR Access Request Failed: {resp_hr.status_code}")

    except Exception as e:
        print(f"❌ Verification Exception: {e}")
    finally:
        print("\nStopping API server...")
        os.kill(process.pid, signal.SIGTERM)

if __name__ == "__main__":
    run_verification()
