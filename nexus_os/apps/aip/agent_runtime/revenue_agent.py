from typing import Dict, Any, List
from nexus_os.core.integrations.db import db
from nexus_os.apps.aip.agent_runtime.llm import GeminiClient
import json

class RevenueAgent:
    def __init__(self):
        self.llm = GeminiClient()
        self.db = db
        
        self.tools = [
            {
                "name": "analyze_competitor_offer",
                "description": "Analyzes a competitor's offer string to extract price and terms.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "competitor_name": {"type": "string"},
                        "details": {"type": "string"}
                    },
                    "required": ["competitor_name", "details"]
                }
            },
            {
                "name": "check_margin_impact",
                "description": "Calculates if a proposed discount is safe based on margin guardrails.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "product_id": {"type": "string"},
                        "discount_percent": {"type": "integer"}
                    },
                    "required": ["product_id", "discount_percent"]
                }
            },
            {
                "name": "generate_counter_offer",
                "description": "Generates an approved counter-offer.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "customer_id": {"type": "string"},
                        "proposed_discount": {"type": "integer"}
                    },
                    "required": ["customer_id", "proposed_discount"]
                }
            },
            {
                "name": "flag_churn_risk",
                "description": "Flags a customer account as at-risk of churning.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "customer_id": {"type": "string"},
                        "reason": {"type": "string"}
                    },
                    "required": ["customer_id", "reason"]
                }
            },
            {
                "name": "analyze_deal_health",
                "description": "Scores a deal based on competitor pressure, relationship strength, and budget.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "deal_id": {"type": "string"}
                    },
                    "required": ["deal_id"]
                }
            },
            {
                "name": "check_inventory_capacity",
                "description": "Checks IF we can actually deliver the promised goods/services by the date.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sku": {"type": "string"},
                        "quantity": {"type": "integer"},
                        "date": {"type": "string"}
                    },
                    "required": ["sku", "quantity"]
                }
            },
            {
                "name": "resolve_duplicate_accounts",
                "description": "Identifies and merges duplicate customer accounts.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "account_name": {"type": "string"}
                    },
                    "required": ["account_name"]
                }
            },
            {
                "name": "generate_handoff_plan",
                "description": "Auto-generates a post-sale implementation plan from CRM data.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "deal_id": {"type": "string"}
                    },
                    "required": ["deal_id"]
                }
            }
        ]

    def analyze_competitor_offer(self, competitor_name, details):
        # Mock Logic: If competitor is "Databricks" or "Snowflake", we take it seriously.
        return {
            "status": "ANALYZED",
            "competitor": competitor_name,
            "detected_price": "$1M/year",
            "feature_gap": "None",
            "threat_level": "HIGH"
        }

    def check_margin_impact(self, product_id, discount_percent):
        # Mock Logic: Max discount 20%.
        if discount_percent > 20:
             return {"status": "REJECTED", "reason": "Margin falls below 40% threshold.", "max_allowed": 20}
        return {"status": "APPROVED", "impact": "Margin 55% -> 45%"}

    def generate_counter_offer(self, customer_id, proposed_discount):
        return {
            "status": "GENERATED", 
            "offer_code": "COUNTER-WIN-2024", 
            "discount": f"{proposed_discount}%", 
            "expiration": "24h"
        }

    def flag_churn_risk(self, customer_id, reason):
        # Pain Point 14: Renewal Risk Early Warning
        return {
            "status": "FLAGGED", 
            "risk_score": 85, 
            "signals": ["Support Ticket Spike (+40%)", "Executive Sponsor Left", "Usage Drop (-15%)"],
            "action": "CSM Alerted + Renewal Specialist assigned"
        }

    def analyze_deal_health(self, deal_id):
        # Pain Point 11: Competitor Counter-Offer (Context)
        return {
            "deal_id": deal_id,
            "health_score": 45,
            "competitor_pressure": "High (Competitor X offering 20% less)",
            "recommendation": "Use 'generate_counter_offer'"
        }

    def check_inventory_capacity(self, sku, quantity, date=None):
        # Pain Point 13: Promise-to-Deliver Check
        if not date:
            date = "ASAP (Earliest Possible)"

        # Mock: Out of stock for that date
        return {
            "status": "CAPACITY_CONSTRAINT",
            "sku": sku,
            "requested_date": date,
            "available_date": "2025-02-01",
            "shortfall": 500,
            "recommendation": "Do not commit. Check if 'SupplyChainAgent' can expedite."
        }

    def resolve_duplicate_accounts(self, account_name):
        # Pain Point 15: Duplicate Account Resolution
        return {
            "status": "MERGED",
            "primary_account": "Acme Corp (ID: 001)",
            "merged_accounts": ["Acme Inc (ID: 992)", "Acme Corporation (ID: 445)"],
            "crm_link": "https://salesforce.com/acct/001"
        }

    def generate_handoff_plan(self, deal_id):
        # Pain Point 16: Sales-to-Implementation Handoff
        return {
            "status": "PLAN_GENERATED",
            "project_plan": "Implementation_Acme_v1.pdf",
            "team_assigned": ["Solution Architect: Sarah", "PM: Mike"],
            "kickoff_date": "Next Tuesday"
        }
        
    def run(self, prompt: str) -> Dict[str, Any]:
        logs = []
        logs.append(f"--- Revenue Agent Started: {prompt} ---")
        
        history = [
            {
                "role": "user", 
                "content": f"""
                You are the Revenue Growth Agent.
                Goal: {prompt}
                
                Workflows:
                1. 'Counter-Offer': If deal is at risk, use 'analyze_deal_health', then 'check_margin_impact', then 'generate_counter_offer'.
                2. 'Capacity Check': If asked about delivery, stock, or capacity, ALWAYS use 'check_inventory_capacity'. If date is missing, the tool handles it.
                3. 'Churn Warning': If you see negative signals, use 'flag_churn_risk'.
                4. 'Data Hygiene': Use 'resolve_duplicate_accounts' to clean CRM.
                5. 'Sales Handoff': After win, use 'generate_handoff_plan'.
                
                Always maximize revenue but protect margins.
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
                
                result = "Error: Tool not found"
                if name == "analyze_competitor_offer":
                    result = self.analyze_competitor_offer(args.get("competitor_name"), args.get("details"))
                elif name == "check_margin_impact":
                    result = self.check_margin_impact(args.get("product_id"), args.get("discount_percent"))
                elif name == "generate_counter_offer":
                    result = self.generate_counter_offer(args.get("customer_id"), args.get("proposed_discount"))
                elif name == "flag_churn_risk":
                    result = self.flag_churn_risk(args.get("customer_id"), args.get("reason"))
                
                elif name == "check_inventory_capacity":
                    result = self.check_inventory_capacity(args.get("sku"), args.get("quantity"), args.get("date"))
                elif name == "resolve_duplicate_accounts":
                    result = self.resolve_duplicate_accounts(args.get("account_name"))
                elif name == "generate_handoff_plan":
                    result = self.generate_handoff_plan(args.get("deal_id"))
                elif name == "analyze_deal_health":
                    result = self.analyze_deal_health(args.get("deal_id"))
                
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
