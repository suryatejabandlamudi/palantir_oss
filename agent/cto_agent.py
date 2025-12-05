from typing import Dict, Any, List
from integrations.dev.jira import JiraConnector
from agent.evidencer import Evidencer
from agent.llm import GeminiClient
import json

class CTOAgent:
    def __init__(self):
        self.jira = JiraConnector()
        self.evidencer = Evidencer()
        self.llm = GeminiClient()
        
        self.tools = []
        self.tools.extend(self.jira.get_tools())
        # Evidencer is used directly for context injection, or we can expose it as a tool.
        # Let's expose it as a tool for the LLM to decide when to look up policy.
        self.tools.append({
            "name": "search_knowledge_base",
            "description": "Searches for internal policies, past incidents, and architectural docs.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query."}
                },
                "required": ["query"]
            }
        })
        
        self.tool_map = {
            "jira_get_risky_changes": self.jira.execute_tool,
            "jira_block_deployment": self.jira.execute_tool,
            "search_knowledge_base": self.evidencer.search
        }

    def run(self, prompt: str):
        print(f"--- CTO Agent Received Prompt: {prompt} ---")
        
        history = [
            {
                "role": "user", 
                "content": f"""
                You are the CTO Release-Risk Gate Agent.
                User Request: {prompt}
                
                Your goal is to:
                1. Identify risky changes pending deployment.
                2. Cross-reference with internal policies (using search_knowledge_base) to see if they meet requirements (e.g., rollback plans).
                3. Block any change that violates policy or has high risk without mitigation.
                
                Use the available tools.
                """
            }
        ]
        
        max_turns = 5
        for i in range(max_turns):
            print(f"\n--- Turn {i+1} ---")
            response = self.llm.generate_response(history, self.tools)
            
            content = response.get("content", "")
            if content:
                print(f"Agent: {content}")
                history.append({"role": "model", "content": content})
                
            tool_calls = response.get("tool_calls", [])
            if not tool_calls:
                print("No more actions needed.")
                break
                
            for tool_call in tool_calls:
                name = tool_call["name"]
                args = tool_call["arguments"]
                print(f"Executing Tool: {name} with args: {args}")
                
                try:
                    if name in self.tool_map:
                        if name == "search_knowledge_base":
                             # Evidencer.search takes query, n_results
                             result = self.tool_map[name](args["query"])
                        else:
                             result = self.tool_map[name](name, **args)
                    else:
                        result = f"Error: Tool {name} not found locally."
                except Exception as e:
                    result = f"Error executing {name}: {str(e)}"
                
                print(f"Tool Result: {json.dumps(result, default=str)}")
                
                history.append({
                    "role": "user",
                    "content": f"Tool '{name}' returned: {json.dumps(result, default=str)}"
                })
