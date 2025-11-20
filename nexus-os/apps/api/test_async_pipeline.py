import requests
import time
import auth

API_URL = "http://127.0.0.1:8002"

def test_async_pipeline():
    print("--- Testing Async Pipeline ---")
    
    # 1. Login
    print("Logging in...")
    resp = requests.post(f"{API_URL}/token", data={"username": "admin", "password": "palantir"})
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Pipeline
    print("Creating pipeline...")
    pipeline_data = {
        "title": "Async Test Pipeline",
        "code": """
def transform(inputs, conn):
    print("Running inside Celery Worker!")
    import pandas as pd
    # Create dummy data
    df = pd.DataFrame({"id": ["1", "2"], "value": [100, 200]})
    return df
""",
        "input_object_types": [],
        "output_object_type_id": "test-output-id" # Mock ID
    }
    resp = requests.post(f"{API_URL}/pipelines", json=pipeline_data, headers=headers)
    if resp.status_code != 200:
        print(f"Create pipeline failed: {resp.text}")
        return
    pipeline_id = resp.json()["id"]
    print(f"Pipeline created: {pipeline_id}")
    
    # 3. Run Pipeline
    print("Triggering run...")
    resp = requests.post(f"{API_URL}/pipelines/{pipeline_id}/run", headers=headers)
    if resp.status_code != 200:
        print(f"Run failed: {resp.text}")
        return
    run_id = resp.json()["id"]
    print(f"Run triggered: {run_id} (Status: {resp.json()['status']})")
    
    # 4. Poll for Completion
    print("Polling for completion...")
    for _ in range(10):
        time.sleep(1)
        resp = requests.get(f"{API_URL}/pipelines/{pipeline_id}/runs", headers=headers)
        runs = resp.json()
        current_run = next(r for r in runs if r["id"] == run_id)
        print(f"Status: {current_run['status']}")
        if current_run["status"] in ["COMPLETED", "FAILED"]:
            print(f"Final Status: {current_run['status']}")
            print(f"Logs: {current_run.get('logs', 'No logs')}")
            break

if __name__ == "__main__":
    test_async_pipeline()
