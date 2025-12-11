from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os
import google.generativeai as genai
from typing import Dict, Any, List

router = APIRouter()

# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Using the latest generally available Flash model for speed/cost balance
    model = genai.GenerativeModel('gemini-3-pro-preview')

class AnalysisRequest(BaseModel):
    context: Dict[str, Any]
    prompt: str

class AnalysisResponse(BaseModel):
    insight: str
    steps: List[str]
    status: str = "Completed"

@router.post("/agent/analyze", response_model=AnalysisResponse)
async def analyze_with_gemini(request: AnalysisRequest):
    """
    Uses Gemini to analyze the provided context (mock data) based on the prompt.
    Returns a structured insight and "reasoning steps" to display in the Thinking UI.
    """
    if not api_key:
        # Fallback if no key is present, though one should be.
        return AnalysisResponse(
            insight="[MOCK] AI Insight: Gemini Key missing. Please configure GEMINI_API_KEY.",
            steps=["Check Environment", "Fail Gracefully"]
        )

    try:
        # Construct a structured prompt to force consistent JSON-like output reasoning
        full_prompt = f"""
        You are an advanced enterprise AI agent (Nexus OS).
        Analyze the following data context and provide a brief, professional insight and a list of 2-3 logical steps you took to arrive at it.

        CONTEXT:
        {request.context}

        USER REQUEST:
        {request.prompt}

        FORMAT YOUR RESPONSE EXACTLY AS:
        Insight: [One influential sentence]
        Step 1: [Action 1]
        Step 2: [Action 2]
        Step 3: [Action 3]
        """
        
        response = model.generate_content(full_prompt)
        text = response.text.strip()
        
        # Simple parsing logic (robustness improvements can be added later)
        lines = text.split('\n')
        insight = "Analysis Complete."
        steps = []
        
        for line in lines:
            line = line.strip()
            if line.startswith("Insight:"):
                insight = line.replace("Insight:", "").strip()
            elif line.startswith("Step"):
                # "Step 1: ..." -> remove prefix
                parts = line.split(":", 1)
                if len(parts) > 1:
                    steps.append(parts[1].strip())
        
        if not steps:
            steps = ["Analyzing Data Patterns", "Correlating Anomalies", "Generating Insight"]

        return AnalysisResponse(
            insight=insight,
            steps=steps
        )

    except Exception as e:
        print(f"Gemini Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
