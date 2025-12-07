import requests
import time

def check_health():
    print("Checking health...")
    try:
        resp = requests.get("http://127.0.0.1:8002/docs", timeout=5)
        print(f"Status: {resp.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    time.sleep(2)
    check_health()
