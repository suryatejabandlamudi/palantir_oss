
from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Dict, Any
import json

import models
import schemas
from vector_store import vector_store
from duckdb_client import duck_db
from pipeline_engine import pipeline_engine
from duckdb_client import duck_db
from pipeline_engine import pipeline_engine
import requests
from jose import JWTError, jwt
from database import get_db, engine
import sys
import os

# Add parent directory to path to allow importing from agent
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from agent.llm import GeminiClient
from agent.tools import registry
from agent.rbac import UserRole

# Create tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NexusOS Ontology Engine", version="0.2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
import auth

# --- Auth Setup ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Ontology Metadata Endpoints ---

@app.post("/ontology/types", response_model=schemas.ObjectType)
def create_object_type(object_type: schemas.ObjectTypeCreate, db: Session = Depends(get_db)):
    db_obj_type = models.ObjectType(
        api_name=object_type.api_name,
        display_name=object_type.display_name,
        description=object_type.description,
        icon=object_type.icon,
        color=object_type.color,
        property_definitions=[p.dict() for p in object_type.property_definitions],
        action_definitions=object_type.action_definitions
    )
    try:
        db.add(db_obj_type)
        db.commit()
        db.refresh(db_obj_type)
        
        # Create DuckDB Table
        try:
            duck_db.create_object_table(db_obj_type.display_name, object_type.property_definitions)
        except Exception as e:
            print(f"DuckDB Table Creation Failed: {e}")
            # Log error but don't block object type creation
            
        return db_obj_type
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating object type: {str(e)}")

@app.get("/ontology/types", response_model=List[schemas.ObjectType])
def list_object_types(db: Session = Depends(get_db)):
    return db.query(models.ObjectType).all()

@app.get("/ontology/types/{type_id}", response_model=schemas.ObjectType)
def get_object_type(type_id: str, db: Session = Depends(get_db)):
    obj_type = db.query(models.ObjectType).filter(models.ObjectType.id == type_id).first()
    if not obj_type:
        raise HTTPException(status_code=404, detail="Object Type not found")
    return obj_type

# --- Object Data Endpoints ---

@app.post("/objects", response_model=schemas.ObjectInstance)
def create_object(object_data: schemas.ObjectInstanceCreate, db: Session = Depends(get_db)):
    # Verify object type exists
    obj_type = db.query(models.ObjectType).filter(models.ObjectType.id == object_data.object_type_id).first()
    if not obj_type:
        raise HTTPException(status_code=404, detail="Object Type not found")
    
    # Create object with JSON properties
    db_obj = models.ObjectInstance(
        object_type_id=object_data.object_type_id,
        title=object_data.title,
        properties=object_data.properties
    )
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Index into Vector Store
    vector_store.index_object(
        obj_id=db_obj.id,
        title=db_obj.title,
        properties=db_obj.properties,
        object_type=obj_type.display_name
    )
    
    # Insert into DuckDB
    try:
        # Flatten properties and add ID/Title
        duck_data = db_obj.properties.copy()
        duck_data["id"] = db_obj.id
        duck_data["title"] = db_obj.title
        duck_db.insert_object(obj_type.display_name, duck_data)
    except Exception as e:
        print(f"DuckDB Insert Failed: {e}")

    return db_obj

@app.get("/objects", response_model=List[schemas.ObjectInstance])
def list_objects(
    object_type_id: str = None, 
    limit: int = 100, 
    offset: int = 0, 
    db: Session = Depends(get_db)
):
    query = db.query(models.ObjectInstance)
    if object_type_id:
        query = query.filter(models.ObjectInstance.object_type_id == object_type_id)
    
    return query.offset(offset).limit(limit).all()

