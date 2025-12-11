import google.generativeai as genai
import os
import requests
import sys

# New AIza key provided by user (Force Use)
api_key = "REDACTED_API_KEY"

def log(msg):
    print(msg, flush=True)

log(f"Checking available models with Key: {api_key[:10]}...")

def list_models_sdk():
    log("\n--- SDK Method ---")
    try:
        genai.configure(api_key=api_key)
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                log(f"Found: {m.name}")
    except Exception as e:
        log(f"SDK Error: {e}")

def list_models_rest():
    log("\n--- REST API Method (X-goog-api-key) ---")
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
             models = response.json().get('models', [])
             for m in models:
                 log(f"REST Found: {m['name']}")
        else:
            log(f"REST Failed: {response.status_code} {response.text}")
    except Exception as e:
        log(f"REST Exception: {e}")

if __name__ == "__main__":
    list_models_sdk()
    list_models_rest()
