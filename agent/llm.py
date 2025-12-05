import os
import json
import requests
from typing import List, Dict, Any, Union
from core.config import config

class GeminiClient:
    def __init__(self, api_key: str = None, model: str = "gemini-1.5-flash"):
        self.mock_mode = os.environ.get("MOCK_GEMINI") == "true"
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        
        if not self.api_key and not self.mock_mode:
            # If not set, we can warn or just let it fail later if used.
            # But since we might switch providers, let's just print a warning if init fails but we might not use it.
            # Actually, let's keep it strict if this class is instantiated.
            pass
            
        self.model = model
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    def generate_response(self, history: List[Dict[str, str]], tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generates a response from the Gemini API, handling tool definitions.
        """
        if self.mock_mode:
            # Simple mock logic for verification
            last_msg = history[-1]["content"].lower()
            
            # Supply Chain Scenario
            # Check for tool results first to advance the state
            if "sap_get_orders_by_component" in last_msg:
                return {
                    "content": "Found 2 affected orders. Order SO-1001 (Apple) and SO-1002 (Tesla). The delay is 9 days. I should update the delivery dates.",
                    "tool_calls": [
                        {
                            "name": "sap_update_delivery_date",
                            "arguments": {"order_id": "SO-1001", "new_date": "2025-09-10"}
                        },
                        {
                            "name": "sap_update_delivery_date",
                            "arguments": {"order_id": "SO-1002", "new_date": "2025-09-10"}
                        }
                    ]
                }
            elif "sap_update_delivery_date" in last_msg:
                 return {
                    "content": "Delivery dates updated. Since Tesla is a strategic customer and the amount is large ($1.2M), I will create an incident ticket to track this risk.",
                    "tool_calls": [{
                        "name": "itsm_create_incident",
                        "arguments": {
                            "short_description": "Supply Chain Delay Impacting Tesla (SO-1002)",
                            "description": "Component COMP-X delay of 9 days affects Order SO-1002. Delivery date updated to 2025-09-10.",
                            "urgency": "1"
                        }
                    }]
                }
            elif "itsm_create_incident" in last_msg:
                return {
                    "content": "Incident created. All actions completed for this event.",
                    "tool_calls": []
                }
            
            # Initial Trigger
            elif "componentdeliverydelayed" in last_msg or "comp-x" in last_msg:
                return {
                    "content": "I see a delay for Component X. I need to check which orders are affected.",
                    "tool_calls": [{
                        "name": "sap_get_orders_by_component",
                        "arguments": {"component_id": "COMP-X"}
                    }]
                }

            # Original Inventory Mock
            elif "inventory" in last_msg:
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

class OllamaClient:
    def __init__(self, base_url: str = None, model: str = None):
        self.base_url = base_url or config.OLLAMA_BASE_URL
        self.model = model or config.OLLAMA_MODEL
        self.api_url = f"{self.base_url}/api/chat"

    def generate_response(self, history: List[Dict[str, str]], tools: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generates a response from the Ollama API.
        """
        # Convert history to Ollama format (same as OpenAI/Gemini for simple messages)
        # Ollama expects: [{"role": "user", "content": "..."}]
        
        payload = {
            "model": self.model,
            "messages": history,
            "stream": False,
            "options": {
                "temperature": 0.0
            }
        }
        
        # Note: Ollama tool calling support varies by model. 
        # For this implementation, we will assume the model might output JSON if instructed in system prompt.
        # Real tool calling with Ollama is model-dependent.
        
        try:
            response = requests.post(self.api_url, json=payload)
            response.raise_for_status()
            result = response.json()
            
            content = result["message"]["content"]
            
            # Basic attempt to parse tool calls if the model outputted JSON
            tool_calls = []
            try:
                # Check for code blocks
                clean_content = content.strip()
                if clean_content.startswith("```json"):
                    clean_content = clean_content[7:-3]
                elif clean_content.startswith("```"):
                    clean_content = clean_content[3:-3]
                
                parsed = json.loads(clean_content)
                if isinstance(parsed, dict) and "tool" in parsed:
                    tool_calls.append({
                        "name": parsed["tool"],
                        "arguments": parsed.get("args", {})
                    })
                    # If it was just a tool call, we might want to clear content or keep it as log
            except json.JSONDecodeError:
                pass
                
            return {
                "content": content,
                "tool_calls": tool_calls
            }
            
        except requests.exceptions.RequestException as e:
            print(f"Error calling Ollama API: {e}")
            raise

    def embed_content(self, text: str) -> List[float]:
        """
        Generates embeddings for the given text using Ollama.
        """
        url = f"{self.base_url}/api/embeddings"
        
        payload = {
            "model": self.model,
            "prompt": text
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            return result["embedding"]
        except Exception as e:
            print(f"Error generating embedding with Ollama: {e}")
            raise

def get_llm_client():
    """
    Factory function to return the configured LLM client.
    """
    provider = os.environ.get("LLM_PROVIDER", "ollama").lower()
    if provider == "ollama":
        return OllamaClient()
    else:
        return GeminiClient()
