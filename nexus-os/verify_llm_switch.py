import sys
import os
from unittest.mock import patch

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from agent.llm import get_llm_client, GeminiClient, OllamaClient
from core.config import config

def verify_llm_switch():
    print("Verifying LLM Switch Logic...")
    
    # Set dummy key for instantiation
    os.environ["GEMINI_API_KEY"] = "dummy_key"

    # Test Default (Gemini)
    print("\nTesting Default (Gemini):")
    config.LLM_PROVIDER = "gemini"
    client = get_llm_client()
    if isinstance(client, GeminiClient):
        print("SUCCESS: Returned GeminiClient")
    else:
        print(f"FAILED: Returned {type(client)}")

    # Test Ollama
    print("\nTesting Ollama:")
    config.LLM_PROVIDER = "ollama"
    client = get_llm_client()
    if isinstance(client, OllamaClient):
        print("SUCCESS: Returned OllamaClient")
    else:
        print(f"FAILED: Returned {type(client)}")

if __name__ == "__main__":
    verify_llm_switch()
