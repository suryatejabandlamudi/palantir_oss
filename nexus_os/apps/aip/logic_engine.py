
import asyncio
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import networkx as nx
from nexus_os.apps.aip.agent_runtime.llm import get_llm_client
from nexus_os.apps.aip.agent_runtime.tools import registry
from nexus_os.apps.aip.agent_runtime.rbac import UserRole
import json

# --- Schema Definition for AIP Logic ---

class Node(BaseModel):
    id: str
    type: str # "input", "prompt", "code", "tool", "output"
    config: Dict[str, Any] # e.g., {"prompt_template": "...", "model": "gemini-pro"}
    
class Edge(BaseModel):
    source: str
    target: str
    
class LogicGraph(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

# --- Execution Engine ---

class AIPLogicEngine:
    def __init__(self):
        self.llm_client = get_llm_client()
        
    async def execute(self, graph: LogicGraph, inputs: Dict[str, Any], user_role: UserRole = UserRole.ADMIN) -> Dict[str, Any]:
        """
        Executes the AIP Logic DAG.
        """
        # 1. Build NetworkX Graph
        G = nx.DiGraph()
        for node in graph.nodes:
            G.add_node(node.id, data=node)
        for edge in graph.edges:
            G.add_edge(edge.source, edge.target)
            
        if not nx.is_directed_acyclic_graph(G):
            raise ValueError("AIP Logic Graph must be acyclic (DAG).")
            
        # 2. Execution State
        state = {} # node_id -> output
        
        # 3. Topological Sort execution
        for node_id in nx.topological_sort(G):
            node = G.nodes[node_id]["data"]
            
            # Gather inputs for this node from predecessors
            node_inputs = {}
            for pred in G.predecessors(node_id):
                node_inputs[pred] = state[pred]
                
            # Merge with Global Inputs if it's an Input Node
            if node.type == "input":
                # Config should map input key to node output
                key = node.config.get("key")
                state[node_id] = inputs.get(key)
                print(f"🔹 [Input] {node_id}: {state[node_id]}")
                
            elif node.type == "prompt":
                # Construct Prompt
                template = node.config.get("template", "")
                # Simple string replacement (handlebars style)
                # e.g. "Summarize {{previous_node_id}}"
                prompt = template
                for pred_id, pred_val in node_inputs.items():
                    # If config specifies variable mapping, use it. Else repl by ID.
                    prompt = prompt.replace(f"{{{{{pred_id}}}}}", str(pred_val))
                    
                # Append global inputs too for convenience
                for k, v in inputs.items():
                    prompt = prompt.replace(f"{{{{{k}}}}}", str(v))
                
                print(f"🧠 [Prompt] {node_id}: {prompt[:50]}...")
                
                # Execute LLM
                response = self.llm_client.generate_response([{"role": "user", "content": prompt}])
                state[node_id] = response["content"]
                
            elif node.type == "tool":
                tool_name = node.config.get("tool_name")
                # Arguments can be static or dynamic (from previous nodes)
                args_mapping = node.config.get("arguments", {})
                tool_args = {}
                
                for arg_name, arg_src in args_mapping.items():
                    # Check if src is a reference literal "{{node_id}}"
                    if isinstance(arg_src, str) and arg_src.startswith("{{") and arg_src.endswith("}}"):
                        ref_id = arg_src[2:-2]
                        if ref_id in state:
                            tool_args[arg_name] = state[ref_id]
                        elif ref_id in inputs:
                            tool_args[arg_name] = inputs[ref_id]
                    else:
                        tool_args[arg_name] = arg_src
                        
                print(f"🛠️ [Tool] {node_id}: {tool_name}({tool_args})")
                try:
                    result = registry.execute(tool_name, tool_args, user_role)
                    state[node_id] = result
                except Exception as e:
                    state[node_id] = f"Error: {e}"
                    
            elif node.type == "code":
                # Dangerous! Sandbox relevant here.
                # For MVP, use simple exec with restricted globals
                code = node.config.get("code", "")
                
                # Prepare local scope with inputs
                local_scope = {"inputs": node_inputs, **inputs}
                
                print(f"💻 [Code] {node_id}")
                try:
                    exec(code, {}, local_scope)
                    state[node_id] = local_scope.get("output")
                except Exception as e:
                    state[node_id] = f"Error: {e}"
            
            elif node.type == "output":
                # Pass through predecessor
                vals = list(node_inputs.values())
                state[node_id] = vals[0] if vals else None
                
        # 4. Return Output Nodes
        results = {}
        for node in graph.nodes:
            if node.type == "output":
                key = node.config.get("key", node.id)
                results[key] = state[node.id]
                
        return results

logic_engine = AIPLogicEngine()
