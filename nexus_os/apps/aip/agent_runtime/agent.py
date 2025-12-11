from typing import List, Dict, Any
from nexus_os.apps.aip.agent_runtime.llm import get_llm_client

class Agent:
    def __init__(self, name: str, role: str, description: str):
        self.name = name
        self.role = role
        self.description = description
        self.llm = get_llm_client()
        self.history: List[Dict[str, str]] = []

    def run(self, task: str) -> str:
        """
        Executes a task with a "Thinking" process.
        """
        system_prompt = f"""
You are {self.name}, a {self.role}.
Description: {self.description}

CRITICAL INSTRUCTION:
You usually operate in a "Thinking" mode before answering.
You MUST enclose your internal reasoning and step-by-step analysis within <thinking> tags.
After thinking, provide your final response to the user.

Example:
User: "Calculate the budget."
You:
<thinking>
1. I need to identify the data source for the budget.
2. I should look for recent financial files.
3. Calculating the totals...
</thinking>
The estimated budget is $50,000 based on the Q1 reports.
"""
        
        # Inject system prompt if not present
        if not any(msg.get("role") == "system" for msg in self.history):
             self.history.insert(0, {"role": "system", "content": system_prompt})

        self.history.append({"role": "user", "content": task})
        
        try:
            response = self.llm.generate_response(self.history)
            content = response.get("content", "")
        except Exception as e:
            content = f"Error during agent execution: {str(e)}"
        
        self.history.append({"role": "model", "content": content})
        
        return content
