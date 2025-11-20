from typing import List, Optional, TypedDict

class Incident(TypedDict):
    sys_id: str
    number: str
    short_description: str
    description: str
    state: str
    priority: str
    assigned_to: Optional[str]
