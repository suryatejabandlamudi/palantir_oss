from typing import List, Dict, Any
from agent.tools import ToolRegistry
from agent.llm import GeminiClient

class Agent:
    """
    A simple ReAct-style agent that uses the ToolRegistry.
    Note: In a full production setup, this would be replaced by a LangGraph
    workflow with a real LLM (OpenAI/Anthropic).
    
    For this demonstration, we will simulate the LLM's decision making 
    based on keyword matching to show the integration flow.
    """

    def __init__(self):
        self.registry = ToolRegistry()
        self.history = []
        # Initialize Gemini Client (requires GEMINI_API_KEY env var)
        try:
            self.llm = GeminiClient()
        except ValueError:
            print("WARNING: GEMINI_API_KEY not found. Agent will fail if run.")
            self.llm = None

    def run(self, user_query: str) -> str:
        print(f"--- Agent received query: {user_query} ---")
        self.history.append({"role": "user", "content": user_query})

        try:
            if not self.llm:
                return "Error: Gemini API Key not configured. Please set GEMINI_API_KEY environment variable."

            # 1. Get tools
            tools_def = self.registry.get_all_tool_definitions()
            
            # 2. Call LLM
            print("-> Calling Gemini API...")
            response = self.llm.generate_response(self.history, tools_def)
            
            # 3. Handle Tool Calls
            if response.get("tool_calls"):
                for tool_call in response["tool_calls"]:
                    tool_name = tool_call["name"]
                    tool_args = tool_call["arguments"]
                    
                    print(f"-> Gemini decided to call: {tool_name} with {tool_args}")
                    
                    try:
                        tool_result = self.registry.execute_tool(tool_name, **tool_args)
                        print(f"<- Tool Result: {json.dumps(tool_result, indent=2)}")
                        
                        # Add tool result to history (simplified for this demo)
                        # In a real chat loop, we'd feed this back to the LLM for a final answer.
                        # For now, we just return the result string.
                        return f"Executed {tool_name}. Result: {str(tool_result)[:200]}..."
                    except Exception as e:
                        return f"Error executing tool {tool_name}: {e}"
            
            # 4. Handle Text Response
            if response.get("content"):
                return response["content"]
            
            return "No response from Gemini."

        except Exception as e:
            return f"Agent Error: {e}"