@app.get("/objects/{object_id}", response_model=schemas.ObjectInstance)
def get_object(object_id: str, db: Session = Depends(get_db)):
    obj = db.query(models.ObjectInstance).filter(models.ObjectInstance.id == object_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return obj

# --- Query Engine (The "Real" Search) ---

@app.post("/query/objects")
def query_objects(
    query: Dict[str, Any] = Body(..., example={"object_type_id": "...", "filters": {"status": "active"}}),
    db: Session = Depends(get_db)
):
    """
    Advanced query endpoint supporting filtering on JSON properties.
    """
    q = db.query(models.ObjectInstance)
    
    # Filter by Object Type
    if "object_type_id" in query:
        q = q.filter(models.ObjectInstance.object_type_id == query["object_type_id"])
        
    # Filter by Properties (JSON)
    # Note: SQLite JSON support varies, this is a basic implementation
    # For Postgres, we would use proper JSONB operators
    if "filters" in query:
        filters = query["filters"]
        # In a real DB we'd do: q = q.filter(models.ObjectInstance.properties.contains(filters))
        # For Python-side filtering (MVP for SQLite compatibility):
        results = q.all()
        filtered_results = []
        for obj in results:
            match = True
            for k, v in filters.items():
                if obj.properties.get(k) != v:
                    match = False
                    break
            if match:
                filtered_results.append(obj)
        return filtered_results

    return q.all()

# --- Link Endpoints ---

@app.post("/ontology/link-types", response_model=schemas.LinkType)
def create_link_type(link_type: schemas.LinkTypeCreate, db: Session = Depends(get_db)):
    db_link_type = models.LinkType(**link_type.dict())
    db.add(db_link_type)
    db.commit()
    db.refresh(db_link_type)
    return db_link_type

@app.post("/links", response_model=schemas.LinkInstance)
def create_link(link_data: schemas.LinkInstanceCreate, db: Session = Depends(get_db)):
    db_link = models.LinkInstance(**link_data.dict())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

@app.get("/objects/{object_id}/links")
def get_object_links(object_id: str, db: Session = Depends(get_db)):
    """
    Get all links for an object (incoming and outgoing)
    """
    obj = db.query(models.ObjectInstance).filter(models.ObjectInstance.id == object_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
        
    return {
        "outgoing": obj.links_outgoing,
        "incoming": obj.links_incoming
    }

# --- AIP / Action Endpoints ---

@app.post("/actions/execute", response_model=schemas.ActionExecution)
def execute_action(execution: schemas.ActionExecutionCreate, db: Session = Depends(get_db)):
    # 1. Log Execution
    db_exec = models.ActionExecution(
        action_api_name=execution.action_api_name,
        target_object_id=execution.target_object_id,
        parameters=execution.parameters,
        user_id="user-1",
        status="COMPLETED"
    )
    db.add(db_exec)
    
    # 2. Apply Logic (Real State Change)
    # For MVP, we assume the action is "update_property" if parameters contains "properties"
    if "properties" in execution.parameters:
        obj = db.query(models.ObjectInstance).filter(models.ObjectInstance.id == execution.target_object_id).first()
        if obj:
            # Update the JSON properties
            # We need to create a new dict to ensure SQLAlchemy detects the change
            current_props = dict(obj.properties)
            current_props.update(execution.parameters["properties"])
            obj.properties = current_props
            
            # Update title if changed
            if "title" in execution.parameters["properties"]:
                obj.title = execution.parameters["properties"]["title"]
                
            db.add(obj)
            
    db.commit()
    db.refresh(db_exec)
    return db_exec

import aip_tools

@app.post("/aip/chat")
def aip_chat(query: Dict[str, str] = Body(...)):
    """
    Real AIP Chat endpoint using RAG + Local GPT-OSS + Tool Calling.
    """
    user_prompt = query.get("prompt", "")
    
    # 1. Retrieve Context from Vector Store
    context_results = vector_store.search(user_prompt)
    context_str = "\n".join([f"- {r['document']}" for r in context_results])
    
    # 2. Get Ontology Schema for Context
    try:
        ontology_schema = aip_tools.query_ontology()
    except:
        ontology_schema = "Could not retrieve ontology."

    # 3. Construct Prompt with Tool Definitions
    tools_desc = json.dumps({k: str(v.__doc__) for k, v in aip_tools.AVAILABLE_TOOLS.items()}, indent=2)
    
    system_prompt = f"""You are Palantir AIP, an advanced AI assistant for Nexus OS. 
    
    Data Model (Ontology):
    {ontology_schema}
    
    You have access to the following tools:
    {tools_desc}
    
    To use a tool, your response MUST be a valid JSON object with the following format:
    {{"tool": "tool_name", "args": {{...}}}}
    
    If no tool is needed, just answer the user's question directly based on the context.
    Context:
    {context_str}
    """
    
    full_prompt = f"User: {user_prompt}\n\nAIP:"
    
    # 4. Call Local LLM (Ollama)
    try:
        # Using Ollama directly as it's verified running on 11434
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "gpt-oss:20b", # Using the model found in curl
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": full_prompt}
                ],
                "stream": False,
                "options": {
                    "temperature": 0.1
                }
            },
            timeout=60
        )
        response.raise_for_status()
        ai_text = response.json()['message']['content']
        
        # 5. Check for Tool Call
        structured_data = {}
        try:
            # Heuristic: Try to parse JSON from the response
            clean_text = ai_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:-3]
            elif clean_text.startswith("```"):
                clean_text = clean_text[3:-3]
                
            tool_call = json.loads(clean_text)
            
            if "tool" in tool_call and tool_call["tool"] in aip_tools.AVAILABLE_TOOLS:
                tool_name = tool_call["tool"]
                tool_args = tool_call.get("args", {})
                
                # Execute Tool
                tool_func = aip_tools.AVAILABLE_TOOLS[tool_name]
                if tool_name == "analyze_impact":
                    result = tool_func(tool_args.get("disruption_name"))
                elif tool_name == "run_sql_query":
                    result = tool_func(tool_args.get("sql"))
                elif tool_name == "create_alert":
                    result = tool_func(tool_args.get("severity"), tool_args.get("title"), tool_args.get("message"))
                else:
                    result = tool_func()
                    
                structured_data["tool_result"] = result
                structured_data["tool_name"] = tool_name
                
                ai_text = f"Executed {tool_name}. Result: {json.dumps(result, default=str)[:200]}..."
                
        except json.JSONDecodeError:
            pass
            
    except Exception as e:
        print(f"LLM Error: {e}")
        ai_text = f"AIP Error: Could not connect to Local LLM. Details: {str(e)}"

    return {
        "text": ai_text,
        "structured_data": structured_data
    }

