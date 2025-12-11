import uvicorn
import os
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import json
from nexus_os.apps.aip.agent_runtime.orchestrator import Orchestrator

app = FastAPI(title="Nexus OS Agent Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Orchestrator
# In a real app, this might be a singleton or per-request with dependency injection
orchestrator = Orchestrator()

class AgentRequest(BaseModel):
    prompt: str
    context: Dict[str, Any] = {}

async def event_generator(prompt: str, context: Dict[str, Any]):
    """
    Generator that yields SSE (Server-Sent Events) for the frontend.
    Delegates fully to the Orchestrator for agentic reasoning.
    """
    async for event in orchestrator.run_stream(prompt, context):
        yield event
    
    # End signal
    yield "data: [DONE]\n\n"

@app.get("/api/ontology/graph")
async def get_ontology_graph():
    """
    Returns the dynamic Ontology Graph based on real NexusDB data.
    """
    from nexus_os.core.integrations.db import db
    
    # Introspect DuckDB for tables and counts
    tables = [
        {"id": "incidents", "label": "Incidents", "module": "ITSM"},
        {"id": "purchase_orders", "label": "Purchase Orders", "module": "ERP"},
        # We don't have real tables for Leads/Opptys yet in DuckDB (simulated in code), 
        # but let's expose what we DO have + the "Virtual" ones for the full picture.
        {"id": "leads", "label": "Leads", "module": "CRM"},
        {"id": "opportunities", "label": "Opportunities", "module": "CRM"},
        {"id": "inventory", "label": "Inventory", "module": "ERP"}
    ]
    
    edges = [
        {"source": "leads", "target": "opportunities", "label": "converts_to"},
        {"source": "opportunities", "target": "purchase_orders", "label": "generates_demand"},
        {"source": "purchase_orders", "target": "inventory", "label": "replenishes"},
        {"source": "incidents", "target": "inventory", "label": "affects (availability)"}
    ]
    
    # Fetch Real Counts where possible
    for table in tables:
        try:
            if table["id"] in ["incidents", "purchase_orders", "inventory"]:
                count = db.query(f"SELECT COUNT(*) as c FROM {table['id']}")[0]['c']
                table["count"] = count
            else:
                table["count"] = "Virtual" # external API
        except Exception:
            table["count"] = 0

    return {"nodes": tables, "edges": edges}

@app.post("/api/agent/run")
async def run_agent(request: AgentRequest):
    return StreamingResponse(
        event_generator(request.prompt, request.context),
        media_type="text/event-stream"
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "nexus-agent-runtime"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
