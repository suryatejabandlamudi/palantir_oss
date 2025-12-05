from typing import Dict, Any, List
from integrations.hris.workday import WorkdayConnector
from integrations.comms.microsoft import MicrosoftGraphConnector
from agent.evidencer import Evidencer
from agent.llm import GeminiClient
import json

class HRAgent:
    def __init__(self):
        self.wd = WorkdayConnector()
        self.ms = MicrosoftGraphConnector()
        self.evidencer = Evidencer()
        self.llm = GeminiClient()
        
        self.tools = []
        self.tools.extend(self.wd.get_tools())
        self.tools.extend(self.ms.get_tools())
        self.tools.append({
            "name": "search_knowledge_base",
            "description": "Searches for HR policies.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query."}
                },
                "required": ["query"]
            }
        })
        
        self.tool_map = {
            "wd_get_team_timeoff": self.wd.execute_tool,
            "wd_notify_manager": self.wd.execute_tool,
            "ms_get_meeting_stats": self.ms.execute_tool,
            "search_knowledge_base": self.evidencer.search
        }

    def run(self, prompt: str):
        print(f"--- HR Agent Received Prompt: {prompt} ---")
        
        history = [
            {
                "role": "user", 
                "content": f"""
                You are the HR Attrition Radar Agent.
                User Request: {prompt}
                
                Your goal is to:
                1. Identify employees with high burnout risk (high meeting load + no leave).
                2. Check HR policy for intervention guidelines.
                3. Draft an outreach to the manager.
                
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
