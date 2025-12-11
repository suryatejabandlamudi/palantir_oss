import requests
import json
import os

def verify_gemini():
    # Read the API key
    try:
        with open('gemini_api_key.txt', 'r') as f:
            api_key = f.read().strip()
    except FileNotFoundError:
        print("Error: gemini_api_key.txt not found.")
        return

    # User provided URL structure
    url = f"https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:streamGenerateContent?key={api_key}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": "Explain how AI works in a few words"
                    }
                ]
            }
        ]
    }

    print(f"Testing URL: {url.replace(api_key, 'HIDDEN_KEY')}")
    
    try:
        response = requests.post(url, headers=headers, json=data, stream=True)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("Success! Reading stream...")
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    print(f"Chunk: {decoded_line}")
        else:
            print("Failed.")
            print(f"Response Body: {response.text}")

    except Exception as e:
        print(f"Exception occurred: {e}")

if __name__ == "__main__":
    verify_gemini()
