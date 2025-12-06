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

    def run(self, prompt: str) -> Dict[str, Any]:
        logs = []
        logs.append(f"--- HR Agent Received Prompt: {prompt} ---")
        
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
        execution_trace = []
        
        for i in range(max_turns):
            turn_log = {"turn": i + 1, "actions": []}
            logs.append(f"\n--- Turn {i+1} ---")
            
            response = self.llm.generate_response(history, self.tools)
            
            content = response.get("content", "")
            if content:
                logs.append(f"Agent: {content}")
                turn_log["thought"] = content
                history.append({"role": "model", "content": content})
                
            tool_calls = response.get("tool_calls", [])
            if not tool_calls:
                logs.append("No more actions needed.")
                turn_log["status"] = "completed"
                execution_trace.append(turn_log)
                break
                
            for tool_call in tool_calls:
                name = tool_call["name"]
                args = tool_call["arguments"]
                logs.append(f"Executing Tool: {name} with args: {args}")
                
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
                
                logs.append(f"Tool Result: {json.dumps(result, default=str)}")
                
                turn_log["actions"].append({
                    "tool": name,
                    "args": args,
                    "result": result
                })
                
                history.append({
                    "role": "user",
                    "content": f"Tool '{name}' returned: {json.dumps(result, default=str)}"
                })
            
            execution_trace.append(turn_log)
            
        return {
            "status": "success",
            "logs": logs,
            "trace": execution_trace
        }