# --- Main Chat Endpoint (Role-Based + RAG) ---

class ChatRequest(BaseModel):
    message: str
    role: str = "admin"
    history: List[Dict[str, str]] = []

@app.post("/chat")
def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Main chatbot endpoint handling:
    1. Role-based access control
    2. RAG context retrieval
    3. Gemini API interaction
    4. Tool execution
    """
    try:
        # 1. Setup Role & Client
        try:
            user_role = UserRole(request.role)
        except ValueError:
            user_role = UserRole.ADMIN # Default fallback
            
        gemini = GeminiClient()
        
        # 2. Retrieve RAG Context
        # Search for relevant objects/docs in vector store
        context_results = vector_store.search(request.message)
        context_str = ""
        if context_results:
            context_str = "Relevant Context from Knowledge Base:\n"
            for r in context_results:
                context_str += f"- {r['document']} (Source: {r['metadata'].get('title', 'Unknown')})\n"
        
        # 3. Prepare Tools
        tools = registry.get_tools_for_role(user_role)
        
        # 4. Construct System Prompt
        system_prompt = f"""You are Nexus AI, an advanced enterprise assistant for Palantir Nexus OS.
        
        Your Role: You are assisting a user with the role: {user_role.value}.
        You must only answer questions and perform actions relevant to this role.
        
        Context Information:
        {context_str}
        
        Instructions:
        - Use the provided context to answer questions if relevant.
        - You have access to specific tools based on the user's role. Use them when necessary to retrieve real-time data or perform actions.
        - Be professional, concise, and helpful.
        - If you need to use a tool, the system will handle the execution.
        """
        
        # Add system prompt to history
        full_history = [{"role": "user", "content": system_prompt}] + request.history + [{"role": "user", "content": request.message}]
        
        # 5. Call Gemini
        response = gemini.generate_response(history=full_history, tools=tools)
        
        final_content = response["content"]
        tool_calls_result = []
        
        # 6. Execute Tools
        if response["tool_calls"]:
            for tool_call in response["tool_calls"]:
                tool_name = tool_call["name"]
                tool_args = tool_call["arguments"]
                
                try:
                    # Execute the tool
                    result = registry.execute(tool_name, tool_args, user_role)
                    tool_calls_result.append({
                        "name": tool_name,
                        "args": tool_args,
                        "result": result
                    })
                    
                    # Optional: Feed result back to LLM for final answer (simplified here)
                    final_content += f"\n\n[Executed {tool_name}]: {json.dumps(result, default=str)}"
                    
                except Exception as e:
                    tool_calls_result.append({
                        "name": tool_name,
                        "error": str(e)
                    })
                    final_content += f"\n\n[Error executing {tool_name}]: {str(e)}"

        return {
            "response": final_content,
            "tool_calls": tool_calls_result
        }

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Ingestion Endpoints ---

from fastapi import UploadFile, File
import csv
import io

@app.post("/ingest/csv")
async def ingest_csv(
    object_type_id: str, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """
    Ingest a CSV file and map rows to Object Instances.
    Assumes CSV headers match Property API names.
    """
    # Verify object type
    obj_type = db.query(models.ObjectType).filter(models.ObjectType.id == object_type_id).first()
    if not obj_type:
        raise HTTPException(status_code=404, detail="Object Type not found")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    created_count = 0
    objects_to_create = []
    
    for row in reader:
        # Basic mapping: Row keys -> Properties
        # We assume one column is 'title' or we generate it
        title = row.get("title") or row.get("name") or f"{obj_type.display_name} {created_count + 1}"
        
        # Clean row data (remove empty strings if needed, or keep as is)
        properties = {k: v for k, v in row.items() if k != "title"}
        
        db_obj = models.ObjectInstance(
            object_type_id=object_type_id,
            title=title,
            properties=properties
        )
        db.add(db_obj)
        created_count += 1
        
        # Index into Vector Store (Naive loop, bulk would be better)
        vector_store.index_object(
            obj_id=db_obj.id,
            title=db_obj.title,
            properties=db_obj.properties,
            object_type=obj_type.display_name
        )
        
        # Insert into DuckDB
        try:
            duck_data = db_obj.properties.copy()
            duck_data["id"] = db_obj.id
            duck_data["title"] = db_obj.title
            duck_db.insert_object(obj_type.display_name, duck_data)
        except Exception as e:
            print(f"DuckDB Bulk Insert Failed: {e}")
        
    db.commit()
    return {"status": "success", "created_count": created_count, "object_type": obj_type.display_name}

@app.post("/foundry/sql")
def run_sql(query: Dict[str, str] = Body(...)):
    """
    Execute raw SQL against the DuckDB analytical engine.
    """
    sql = query.get("sql", "")
    try:
        results = duck_db.raw_query(sql)
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Pipeline Endpoints ---

@app.post("/pipelines", response_model=schemas.Pipeline)
def create_pipeline(pipeline: schemas.PipelineCreate, db: Session = Depends(get_db)):
    db_pipeline = models.Pipeline(**pipeline.dict())
    db.add(db_pipeline)
    db.commit()
    db.refresh(db_pipeline)
    return db_pipeline

@app.post("/pipelines/{pipeline_id}/run", response_model=schemas.PipelineRun)
def run_pipeline(pipeline_id: str, db: Session = Depends(get_db)):
    pipeline = db.query(models.Pipeline).filter(models.Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
        
    # Create Run Record
    run = models.PipelineRun(pipeline_id=pipeline_id, status="RUNNING")
    db.add(run)
    db.commit()
    
    # Execute (Sync for now, ideally Async)
    # Resolve Object Type IDs to API Names/Table Names
    # For MVP we assume input_object_types contains names or we fetch them
    # Actually, let's assume the user passes Object Type Names in the input_object_types list for now
    # Or we resolve them here.
    
    # Resolve Input Names
    input_names = []
    for type_id in pipeline.input_object_types:
        # Try to find by ID
        ot = db.query(models.ObjectType).filter(models.ObjectType.id == type_id).first()
        if ot:
            input_names.append(ot.display_name)
        else:
            # Assume it's already a name
            input_names.append(type_id)
            
    # Resolve Output Name
    output_ot = db.query(models.ObjectType).filter(models.ObjectType.id == pipeline.output_object_type_id).first()
    output_name = output_ot.display_name if output_ot else "Unknown"

    # Dispatch Async Task
    from tasks import run_pipeline_task
    
    # Set status to PENDING
    run.status = "PENDING"
    db.commit()
    
    # Dispatch to Celery
    run_pipeline_task.delay(
        pipeline_id=pipeline_id,
        input_names=input_names,
        output_name=output_name,
        code=pipeline.code
    )
    
    return run

@app.get("/pipelines/{pipeline_id}/runs", response_model=List[schemas.PipelineRun])
def get_pipeline_runs(pipeline_id: str, db: Session = Depends(get_db)):
    return db.query(models.PipelineRun).filter(models.PipelineRun.pipeline_id == pipeline_id).all()


@app.post("/pipelines/preview")
def preview_pipeline(
    code: str = Body(..., embed=True),
    input_object_types: List[str] = Body(..., embed=True),
    output_object_type_id: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Synchronously execute a pipeline for preview/debugging.
    """
    # Resolve Input Names
    input_names = []
    for type_id in input_object_types:
        ot = db.query(models.ObjectType).filter(models.ObjectType.id == type_id).first()
        if ot:
            input_names.append(ot.display_name) # Use display name as table name for now
        else:
            input_names.append(type_id)
            
    # Resolve Output Name
    output_ot = db.query(models.ObjectType).filter(models.ObjectType.id == output_object_type_id).first()
    output_name = output_ot.display_name if output_ot else "PreviewOutput"

    try:
        result = pipeline_engine.execute_pipeline(
            code=code,
            input_types=input_names,
            output_type=output_name
        )
        return result
    except Exception as e:
        return {"status": "FAILED", "logs": str(e)}

