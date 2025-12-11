from typing import Dict, Any, List
from nexus_os.core.integrations.db import db
from nexus_os.apps.aip.agent_runtime.llm import GeminiClient
import json
from datetime import datetime

class SecOpsAgent:
    def __init__(self):
        self.llm = GeminiClient()
        self.db = db
        
        self.tools = [
            {
                "name": "check_travel_velocity",
                "description": "Analyzes login logs for impossible travel (e.g. 2 logins far apart in short time).",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "user_id": {"type": "string"}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "scan_vulnerabilities",
                "description": "Scans servers/assets for known CVEs.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "asset_id": {"type": "string"}
                    },
                    "required": ["asset_id"]
                }
            },
            {
                "name": "isolate_asset",
                "description": "Isolates a compromised asset or user account from the network.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "entity_id": {"type": "string"},
                        "reason": {"type": "string"}
                    },
                    "required": ["entity_id", "reason"]
                }
            },
            {
                "name": "deploy_patch",
                "description": "Deploys a security patch to a vulnerable asset.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "asset_id": {"type": "string"},
                        "cve_id": {"type": "string"}
                    },
                    "required": ["asset_id", "cve_id"]
                }
            },
            {
                "name": "create_risk_signal",
                "description": "Logs a high priority risk signal.",
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
                "name": "lock_user_account",
                "description": "Immediately locks a user account (Active Directory + Okta) due to security risk.",
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
                "name": "map_cve_to_owner",
                "description": "Maps a CVE to specific application owners and generates a patch plan.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "cve_id": {"type": "string"}
                    },
                    "required": ["cve_id"]
                }
            },
            {
                "name": "verify_bank_change",
                "description": "Initiates a multi-channel verification for vendor bank account changes.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "vendor_id": {"type": "string"},
                        "request_id": {"type": "string"}
                    },
                    "required": ["vendor_id"]
                }
            },
            {
                "name": "monitor_vendor_access",
                "description": "Scans for stale or unauthorized vendor access accounts.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "collect_incident_evidence",
                "description": "Aggregates logs, chat transcripts, and metrics for a specific time range.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "incident_id": {"type": "string"},
                        "time_range": {"type": "string"}
                    },
                    "required": ["incident_id"]
                }
            }
        ]

    def check_travel_velocity(self, user_id):
        # Mock Logic: Check last 2 logins.
        # If user_id has 'hacker', return anomaly.
        if "risk" in user_id.lower() or "hacker" in user_id.lower():
             return {
                 "status": "ANOMALY",
                 "details": "Login 1: London (10:00 AM), Login 2: Lagos (11:00 AM). Velocity: 3000mph",
                 "confidence": "HIGH"
             }
        return {"status": "NORMAL"}

    def scan_vulnerabilities(self, asset_id):
        # Mock Logic
        if "server" in asset_id.lower():
            return {
                "status": "VULNERABLE",
                "cves": ["CVE-2024-9999 (Critical) - Remote Code Execution"],
                "cvss_score": 9.8
            }
        return {"status": "CLEAN"}

    def isolate_asset(self, entity_id, reason):
        return {"status": "success", "message": f"Entity {entity_id} has been ISOLATED. Reason: {reason}"}

    def deploy_patch(self, asset_id, cve_id):
        return {"status": "success", "message": f"Patch for {cve_id} initiated on {asset_id}. Reboot scheduled."}

    def create_risk_signal(self, entity_id, reason, score):
        # Pain Point 6, 8, 9, 10
        # Insert into RiskSignals
        return {"status": "success", "message": f"Created Risk Signal: {reason} (Score: {score}) for {entity_id}"}

    def lock_user_account(self, user_id, reason):
        # Pain Point 6: Impossible Travel Containment
        return {
            "status": "LOCKED",
            "account": user_id,
            "actions": ["Okta Session Revoked", "AD Account Disabled", "MFA Tokens Reset"],
            "reason": reason
        }

    def map_cve_to_owner(self, cve_id):
        # Pain Point 7: CVE Patch Planning
        # Mock: Log4j vulnerability
        return {
            "cve": cve_id,
            "impacted_assets": 12,
            "owners": ["PaymentTeam (Jane Doe)", "LegacyOps (John Smith)"],
            "patch_plan_id": "PLAN-CVE-2024-9999",
            "sla_deadline": "24 hours"
        }

    def verify_bank_change(self, vendor_id, request_id=None):
        # Pain Point 8: Vendor Bank-Change Guard
        # Mock: 2-Channel Verification
        if not request_id:
            request_id = f"REQ-{datetime.now().strftime('%Y%m%d')}-AUTO"

        return {
            "status": "VERIFICATION_INITIATED",
            "request_id": request_id,
            "steps": [
                "Email sent to authorized contact (primary)",
                "SMS sent to CFO (secondary)",
                "Hold placed on payments until verified"
            ]
        }

    def monitor_vendor_access(self, vendor_id=None): # Optional vendor_id for flexibility
        # Pain Point 9: Third-Party Access Monitor
        return {
            "status": "RISK_FOUND",
            "stale_accounts": [
                {"vendor": "AcmeConsulting", "account": "consultant_bob", "last_login": "180 days ago"},
                {"vendor": "FastLogistics", "account": "driver_api_key", "last_used": "Never"}
            ],
            "recommendation": "REVOKE_ALL_STALE"
        }
        
    def collect_incident_evidence(self, incident_id, time_range=None):
        # Pain Point 10: Incident Evidence Packager
        if not time_range:
            time_range = "Last 24 Hours (Default)"

        return {
            "incident": incident_id,
            "time_range": time_range,
            "status": "COLLECTED",
            "artifacts": [
                "firewall_logs.csv",
                "packet_capture.pcap",
                "slack_war_room_transcript.txt",
                "access_logs_raw.json"
            ],
            "archive_location": "s3://security-evidence/incidents/INC-555/evidence.zip"
        }
        
    def run(self, prompt: str) -> Dict[str, Any]:
        logs = []
        logs.append(f"--- SecOps Agent Started: {prompt} ---")
        
        history = [
            {
                "role": "user", 
                "content": f"""
                You are the SecOps Autonomous Sentinel.
                Goal: {prompt}
                
                Workflows:
                1. 'Impossible Travel': Analyze using 'check_travel_velocity', if risk high, 'lock_user_account'.
                2. 'CVE Patch': Use 'scan_vulnerabilities', then 'map_cve_to_owner' to create a plan, then 'deploy_patch'.
                3. 'Bank Change': If vendor implies or requests bank update, use 'verify_bank_change' immediately.
                4. 'Vendor Access': Periodically or on demand run 'monitor_vendor_access'.
                5. 'Incident Response': When an incident is confirmed OR evidence requested, use 'isolate_asset' and 'collect_incident_evidence'.
                
                Always create a risk signal for confirmed threats. If Critical CVE found, DEPLOY PATCH and log risk.
                
                Be aggressive with security.
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
                if name == "check_travel_velocity":
                    result = self.check_travel_velocity(args.get("user_id"))
                elif name == "scan_vulnerabilities":
                    result = self.scan_vulnerabilities(args.get("asset_id"))
                elif name == "isolate_asset":
                    result = self.isolate_asset(args.get("entity_id"), args.get("reason"))
                elif name == "deploy_patch":
                    result = self.deploy_patch(args.get("asset_id"), args.get("cve_id"))
                elif name == "create_risk_signal":
                    result = self.create_risk_signal(args.get("entity_id"), args.get("reason"), args.get("score"))
                elif name == "lock_user_account":
                    result = self.lock_user_account(args.get("user_id"), args.get("reason"))
                elif name == "map_cve_to_owner":
                    result = self.map_cve_to_owner(args.get("cve_id"))
                elif name == "verify_bank_change":
                    result = self.verify_bank_change(args.get("vendor_id"), args.get("request_id"))
                elif name == "monitor_vendor_access":
                    result = self.monitor_vendor_access()
                elif name == "collect_incident_evidence":
                    result = self.collect_incident_evidence(args.get("incident_id"), args.get("time_range"))
                
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
