import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from agent.llm import GeminiClient
from agent.tools import registry
from agent.rbac import UserRole
import agent.integrated_tools # Trigger registration

app = FastAPI(title="Palantir OSS - Nexus OS API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core Components
llm_client = GeminiClient()
# registry is already initialized in agent.tools

class ChatRequest(BaseModel):
    message: str
    role: str = "admin" # Default to admin
    history: List[Dict[str, str]] = []

class ChatResponse(BaseModel):
    response: str
    tool_calls: List[Dict[str, Any]] = []

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Process a chat message from the user, executing tools based on their role.
    """
    user_message = request.message
    role_str = request.role.lower()
    history = request.history

    # Map string role to UserRole enum
    try:
        user_role = UserRole(role_str)
    except ValueError:
        # Fallback or error? Let's default to a safe role or error.
        # For now, defaulting to IT if unknown, or raising error.
        # Let's raise error to be strict.
        raise HTTPException(status_code=400, detail=f"Invalid role: {role_str}")

    # 1. Get Tools for Role
    available_tools = registry.get_tools_for_role(user_role)

    # 2. Update History
    current_history = history + [{"role": "user", "content": user_message}]

    try:
        # 3. Call LLM
        llm_response = llm_client.generate_response(history=current_history, tools=available_tools)
        
        final_content = llm_response["content"]
        executed_tool_calls = []

        # 4. Execute Tools
        if llm_response["tool_calls"]:
            for tool_call in llm_response["tool_calls"]:
                tool_name = tool_call["name"]
                tool_args = tool_call["arguments"]
                
                try:
                    print(f"Executing {tool_name} with {tool_args} as {user_role}")
                    # registry.execute checks RBAC internally too
                    tool_result = registry.execute(tool_name, tool_args, user_role=user_role)
                except Exception as e:
                    tool_result = f"Error executing tool: {str(e)}"

                executed_tool_calls.append({
                    "name": tool_name,
                    "args": tool_args,
                    "result": str(tool_result)
                })

                # Add tool result to history
                # Gemini function calling flow:
                # User -> Model (Call Tool) -> User (Result) -> Model (Final Answer)
                # We simulate the "User (Result)" part.
                current_history.append({"role": "user", "content": f"Tool '{tool_name}' returned: {tool_result}"})

            # Second pass
            final_response = llm_client.generate_response(history=current_history, tools=available_tools)
            final_content = final_response["content"]

        return ChatResponse(
            response=final_content,
            tool_calls=executed_tool_calls
        )

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
