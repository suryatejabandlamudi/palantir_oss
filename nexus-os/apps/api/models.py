from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid
from datetime import datetime

def generate_uuid():
    return str(uuid.uuid4())

# --- Metadata Layer (The Schema) ---

class ObjectType(Base):
    __tablename__ = "object_types"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    api_name = Column(String, unique=True, index=True) # e.g., "aircraft", "incident"
    display_name = Column(String) # e.g., "Aircraft", "Incident"
    description = Column(String, nullable=True)
    icon = Column(String, default="cube") # Lucide icon name
    color = Column(String, default="#3B82F6") # Hex color
    
    # Definition of properties for validation/UI rendering
    # Stored as JSON: [{"name": "speed", "type": "integer", "title": "Speed (km/h)"}, ...]
    property_definitions = Column(JSON, default=[])
    
    # Definition of actions available on this object type
    action_definitions = Column(JSON, default=[])

    objects = relationship("ObjectInstance", back_populates="object_type")

class LinkType(Base):
    __tablename__ = "link_types"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    api_name = Column(String, unique=True) # e.g., "aircraft_flown_by_pilot"
    display_name = Column(String) # e.g., "Flown By"
    source_object_type_id = Column(String, ForeignKey("object_types.id"))
    target_object_type_id = Column(String, ForeignKey("object_types.id"))
    cardinality = Column(String, default="MANY_TO_MANY") # ONE_TO_ONE, ONE_TO_MANY, MANY_TO_MANY

# --- Data Layer (The Instances) ---

class ObjectInstance(Base):
    __tablename__ = "object_instances"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    object_type_id = Column(String, ForeignKey("object_types.id"))
    
    # Primary display title (cached for performance)
    title = Column(String, index=True)
    
    # All properties stored as a JSON blob for flexibility
    # e.g., {"speed": 500, "tail_number": "N12345", "status": "active"}
    properties = Column(JSON, default={})
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    object_type = relationship("ObjectType", back_populates="objects")
    
    # Links
    links_outgoing = relationship("LinkInstance", foreign_keys="[LinkInstance.source_object_id]", back_populates="source_object")
    links_incoming = relationship("LinkInstance", foreign_keys="[LinkInstance.target_object_id]", back_populates="target_object")

class Pipeline(Base):
    __tablename__ = "pipelines"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    description = Column(String, nullable=True)
    code = Column(String) # Python code
    input_object_types = Column(JSON, default=[]) # List of Object Type IDs
    output_object_type_id = Column(String, ForeignKey("object_types.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class PipelineRun(Base):
    __tablename__ = "pipeline_runs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pipeline_id = Column(String, ForeignKey("pipelines.id"))
    status = Column(String) # PENDING, RUNNING, COMPLETED, FAILED
    logs = Column(String, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class LinkInstance(Base):
    __tablename__ = "link_instances"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    link_type_id = Column(String, ForeignKey("link_types.id"))
    source_object_id = Column(String, ForeignKey("object_instances.id"))
    target_object_id = Column(String, ForeignKey("object_instances.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    source_object = relationship("ObjectInstance", foreign_keys=[source_object_id], back_populates="links_outgoing")
    target_object = relationship("ObjectInstance", foreign_keys=[target_object_id], back_populates="links_incoming")

# --- Action Layer (The Logic) ---

class ActionExecution(Base):
    __tablename__ = "action_executions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    action_api_name = Column(String) # e.g., "change_status"
    target_object_id = Column(String, ForeignKey("object_instances.id"))
    
    # Parameters used for the action
    parameters = Column(JSON, default={})
    
    status = Column(String, default="COMPLETED") # PENDING, COMPLETED, FAILED
    user_id = Column(String, default="system")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

# --- AIP Layer (Agents) ---

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    description = Column(String)
    system_prompt = Column(Text)
    model = Column(String, default="gpt-4")
    
    # Tools available to the agent (list of Action API names)
    tools = Column(JSON, default=[])


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String, default="admin") # admin, hr, supply_chain, sales, it
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# --- Gotham Layer (Missions) ---

class Mission(Base):
    __tablename__ = "missions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String)
    status = Column(String, default="DRAFT") # DRAFT, ACTIVE, COMPLETED
    layers = Column(JSON, default=[]) # GeoJSON features or custom layer definitions
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

# --- Apollo Layer (Deployments) ---

class Deployment(Base):
    __tablename__ = "deployments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    environment = Column(String) # Staging, Production
    version = Column(String)
    status = Column(String, default="PENDING") # PENDING, DEPLOYING, HEALTHY, FAILED
    logs = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
