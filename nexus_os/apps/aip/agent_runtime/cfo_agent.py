from typing import Dict, Any, List
from nexus_os.core.integrations.erp.sap import SAPConnector
from nexus_os.core.integrations.crm.salesforce import SalesforceConnector
from nexus_os.apps.aip.agent_runtime.llm import GeminiClient
import json
import datetime

class CFOAgent:
    def __init__(self):
        self.sap = SAPConnector()
        self.sfdc = SalesforceConnector()
        self.llm = GeminiClient()
        
        # Aggregate tools
        self.tools = []
        self.tools.extend(self.sap.get_tools())
        self.tools.extend(self.sfdc.get_tools())
        
        # Map tool names to functions
        self.tool_map = {
            "sap_get_ar_aging": self.sap.execute_tool,
            "sap_get_ap_aging": self.sap.execute_tool,
            "crm_get_commit_forecast": self.sfdc.execute_tool
        }

    def run(self, prompt: str) -> Dict[str, Any]:
        logs = []
        logs.append(f"--- CFO Agent Received Prompt: {prompt} ---")
        
        history = [
            {
                "role": "user", 
                "content": f"""
                You are the CFO Cash-Conversion Cockpit Agent.
                User Request: {prompt}
                
                Your goal is to:
                1. Analyze the cash position by checking AR (Receivables) and AP (Payables).
                2. Check the Sales Commit Forecast to see incoming cash.
                3. Calculate the net cash trough for the next 14 days.
                4. Propose vendor payment deferrals if needed.
                
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
