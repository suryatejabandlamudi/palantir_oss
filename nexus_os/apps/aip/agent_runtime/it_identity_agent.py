from typing import Dict, Any, List
from nexus_os.core.integrations.db import db
from nexus_os.apps.aip.agent_runtime.llm import GeminiClient
import json
from datetime import datetime

class ITIdentityAgent:
    def __init__(self):
        self.llm = GeminiClient()
        self.db = db
        
        self.tools = [
            {
                "name": "check_new_hires",
                "description": "Scans HRIS for new employees who haven't been provisioned yet.",
                "parameters": {"type": "object", "properties": {}, "required": []}
            },
            {
                "name": "check_terminations",
                "description": "Scans HRIS for terminated employees who still have active access.",
                "parameters": {"type": "object", "properties": {}, "required": []}
            },
            {
                "name": "provision_access",
                "description": "Provisions IT access for a new employee.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "employee_id": {"type": "string"},
                        "role": {"type": "string"}
                    },
                    "required": ["employee_id", "role"]
                }
            },
            {
                "name": "revoke_access",
                "description": "Revokes IT access for a terminated employee.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "employee_id": {"type": "string"}
                    },
                    "required": ["employee_id"]
                }
            },
            {
                "name": "create_risk_signal",
                "description": "Logs a risk signal for dangerous access states.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "entity_id": {"type": "string"},
                        "reason": {"type": "string"},
                        "score": {"type": "integer"}
                    },
                    "required": ["entity_id", "reason", "score"]
                }
            },
            {
                "name": "provision_access_request",
                "description": "Auto-drafts a ServiceNow access request for a user.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "role": {"type": "string"},
                        "required_bundles": {"type": "array", "items": {"type": "string"}}
                    },
                    "required": ["user_id", "role", "required_bundles"]
                }
            },
            {
                "name": "onboarding_autopilot",
                "description": "Orchestrates parallel provisioning (Identity, Device, Apps) for a new hire.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "new_hire_id": {"type": "string"}
                    },
                    "required": ["new_hire_id"]
                }
            },
            {
                "name": "terminate_user_access",
                "description": "Executes the Offboarding Kill-Switch: disables all accounts immediately.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "reason": {"type": "string"}
                    },
                    "required": ["user_id", "reason"]
                }
            },
            {
                "name": "diff_user_access",
                "description": "Compares current entitlements vs required role entitlements (Role Change).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "new_role": {"type": "string"}
                    },
                    "required": ["user_id", "new_role"]
                }
            },
            {
                "name": "detect_cmdb_drift",
                "description": "Scans for assets that are not mapped to an owner or business app.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        ]

    def check_new_hires(self):
        # Pain Point 1: Start-Day Access Preflight
        # Logic: Find employees starting in < 72h who are not provisioned.
        # Mocking a hit for "David Contractor" starting tomorrow.
        return {
            "status": "FOUND_RISK",
            "count": 1,
            "employees": [
                {"name": "David Contractor", "start_date": "Tomorrow", "missing_access": ["VPN", "Jira", "SAP"], "manager": "Surya"}
            ]
        }

    def check_terminations(self):
        employees = self.db.query("SELECT * FROM employees WHERE status='Terminated'")
        return employees

    def provision_access(self, employee_id, role):
        # Mock provision
        return {"status": "success", "message": f"Provisioned access for {employee_id} as {role} in AD/Okta."}

    def revoke_access(self, employee_id):
        # Mock revoke
        return {"status": "success", "message": f"Revoked access for {employee_id} from all systems."}

    def provision_access_request(self, user_id, role, required_bundles):
        # Pain Point 1 & 2
        return {
            "status": "SUCCESS", 
            "ticket_id": "RITM-10029", 
            "action": f"Drafted ServiceNow Request for {user_id} ({role})",
            "bundles_added": required_bundles,
            "sla_risk": "None"
        }

    def onboarding_autopilot(self, new_hire_id):
        # Pain Point 2: Parallel Provisioning
        return {
            "status": "EXECUTING",
            "tasks_started": [
                {"domain": "Identity", "status": "AD Account Created (Disabled)"},
                {"domain": "Device", "status": "Laptop Shipping Request (Req-778)"},
                {"domain": "Apps", "status": "Okta Group Assignment Pending"}
            ],
            "estimated_completion": "2 hours"
        }

    def terminate_user_access(self, user_id, reason):
        # Pain Point 3: Offboarding Kill-Switch
        return {
            "status": "TERMINATED", 
            "user": user_id,
            "actions": [
                "Disabled AD Account",
                "Revoked SalesForce Token",
                "Killed Active VPN Sessions",
                "Wiped Corporate Mobile (MDM)"
            ],
            "audit_log": "Generated access-diff-report-final.pdf"
        }

    def diff_user_access(self, user_id, new_role):
        # Pain Point 4: Role Change Access Diff
        # Mock: User moved to Sales Ops but kept Prod DB access
        return {
            "user": user_id,
            "new_role": new_role,
            "excess_privileges": ["PROD_DB_READ", "AWS_ADMIN_DEV"],
            "recommendation": "REVOKE_IMMEDIATELY"
        }

    def detect_cmdb_drift(self):
        # Pain Point 5: CMDB Drift Detector
        return {
            "status": "DRIFT_DETECTED",
            "unmapped_assets": 142,
            "critical_examples": ["server-prod-payments-04 (No Owner)", "s3-customer-logs-backup (No Cost Center)"],
            "action": "Auto-routing incidents to last known loggers."
        }

    def create_risk_signal(self, entity_id, reason, score):
        # Insert into RiskSignals (Simulated via DB or just log)
        # Since RiskSignal is in models.py (SqlAlchemy) and we are using DuckDB for mock integrations,
        # we might want to insert into DuckDB if we want to query it later in the UI mock.
        # But the UI probably mocks the data itself for now.
        # I'll just return a success message.
        return {"status": "success", "message": f"Created Risk Signal: {reason} (Score: {score}) for {entity_id}"}
        
    def run(self, prompt: str) -> Dict[str, Any]:
        logs = []
        logs.append(f"--- IT Identity Agent Started: {prompt} ---")
        
        history = [
            {
                "role": "user", 
                "content": f"""
                You are the IT Identity & Access Agent.
                Goal: {prompt}
                
                Workflows:
                1. 'Start-Day Access': If you see "Contractor" or "New Hire" starting soon, use 'check_new_hires' then 'provision_access_request'.
                2. 'Onboarding': For a full onboarding flow, use 'onboarding_autopilot'.
                3. 'Offboarding Kill-Switch': If asked to offboard/fire/terminate, use 'terminate_user_access' immediately.
                4. 'Role Change': If someone moves roles, use 'diff_user_access' to find and remove old permissions.
                5. 'CMDB Drift': If asked about unowned assets, use 'detect_cmdb_drift'.
                
                Always log a risk signal if you find an unprovisioned or unrevoked user.
                
                Use the tools provided.
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
                if name == "check_new_hires":
                    result = self.check_new_hires()
                elif name == "check_terminations":
                    result = self.check_terminations()
                elif name == "provision_access":
                    result = self.provision_access(args.get("employee_id"), args.get("role"))
                elif name == "revoke_access":
                    result = self.revoke_access(args.get("employee_id"))
                elif name == "create_risk_signal":
                    result = self.create_risk_signal(args.get("entity_id"), args.get("reason"), args.get("score"))
                elif name == "provision_access_request":
                    result = self.provision_access_request(args.get("user_id"), args.get("role"), args.get("required_bundles"))
                elif name == "onboarding_autopilot":
                    result = self.onboarding_autopilot(args.get("new_hire_id"))
                elif name == "terminate_user_access":
                    result = self.terminate_user_access(args.get("user_id"), args.get("reason"))
                elif name == "diff_user_access":
                    result = self.diff_user_access(args.get("user_id"), args.get("new_role"))
                elif name == "detect_cmdb_drift":
                    result = self.detect_cmdb_drift()
                
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
