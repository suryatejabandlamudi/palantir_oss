import os
import json
import requests
from typing import List, Dict, Any, Union
from nexus_os.core.config import config

class GeminiClient:
    """
    Unified Client for Google Gemini Models via Google AI Studio (API Key).
    Supports:
    - Text Generation
    - Tool Calling (Function Execution)
    """
    def __init__(self, api_key: str = None, model: str = None):
        self.mock_mode = os.environ.get("MOCK_GEMINI") == "true"
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        
        # Try to read from local file if key is not set
        if not self.api_key:
            try:
                key_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "gemini_api_key.txt")
                if os.path.exists(key_path):
                    with open(key_path, "r") as f:
                        self.api_key = f.read().strip()
                else: 
                     # Fallback check relative to project root if running from elsewhere
                     # Assuming project root is 3 levels up from this file's original location or just absolute check
                     possible_path = "/Volumes/ssd/personal_projects/palantir_oss/gemini_api_key.txt"
                     if os.path.exists(possible_path):
                         with open(possible_path, "r") as f:
                             self.api_key = f.read().strip()
            except Exception:
                pass

        # Core Intelligence: Gemini 3.0 Pro (Preview)
        self.model = model or "gemini-3-pro-preview"
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")

        # Global Enforcement: Gemini 3 is the only authorized model.
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

        self.embed_url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent"

    def generate_response(self, history: List[Dict[str, str]], tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generates a response from Gemini, handling Text and Tools.
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
                "temperature": 0.2, 
                "maxOutputTokens": 4096,
            }
        }

        if gemini_tools:
            payload["tools"] = gemini_tools

        # 4. Make Request
        # Add key as query param
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
            return {"content": f"Error connecting to AI Provider: {str(e)}", "tool_calls": []}

    def embed_content(self, text: str) -> List[float]:
        """
        Generates embeddings.
        """
        payload = {"content": {"parts": [{"text": text}]}}
        url = f"{self.embed_url}?key={self.api_key}"
        
        try:
            response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
            response.raise_for_status()
            result = response.json()
            return result["embedding"]["values"]
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return [] 

    def _convert_history(self, history: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        gemini_history = []
        system_instruction = None
        
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            content = msg["content"]
            
            if msg["role"] == "system":
                # v1beta supports system_instruction at top level, but for simplicity
                # we can prepend to first user message or handle cleanly if we restructure.
                # Let's try to handle it as 'user' role with 'System:' prefix if simplistic,
                # BUT 'generativelanguage' supports 'system_instruction' field in payload.
                # However, our generate_response payload construction above doesn't include it yet.
                # For now, map system to user to ensure it's seen.
                role = "user"
                content = f"System Instruction: {content}"
            
            parts = [{"text": content}]
            gemini_history.append({"role": role, "parts": parts})
            
        return gemini_history

    def _convert_tools(self, tools: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        function_declarations = []
        for tool in tools:
            # Check for missing description or params
            fun_decl = {
                "name": tool.get("name"),
                "description": tool.get("description", "No description provided."),
                "parameters": tool.get("parameters", {"type": "object", "properties": {}})
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
                        "arguments": fc.get("args", {})
                    })
            return result
        except Exception as e:
            print(f"Error parsing response: {e}")
            return {"content": "Error parsing AI response.", "tool_calls": []}

    def _mock_response(self, history):
        return {"content": "Mock Response (MOCK_GEMINI=true)", "tool_calls": []}


class OllamaClient:
    def __init__(self, base_url: str = None, model: str = None):
        self.base_url = base_url or config.OLLAMA_BASE_URL
        self.model = model or config.OLLAMA_MODEL
        self.api_url = f"{self.base_url}/api/chat"

    def generate_response(self, history: List[Dict[str, str]], tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {"content": "Ollama not fully configured in this simplified view.", "tool_calls": []}

    def embed_content(self, text: str) -> List[float]:
        return []

def get_llm_client():
    mock_mode = os.environ.get("MOCK_GEMINI") == "true"
    provider = os.environ.get("LLM_PROVIDER", "gemini").lower() # Default to Gemini
    
    if mock_mode or provider == "gemini":
        return GeminiClient()
    else:
        return OllamaClient()
