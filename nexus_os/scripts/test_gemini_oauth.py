import os
import requests
import json

def verify_gemini_oauth():
    token = "REDACTED_OAUTH_TOKEN"
    
    print("----------------------------------------------------------------")
    print("🔍 VERIFYING GEMINI CONNECTION (OAUTH BEARER TOKEN)")
    print("----------------------------------------------------------------")

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "x-goog-user-project": "palantir-oss" 
    }
    # Note: x-goog-user-project might be needed if using OAuth, but we'll try without first or with a dummy if needed.
    # Actually, often purely Bearer is enough if the token has the right scopes.

    payload = {
        "contents": [{
            "parts": [{"text": "Explain why you are ready to be an autonomous agent."}]
        }]
    }

    try:
        print(f"📡 Sending Request to {url}...")
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            print("\n✅ OAUTH CONNECTION SUCCESSFUL!")
            print("----------------------------------------------------------------")
            data = response.json()
            try:
                text = data['candidates'][0]['content']['parts'][0]['text']
                print(f"🤖 RESPONSE: \"{text.strip()[:100]}...\"")
            except:
                print(f"Response JSON: {data}")
        else:
            print(f"\n❌ REQUEST FAILED: {response.status_code}")
            print(f"Response: {response.text}")

    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    verify_gemini_oauth()
