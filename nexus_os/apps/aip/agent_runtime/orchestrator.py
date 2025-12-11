import json
import asyncio
from typing import Dict, Any, AsyncGenerator, List
from nexus_os.apps.aip.agent_runtime.agent import Agent
from nexus_os.apps.aip.agent_runtime.llm import get_llm_client
from nexus_os.core.integrations.crm.client import CRMConnector
from nexus_os.core.integrations.erp.client import ERPConnector
from nexus_os.core.integrations.itsm.client import ITSMConnector

class Orchestrator:
    def __init__(self):
        self.llm = get_llm_client()
        
        # Initialize Connectors
        self.crm = CRMConnector()
        self.erp = ERPConnector()
        self.itsm = ITSMConnector()
        
        # Aggregate Tools
        self.tools = []
        self.tools.extend(self.crm.get_tools())
        self.tools.extend(self.erp.get_tools())
        self.tools.extend(self.itsm.get_tools())
        
        # Map tool names to connector instances for execution reference
        self.tool_map = {}
        for t in self.crm.get_tools(): self.tool_map[t['name']] = self.crm
        for t in self.erp.get_tools(): self.tool_map[t['name']] = self.erp
        for t in self.itsm.get_tools(): self.tool_map[t['name']] = self.itsm

    async def run_stream(self, prompt: str, context: Dict[str, Any] = {}) -> AsyncGenerator[str, None]:
        """
        Orchestrates the response stream using the LLM and registered tools.
        Yields SSE-formatted strings.
        """
        # Helper to yield json data compatible with frontend
        def sse(data_dict):
            return f"data: {json.dumps(data_dict)}\n\n"

        yield sse({'type': 'thought', 'content': 'Analyzing Universe (CRM, ERP, ITSM)...'})
        await asyncio.sleep(0.2) # Micro-latency for UX

        # Prepare History
        # We explicitly inject a system prompt to guide the LLM
        # Prepare History
        # Advanced System Prompt with Role Switching Capabilities
        system_prompt = (
            "You are Nexus, the advanced AI Operating System for the Enterprise. "
            "You are connected to real-time data streams from ERP (SAP), CRM (Salesforce), and ITSM (ServiceNow).\n\n"
            
            "**YOUR ROLES:**\n"
            "1. **Supply Chain Strategist**: When handling ERP/Inventory, analyze downstream impacts. If a shipment is delayed, proactively suggest transfers or POs.\n"
            "2. **Sales Engineer**: When handling CRM, be competitive. Analyze competitor offers (price, features) and draft aggressive counter-strategies.\n"
            "3. **Security Analyst**: When handling ITSM/Security, be paranoid. If you see 'Impossible Travel' or 'Anomalous Login', act immediately to contain threats (Lock Account).\n\n"

            "**EXECUTION RULES:**\n"
            "- **Reasoning First**: ALWAYS output a 'Thought' explaining your analysis before calling a tool.\n"
            "- **Tool Usage**: You have access to explicit tools. USE THEM. Do not hallucinate actions.\n"
            "- **Conciseness**: Be professional, executive, and decisive.\n"
        )
        history = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]

        yield sse({'type': 'thought', 'content': f'Router: Consulting {self.llm.model}...'})
        
        try:
            # Execute LLM Call (in thread pool to avoid blocking async loop)
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, self.llm.generate_response, history, self.tools)
            
            content = response.get("content", "")
            tool_calls = response.get("tool_calls", [])

            # Emit initial thought/reasoning
            if content:
                yield sse({'type': 'thought', 'content': content})
            
            # Handle Tool Calls
            final_output_text = content
            
            if tool_calls:
                for tc in tool_calls:
                    name = tc['name']
                    args = tc['arguments']
                    
                    yield sse({'type': 'thought', 'content': f'Routing to Tool: {name}'})
                    yield sse({'type': 'tool_start', 'tool': name, 'input': args})
                    
                    connector = self.tool_map.get(name)
                    if connector:
                        try:
                            # Execute Tool (Synchronous for now)
                            # In a real system, connectors might differ in sync/async
                            # We wrap in executor and use a lambda to pass kwargs
                            result = await loop.run_in_executor(
                                None, 
                                lambda: connector.execute_tool(name, **args)
                            )
                            
                            yield sse({'type': 'tool_end', 'tool': name, 'output': f"{result}"})
                            
                            # Simple "One-Shot" Logic for now:
                            # We treat the tool result as the success message.
                            # Enhancment: Recursively call LLM with result (ReAct loop).
                            # For current scope (MVC), we just summarize.
                            final_output_text = f"Executed {name}. Result: {result}"
                            
                        except Exception as tool_err:
                            err_msg = f"Tool Execution Failed: {str(tool_err)}"
                            yield sse({'type': 'tool_end', 'tool': name, 'output': err_msg})
                            final_output_text = err_msg
                    else:
                        yield sse({'type': 'thought', 'content': f'Error: Tool {name} not found in registry.'})

            yield sse({'type': 'final_response', 'content': final_output_text or "Task completed."})

        except Exception as e:
            # Fallback for LLM errors
            print(f"Orchestrator Error: {e}")
            yield sse({'type': 'thought', 'content': f'Orchestration Error: {str(e)}'})
            yield sse({'type': 'final_response', 'content': "I encountered an error processing your request."})
        
        yield "data: [DONE]\n\n"
