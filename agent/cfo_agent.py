from typing import Dict, Any, List
from integrations.erp.sap import SAPConnector
from integrations.crm.salesforce import SalesforceConnector
from agent.llm import GeminiClient
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

    def run(self, prompt: str):
        print(f"--- CFO Agent Received Prompt: {prompt} ---")
        
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
