import os
import sys
from nexus_os.apps.aip.agent_runtime.llm import get_llm_client, OllamaClient, GeminiClient
from core.config import config

def test_llm_switch():
    print("Testing LLM Provider Switching...")
    
    # Test Default (Ollama)
    if "LLM_PROVIDER" in os.environ:
        del os.environ["LLM_PROVIDER"]
    
    client = get_llm_client()
    print(f"Default Provider: {type(client).__name__}")
    if not isinstance(client, OllamaClient):
        print("❌ Default should be OllamaClient")
    else:
        print("✅ Default is OllamaClient")

    # Test Ollama Explicit
    os.environ["LLM_PROVIDER"] = "ollama"
    client = get_llm_client()
    print(f"Provider 'ollama': {type(client).__name__}")
    if not isinstance(client, OllamaClient):
        print("❌ Should be OllamaClient")
    else:
        print("✅ Provider 'ollama' is OllamaClient")

    # Test Gemini Explicit
    os.environ["LLM_PROVIDER"] = "gemini"
    # Mock API key to avoid init error
    os.environ["GEMINI_API_KEY"] = "dummy"
    client = get_llm_client()
    print(f"Provider 'gemini': {type(client).__name__}")
    if not isinstance(client, GeminiClient):
        print("❌ Should be GeminiClient")
    else:
        print("✅ Provider 'gemini' is GeminiClient")

if __name__ == "__main__":
    test_llm_switch()
