import os
import json
import requests
from typing import List, Dict, Any

class GeminiClient:
    def __init__(self, api_key: str = None, model: str = "gemini-1.5-flash"):
        self.mock_mode = os.environ.get("MOCK_GEMINI") == "true"
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        
        if not self.api_key and not self.mock_mode:
            raise ValueError("GEMINI_API_KEY environment variable not set.")
            
        self.model = model
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    def generate_response(self, history: List[Dict[str, str]], tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generates a response from the Gemini API, handling tool definitions.
        """
        if self.mock_mode:
            # Simple mock logic for verification
            last_msg = history[-1]["content"].lower()
            if "inventory" in last_msg:
                return {
                    "content": "",
                    "tool_calls": [{
                        "name": "erp_get_inventory",
                        "arguments": {"item_id": "1001"}
                    }]
                }
            elif "tool 'erp_get_inventory' returned" in last_msg:
                 return {
                    "content": "The inventory for item 1001 is 50 units.",
                    "tool_calls": []
                }
            else:
                return {
                    "content": "This is a mock response.",
                    "tool_calls": []
                }
        
        # Convert OpenAI-style history/tools to Gemini format
        contents = self._convert_history(history)
        gemini_tools = self._convert_tools(tools) if tools else None

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.0, # Deterministic for tool calling
            }
        }

        if gemini_tools:
            payload["tools"] = gemini_tools

        headers = {
            "Content-Type": "application/json"
        }
        
        url = f"{self.base_url}?key={self.api_key}"
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return self._parse_response(response.json())
        except requests.exceptions.RequestException as e:
            print(f"Error calling Gemini API: {e}")
            if e.response:
                print(f"Response: {e.response.text}")
            raise

    def _convert_history(self, history: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        gemini_history = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            parts = [{"text": msg["content"]}]
            gemini_history.append({"role": role, "parts": parts})
        return gemini_history

    def _convert_tools(self, tools: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Gemini expects function declarations in a specific format
        function_declarations = []
        for tool in tools:
            # Simple conversion from JSON schema to Gemini FunctionDeclaration
            # Note: This is a simplified mapper. Complex schemas might need more robust mapping.
            fun_decl = {
                "name": tool["name"],
                "description": tool["description"],
                "parameters": tool["parameters"]
            }
            function_declarations.append(fun_decl)
        
        return [{"function_declarations": function_declarations}]

    def _parse_response(self, response_json: Dict[str, Any]) -> Dict[str, Any]:
        try:
            candidate = response_json["candidates"][0]
            content = candidate["content"]
            parts = content.get("parts", [])
            
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
        except (KeyError, IndexError) as e:
            print(f"Error parsing Gemini response: {e}")
            return {"content": "Error parsing response", "tool_calls": []}

    def embed_content(self, text: str) -> List[float]:
        """
        Generates embeddings for the given text using Gemini.
        """
        url = f"https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key={self.api_key}"
        
        payload = {
            "model": "models/embedding-001",
            "content": {
                "parts": [{"text": text}]
            }
        }
        
        try:
            response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
            response.raise_for_status()
            result = response.json()
            return result["embedding"]["values"]
        except Exception as e:
            print(f"Error generating embedding: {e}")
            # Return a zero vector or raise, depending on resilience needs. 
            # For now, raising to be explicit.
            raise
