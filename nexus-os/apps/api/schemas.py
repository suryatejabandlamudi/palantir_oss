from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Metadata Schemas ---

class PropertyDefinition(BaseModel):
    name: str
    type: str # string, integer, boolean, date, geopoint
    title: str
    description: Optional[str] = None

class ObjectTypeBase(BaseModel):
    api_name: str
    display_name: str
    description: Optional[str] = None
    icon: Optional[str] = "cube"
    color: Optional[str] = "#3B82F6"
    property_definitions: List[PropertyDefinition] = []
    action_definitions: List[Any] = []

class ObjectTypeCreate(ObjectTypeBase):
    pass

class ObjectType(ObjectTypeBase):
    id: str
    class Config:
        orm_mode = True

class LinkTypeBase(BaseModel):
    api_name: str
    display_name: str
    source_object_type_id: str
    target_object_type_id: str
    cardinality: str = "MANY_TO_MANY"

class LinkTypeCreate(LinkTypeBase):
    pass

class LinkType(LinkTypeBase):
    id: str
    class Config:
        orm_mode = True

# --- Data Schemas ---

class ObjectInstanceBase(BaseModel):
    title: str
    properties: Dict[str, Any] = {}

class ObjectInstanceCreate(ObjectInstanceBase):
    object_type_id: str

class ObjectInstance(ObjectInstanceBase):
    id: str
    object_type_id: str
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        orm_mode = True

class LinkInstanceCreate(BaseModel):
    link_type_id: str
    source_object_id: str
    target_object_id: str

class LinkInstance(LinkInstanceCreate):
    id: str
    created_at: datetime
    class Config:
        orm_mode = True

# --- Action/AIP Schemas ---

class ActionExecutionCreate(BaseModel):
    action_api_name: str
    target_object_id: str
    parameters: Dict[str, Any] = {}

class ActionExecution(ActionExecutionCreate):
    id: str
    status: str
    user_id: str
    timestamp: datetime
    class Config:
        orm_mode = True

class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    system_prompt: str
    model: Optional[str] = "gpt-4"
    tools: List[str] = []

class AgentCreate(AgentBase):
    pass

class Agent(AgentBase):
    id: str
    class Config:
        orm_mode = True


class Agent(AgentBase):
    id: str
    class Config:
        orm_mode = True

# --- Pipeline Schemas ---

class PipelineBase(BaseModel):
    title: str
    description: Optional[str] = None
    code: str
    input_object_types: List[str] = []
    output_object_type_id: str

class PipelineCreate(PipelineBase):
    pass

class Pipeline(PipelineBase):
    id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True

class PipelineRunBase(BaseModel):
    pipeline_id: str

class PipelineRun(PipelineRunBase):
    id: str
    status: str
    logs: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]
    class Config:
        orm_mode = True

# --- Auth Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime
    class Config:
        orm_mode = True