# --- Gotham Endpoints ---

@app.post("/gotham/missions")
def create_mission(mission: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    new_mission = models.Mission(
        title=mission.get("title", "Untitled Mission"),
        status=mission.get("status", "DRAFT"),
        layers=mission.get("layers", [])
    )
    db.add(new_mission)
    db.commit()
    db.refresh(new_mission)
    return new_mission

@app.get("/gotham/missions")
def list_missions(db: Session = Depends(get_db)):
    return db.query(models.Mission).all()

@app.post("/gotham/simulate")
def simulate_live_updates():
    """
    Simulate live movement of objects (e.g., Vessels).
    In a real app, this would be a WebSocket or Kafka stream.
    Here we randomly update coordinates in DuckDB.
    """
    try:
        # 1. Get all vessels
        vessels = duck_db.query_objects("Vessel")
        
        updated_count = 0
        import random
        
        for v in vessels:
            # Simulate small movement if lat/lon exist
            if "latitude" in v and "longitude" in v and v["latitude"] and v["longitude"]:
                try:
                    lat = float(v["latitude"])
                    lon = float(v["longitude"])
                    
                    # Random drift
                    new_lat = lat + random.uniform(-0.01, 0.01)
                    new_lon = lon + random.uniform(-0.01, 0.01)
                    
                    v["latitude"] = new_lat
                    v["longitude"] = new_lon
                    
                    # Update in DB
                    duck_db.insert_object("Vessel", v)
                    updated_count += 1
                except:
                    continue
                    
        return {"status": "UPDATED", "objects_moved": updated_count}
    except Exception as e:
        return {"status": "FAILED", "error": str(e)}

# --- Apollo Endpoints ---

@app.post("/apollo/deploy")
def trigger_deployment(env: str = Body(..., embed=True), version: str = Body(..., embed=True), db: Session = Depends(get_db)):
    # Create record
    dep = models.Deployment(
        environment=env,
        version=version,
        status="PENDING",
        logs="Initializing deployment..."
    )
    db.add(dep)
    db.commit()
    db.refresh(dep)
    
    # Trigger Async Task
    from tasks import simulate_deployment_task
    simulate_deployment_task.delay(dep.id)
    
    return dep

@app.get("/apollo/status")
def get_deployment_status(db: Session = Depends(get_db)):
    # Get latest deployment
    dep = db.query(models.Deployment).order_by(models.Deployment.created_at.desc()).first()
    if not dep:
        return {"status": "IDLE", "logs": "No recent deployments."}
    return dep
