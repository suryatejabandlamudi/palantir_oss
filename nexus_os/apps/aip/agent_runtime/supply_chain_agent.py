from typing import Dict, Any, List
from nexus_os.core.integrations.erp.sap import SAPConnector
from nexus_os.core.integrations.itsm.client import ITSMConnector
from nexus_os.core.integrations.crm.salesforce import SalesforceConnector
from nexus_os.apps.aip.agent_runtime.llm import GeminiClient
import json
import datetime

class SupplyChainAgent:
    def __init__(self):
        self.sap = SAPConnector()
        self.itsm = ITSMConnector()
        self.sfdc = SalesforceConnector()
        self.llm = GeminiClient()
        
        # Aggregate tools
        self.tools = []
        self.tools.extend(self.sap.get_tools())
        self.tools.extend(self.itsm.get_tools())
        self.tools.extend(self.sfdc.get_tools())
        
        # Map tool names to functions for execution
        self.tool_map = {
            "sap_get_orders_by_component": self.sap.execute_tool,
            "sap_update_delivery_date": self.sap.execute_tool,
            "sap_get_shipment_details": self.sap.execute_tool,
            "itsm_create_incident": self.itsm.execute_tool,
            "itsm_get_ticket_status": self.itsm.execute_tool,
            "crm_get_account_details": self.sfdc.execute_tool,
            "crm_get_commit_forecast": self.sfdc.execute_tool
        }

    def run(self, event: Dict[str, Any]) -> Dict[str, Any]:
        logs = []
        logs.append(f"--- Supply Chain Agent Received Event: {event['event_type']} ---")
        logs.append(f"Payload: {json.dumps(event['payload'], indent=2)}")
        
        # Construct initial prompt
        history = [
            {
                "role": "user", 
                "content": f"""
                You are the Supply Chain Exception Agent. 
                An event has occurred: {event['event_type']}.
                Details: {json.dumps(event['payload'])}.
                
                Your goal is to:
                1. Analyze the impact of this event.
                2. If it's a delay, find affected orders.
                3. Update delivery dates if needed.
                4. Create an incident ticket if the impact is high (e.g., strategic customer or large amount).
                
                Use the available tools to gather information and take action.
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
                
                # Execute tool
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
                
                # Add result to history
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
