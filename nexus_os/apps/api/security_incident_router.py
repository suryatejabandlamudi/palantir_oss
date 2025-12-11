from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json
import random
from typing import Dict, List

router = APIRouter()

# Mock Agents Configuration
AGENTS = {
    "security": {"name": "Sentinel", "role": "Security Operations", "icon": "shield-alert"},
    "it": {"name": "TechCore", "role": "IT Admin", "icon": "server"},
    "hr": {"name": "PeopleOps", "role": "HR Manager", "icon": "users"},
    "comms": {"name": "Relay", "role": "Communications", "icon": "message-square"},
}

async def simulation_generator():
    """
    Generates a stream of events simulating a multi-agent security incident response.
    Events types: 'thinking', 'action', 'message'.
    """
    
    # 1. Trigger - Security Agent
    yield _event("security", "thinking", "Analyzing inbound traffic logs from Splunk...")
    await asyncio.sleep(1.0)
    yield _event("security", "thinking", "Detected anomaly: High-velocity login attempts on user 'j.doe'.")
    await asyncio.sleep(1.2)
    yield _event("security", "thinking", "Source IP: 192.168.1.105 (Unrecognized Subnet).")
    await asyncio.sleep(0.8)
    yield _event("security", "action", "Alert: Suspicious Login Activity detected.")
    await asyncio.sleep(0.5)
    
    # 2. Security asks IT
    yield _event("security", "message", "Requesting device context for IP 192.168.1.105 from IT Agent.")
    await asyncio.sleep(1.0)
    
    # 3. IT Agent Analysis
    yield _event("it", "thinking", "Querying ServiceNow Asset Management DB...")
    await asyncio.sleep(1.5)
    yield _event("it", "thinking", "Cross-referencing DHCP leases...")
    await asyncio.sleep(1.0)
    yield _event("it", "action", "Result: IP address map to 'Guest-WiFi'. Device MAC not in MDM.")
    await asyncio.sleep(0.5)
    yield _event("it", "message", "Device is unmanaged/guest. High risk.")
    await asyncio.sleep(1.0)
    
    # 4. Security asks HR
    yield _event("security", "thinking", "Evaluating user context. Checking Workday status.")
    await asyncio.sleep(0.5)
    yield _event("security", "message", "Requesting employment status for 'j.doe' from HR Agent.")
    await asyncio.sleep(1.0)
    
    # 5. HR Agent Analysis
    yield _event("hr", "thinking", "Querying Workday Human Capital Management API...")
    await asyncio.sleep(1.2)
    yield _event("hr", "thinking", "Retrieving time-off requests...")
    await asyncio.sleep(0.8)
    yield _event("hr", "action", "Result: User 'j.doe' is currently on approved PTO (Vacation) in 'Bali'.")
    await asyncio.sleep(0.5)
    yield _event("hr", "message", "User is on vacation. Login from 'Guest-WiFi' is highly suspicious.")
    await asyncio.sleep(1.0)
    
    # 6. Correlation & Enforcement
    yield _event("security", "thinking", "Correlating signals: Unmanaged Device + Guest Network + User on Vacation + High Velocity.")
    await asyncio.sleep(1.5)
    yield _event("security", "thinking", "Confidence Score: 0.98 (Critical).")
    await asyncio.sleep(0.8)
    yield _event("security", "action", "Executing Playbook: AUTOMATED_LOCKDOWN.")
    await asyncio.sleep(0.5)
    yield _event("security", "action", "User 'j.doe' account LOCKED in Active Directory.")
    await asyncio.sleep(0.5)
    yield _event("security", "action", "Session tokens REVOKED.")
    await asyncio.sleep(1.0)
    
    # 7. Comms
    yield _event("comms", "thinking", "Drafting incident report for #sec-ops channel...")
    await asyncio.sleep(1.0)
    yield _event("comms", "action", "Sent Slack Notification: 'Urgent: Account Compromise Prevented for j.doe'.")
    await asyncio.sleep(0.5)
    
    yield _event("system", "complete", "Simulation Complete. Threat Neutralized.")

def _event(agent: str, type: str, content: str) -> str:
    data = {
        "agent": AGENTS.get(agent, {"name": "System", "role": "System", "icon": "cpu"}),
        "type": type, # thinking, action, message
        "content": content,
        "timestamp": "Now"
    }
    return json.dumps(data) + "\n"

@router.get("/agents/simulate/security-incident")
async def stream_simulation():
    return StreamingResponse(simulation_generator(), media_type="application/x-ndjson")
