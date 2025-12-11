import sys
import os

# Add project root to path
sys.path.append("/Volumes/ssd/personal_projects/palantir_oss")

from nexus_os.apps.aip.agent_runtime.llm import GeminiClient

def test_client():
    print("Initializing GeminiClient...")
    client = GeminiClient()
    print(f"Model: {client.model}")
    print(f"Base URL: {client.base_url}")
    print(f"API Key Present: {bool(client.api_key)}")

    history = [
        {"role": "user", "content": "Hello, are you functional? Reply with 'Yes, I am Nexus'."}
    ]

    print("Sending request...")
    response = client.generate_response(history)
    print("Response received:")
    print(response)

    if "Nexus" in response.get("content", ""):
        print("SUCCESS: Client is working.")
    else:
        print("WARNING: unexpected response content.")

if __name__ == "__main__":
    test_client()
