import sys
import os
import json

# Ensure we're in the right path
sys.path.append(os.getcwd())

from nexus_os.core.config import config

# Force ensure key is present (in case .env load issues)
if not os.environ.get("GEMINI_API_KEY"):
    print("⚠️  GEMINI_API_KEY not found in env, attempting to load from config...")
    os.environ["GEMINI_API_KEY"] = config.GEMINI_API_KEY or ""

from nexus_os.apps.aip.agent_runtime.llm import GeminiClient

def verify_real_llm():
    print("--- Starting Real LLM Connectivity Verification ---")
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY is missing. Cannot proceed with real verification.")
        sys.exit(1)
        
    print(f"✅ API Key detected (StartsWith: {api_key[:5]}...)")
    
    client = GeminiClient()
    if client.mock_mode:
        print("❌ Error: Client is in MOCK_MODE. Please unset MOCK_GEMINI env var.")
        sys.exit(1)
        
    print("Sending request to Google Gemini (v1beta)...")
    history = [{"role": "user", "content": "Explain the concept of 'Ontology' in 10 words or less."}]
    
    try:
        response = client.generate_response(history)
        content = response.get("content", "")
        
        if "Error" in content:
            print(f"❌ LLM Generation Failed: {content}")
            sys.exit(1)
            
        print(f"✅ LLM Response Received: '{content}'")
        print("--- Real LLM Verification Successful ---")
        
    except Exception as e:
        print(f"❌ Exception during LLM call: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_real_llm()
