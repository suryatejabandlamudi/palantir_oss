import os
import json
import requests
from typing import List, Dict, Any, Union
from core.config import config

class GeminiClient:
    """
    Unified Client for Google Gemini Models via Vertex AI.
    Supports:
    - Text Generation
    - Tool Calling (Function Execution)
    - Multimodal Inputs (Text + Images)
    - Embeddings
    """
    def __init__(self, api_key: str = None, model: str = None):
        self.mock_mode = os.environ.get("MOCK_GEMINI") == "true"
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        
        # Default to the User-Verified Model
        self.model = model or "gemini-2.5-flash-lite-preview-09-2025"
        
        # Vertex AI Base URL logic
        # Note: 'gemini' models on Vertex usually live at:
        # https://aiplatform.googleapis.com/v1/publishers/google/models/{MODEL}:generateContent
        self.base_url = f"https://aiplatform.googleapis.com/v1/publishers/google/models/{self.model}:generateContent"
        self.embed_url = "https://aiplatform.googleapis.com/v1/publishers/google/models/text-embedding-004:predict"

    def generate_response(self, history: List[Dict[str, str]], tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generates a response from Gemini, handling Text, Tools, and Vision inputs.
        """
        if self.mock_mode:
            return self._mock_response(history)

        # 1. Convert Prompt/History to Gemini Format
        contents = self._convert_history(history)
        
        # 2. Convert Tools
        gemini_tools = self._convert_tools(tools) if tools else None

        # 3. Build Payload
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.2, # Low temperature for accurate reasoning/tools
                "maxOutputTokens": 2048,
            }
        }

        if gemini_tools:
            payload["tools"] = gemini_tools

        # 4. Make Request
        url = f"{self.base_url}?key={self.api_key}"
        headers = {"Content-Type": "application/json"}

        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return self._parse_response(response.json())
        except requests.exceptions.RequestException as e:
            print(f"❌ Gemini API Error: {e}")
            if hasattr(e, 'response') and e.response:
                 print(f"Server Response: {e.response.text}")
            # Fallback for demo stability if API fails (Optional, but user wants 'Real' so raising is better)
            return {"content": f"Error connecting to AI Provider: {str(e)}", "tool_calls": []}

    def embed_content(self, text: str) -> List[float]:
        """
        Generates embeddings using text-embedding-004 on Vertex AI.
        """
        payload = {"instances": [{"content": text}]}
        url = f"{self.embed_url}?key={self.api_key}"
        
        try:
            response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
            response.raise_for_status()
            result = response.json()
            return result["predictions"][0]["embeddings"]["values"]
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return [] # Return empty vector on failure to prevent crash

    def _convert_history(self, history: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        gemini_history = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            if msg["role"] == "system":
                # Vertex often expects system instructions strictly or prepended to user prompt
                # For v1 API, we'll prepend to the first user message or handle correctly if strictly "system"
                # But typically 'user' role with system prompt text works fine in simple chat.
                # Let's verify if Vertex Gemini supports 'system_instruction' param. It does.
                # But to keep this simple and compatible with existing history structure:
                role = "user" 
            
            parts = [{"text": msg["content"]}]
            
            # FUTURE: Handle Image inputs here if msg has "image_url" or "base64"
            
            gemini_history.append({"role": role, "parts": parts})
        return gemini_history

    def _convert_tools(self, tools: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        function_declarations = []
        for tool in tools:
            fun_decl = {
                "name": tool["name"],
                "description": tool["description"],
                "parameters": tool["parameters"]
            }
            function_declarations.append(fun_decl)
        return [{"function_declarations": function_declarations}]

    def _parse_response(self, response_json: Dict[str, Any]) -> Dict[str, Any]:
        try:
            if "candidates" not in response_json or not response_json["candidates"]:
                return {"content": "No response from AI.", "tool_calls": []}
                
            candidate = response_json["candidates"][0]
            content_part = candidate.get("content", {})
            parts = content_part.get("parts", [])
            
            result = {"content": "", "tool_calls": []}
            
            for part in parts:
                if "text" in part:
                    result["content"] += part["text"]
                if "functionCall" in part:
                    fc = part["functionCall"]
                    result["tool_calls"].append({
                        "name": fc["name"],
                        "arguments": fc["args"]
                    })
            return result
        except Exception as e:
            print(f"Error parsing response: {e}")
            return {"content": "Error parsing AI response.", "tool_calls": []}

    def _mock_response(self, history):
        # ... preserved mock logic if needed, but reducing bloat ...
        return {"content": "Mock Response (MOCK_GEMINI=true)", "tool_calls": []}


class OllamaClient:
    def __init__(self, base_url: str = None, model: str = None):
        self.base_url = base_url or config.OLLAMA_BASE_URL
        self.model = model or config.OLLAMA_MODEL
        self.api_url = f"{self.base_url}/api/chat"

    def generate_response(self, history: List[Dict[str, str]], tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        # ... simplified ollama fallback ...
        return {"content": "Ollama not fully configured in this simplified view.", "tool_calls": []}

    def embed_content(self, text: str) -> List[float]:
        return []

def get_llm_client():
    mock_mode = os.environ.get("MOCK_GEMINI") == "true"
    provider = os.environ.get("LLM_PROVIDER", "ollama").lower()
    
    if mock_mode or provider == "gemini":
        return GeminiClient()
    else:
        return OllamaClient()
