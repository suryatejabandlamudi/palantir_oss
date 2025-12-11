import requests
import json
import os
import sys

# New AIza key provided by user
API_KEY = "REDACTED_API_KEY"
MODEL = "gemini-3-pro-preview"

def log(msg):
    print(msg, flush=True)

log(f"--- Verifying Gemini 3 Pro ({MODEL}) ---")
log(f"Key Prefix: {API_KEY[:10]}...")

# 1. Try Generative Language API (Standard)
url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

log(f"\nTarget URL: {url}")

data = {
    "contents": [{
        "parts": [{"text": "Hello, confirm you are Gemini 3 Pro."}]
    }]
}

# Test 1: X-goog-api-key Header (Standard for AIza keys)
log("\nTesting 'X-goog-api-key' Header...")
try:
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY
    }
    response = requests.post(url, headers=headers, json=data, timeout=10)
    
    if response.status_code == 200:
        log("SUCCESS (X-goog-api-key)!")
        log(json.dumps(response.json(), indent=2))
        exit(0)
    else:
        log(f"Failed: {response.status_code}")
        log(response.text)
except Exception as e:
    log(f"Exception: {e}")

# Test 2: Query Param (Fallback)
log("\nTesting Query Param Auth...")
try:
    url_param = f"{url}?key={API_KEY}"
    response = requests.post(url_param, headers={"Content-Type": "application/json"}, json=data, timeout=10)
    if response.status_code == 200:
        log("SUCCESS (Query Param)!")
        log(json.dumps(response.json(), indent=2))
    else:
        log(f"Failed: {response.status_code}")
        log(response.text)
except Exception as e:
    log(f"Exception: {e}")
