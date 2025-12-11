from typing import Dict, Any, List
from nexus_os.core.integrations.db import db
from nexus_os.apps.aip.agent_runtime.llm import GeminiClient
import json

class SupplyChainAgent:
    def __init__(self):
        self.llm = GeminiClient()
        self.db = db
        
        self.tools = [
            {
                "name": "check_shipment_status",
                "description": "Checks the status of a shipment.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "tracking_number": {"type": "string"}
                    },
                    "required": ["tracking_number"]
                }
            },
            {
                "name": "expedite_shipment",
                "description": "Requests expedited shipping from the carrier.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "tracking_number": {"type": "string"},
                        "reason": {"type": "string"}
                    },
                    "required": ["tracking_number", "reason"]
                }
            },
            {
                "name": "resolve_stockout",
                "description": "Finds alternative suppliers for a stockout item.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "item_id": {"type": "string"},
                        "quantity": {"type": "integer"}
                    },
                    "required": ["item_id", "quantity"]
                }
            },
            {
                "name": "analyze_invoice_mismatch",
                "description": "Analyzes why an invoice doesn't match the PO (3-way match).",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "invoice_id": {"type": "string"}
                    },
                    "required": ["invoice_id"]
                }
            },
            {
                "name": "optimize_shipment_route",
                "description": "Calculates an alternative route for a delayed shipment.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "tracking_number": {"type": "string"},
                        "constraints": {"type": "string"}
                    },
                    "required": ["tracking_number"]
                }
            },
            {
                "name": "generate_compliance_pack",
                "description": "Aggregates all documents (PO, GR, Invoice, Quality Certs) for an audit.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "po_id": {"type": "string"}
                    },
                    "required": ["po_id"]
                }
            },
            {
                "name": "audit_supplier_performance",
                "description": "Audits supplier lead times and performance against SLAs.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "supplier_id": {"type": "string"},
                        "metric": {"type": "string", "enum": ["lead_time", "quality", "cost"]}
                    },
                    "required": ["supplier_id", "metric"]
                }
            }
        ]

    def check_shipment_status(self, tracking_number):
        # Mock Logic
        if tracking_number == "TRK-987654":
             return {"status": "DELAYED", "location": "Hamburg", "eta": "Unknown", "delay_reason": "Port Strike"}
        return {"status": "ON_TIME", "location": "Atlantic Ocean"}

    def expedite_shipment(self, tracking_number, reason):
        return {"status": "SUCCESS", "new_method": "Air Freight", "cost_impact": "+$5000"}

    def resolve_stockout(self, item_id, quantity):
        # Pain Point 18: Critical Spares Stockout
        return {
            "status": "PO_DRAFTED", 
            "item": item_id,
            "alternative_supplier": "FastParts Inc (2-day shipping)",
            "po_preview": f"Draft PO #8892 for {quantity} units",
            "action": "Awaiting Approval"
        }

    def analyze_invoice_mismatch(self, invoice_id):
        # Pain Point 19: 3-Way Match Auto-Resolver
        return {
            "status": "RESOLVED", 
            "invoice": invoice_id,
            "variance": "Shipping Cost ($150) missing from PO",
            "action": "Auto-coded to GL-Freight-Expense",
            "payment_status": "Released for Payment"
        }

    def optimize_shipment_route(self, tracking_number, constraints=None):
        # Pain Point 17: Shipment Re-route Planner
        return {
            "tracking_number": tracking_number,
            "disruption": "Port Strike at Hamburg",
            "original_eta": "14 Days Delayed",
            "new_route": "Air Freight via Frankfurt",
            "cost_delta": "+$1200",
            "recommendation": "APPROVE_REROUTE"
        }

    def generate_compliance_pack(self, po_id):
        # Pain Point 20: Audit Evidence Autopack
        return {
            "po_id": po_id,
            "status": "PACKAGED",
            "documents": [
                "Signed_PO.pdf",
                "Goods_Receipt_Slip.pdf",
                "Vendor_Invoice_Final.pdf",
                "Quality_Inspection_Cert.pdf"
            ],
            "download_link_secure": "https://compliant-docs.internal/pack/99812.zip"
        }

    def audit_supplier_performance(self, supplier_id, metric):
        # Pain Point 18: Supplier Lead-Time Drift
        return {
            "status": "DRIFT_DETECTED",
            "supplier": supplier_id,
            "metric": metric,
            "contracted_lead_time": "6 weeks",
            "actual_lead_time_avg": "10.5 weeks",
            "impact": "High Risk of Stockout",
            "recommendation": "Update MRP Parameters + Initiate Vendor Review"
        }
        
    def run(self, prompt: str) -> Dict[str, Any]:
        logs = []
        logs.append(f"--- Supply Chain Agent Started: {prompt} ---")
        
        history = [
            {
                "role": "user", 
                "content": f"""
                You are the Supply Chain Control Tower Agent.
                Goal: {prompt}
                
                Workflows:
                1. 'Shipment Issue': Check status. If delay/disruption, use 'optimize_shipment_route'.
                2. 'Stockout': If critical item missing, use 'resolve_stockout' to draft expedited PO.
                3. 'Invoice Pay': If blocked, use 'analyze_invoice_mismatch' to resolve variance.
                4. 'Audit': When asked for evidence, use 'generate_compliance_pack'.
                
                Optimize for speed and reliability.
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
                if name == "check_shipment_status":
                    result = self.check_shipment_status(args.get("tracking_number"))
                elif name == "expedite_shipment":
                    result = self.expedite_shipment(args.get("tracking_number"), args.get("reason"))
                elif name == "resolve_stockout":
                    result = self.resolve_stockout(args.get("item_id"), args.get("quantity"))
                elif name == "analyze_invoice_mismatch":
                    result = self.analyze_invoice_mismatch(args.get("invoice_id"))
                elif name == "optimize_shipment_route":
                    result = self.optimize_shipment_route(args.get("tracking_number"), args.get("constraints"))
                elif name == "generate_compliance_pack":
                    result = self.generate_compliance_pack(args.get("po_id"))
                elif name == "audit_supplier_performance":
                    result = self.audit_supplier_performance(args.get("supplier_id"), args.get("metric"))
                
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
