from fastapi import APIRouter, HTTPException, Body, Depends
from typing import Dict, Any, List
from agent.supply_chain_agent import SupplyChainAgent
from agent.cfo_agent import CFOAgent
from agent.cto_agent import CTOAgent
from agent.hr_agent import HRAgent
from . import auth

router = APIRouter(prefix="/agents", tags=["Enterprise Agents"])

# Instantiate agents once (or per request if stateful, but these are stateless per run)
sc_agent = SupplyChainAgent()
cfo_agent = CFOAgent()
cto_agent = CTOAgent()
hr_agent = HRAgent()

@router.post("/supply-chain/run")
def run_supply_chain_agent(event: Dict[str, Any] = Body(...), current_user: Any = Depends(auth.get_current_active_user)):
    """
    Trigger the Supply Chain Agent with an event (e.g., delivery delay).
    """
    try:
        result = sc_agent.run(event)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cfo/run")
def run_cfo_agent(prompt: Dict[str, str] = Body(..., example={"prompt": "Analyze cash flow risks"}), current_user: Any = Depends(auth.get_current_active_user)):
    """
    Trigger the CFO Agent with a natural language prompt.
    """
    try:
        result = cfo_agent.run(prompt["prompt"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cto/run")
def run_cto_agent(prompt: Dict[str, str] = Body(..., example={"prompt": "Check for risky deployments"}), current_user: Any = Depends(auth.get_current_active_user)):
    """
    Trigger the CTO Agent with a natural language prompt.
    """
    try:
        result = cto_agent.run(prompt["prompt"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/hr/run")
def run_hr_agent(prompt: Dict[str, str] = Body(..., example={"prompt": "Identify burnout risks"}), current_user: Any = Depends(auth.get_current_active_user)):
    """
    Trigger the HR Agent with a natural language prompt.
    """
    try:
        result = hr_agent.run(prompt["prompt"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
