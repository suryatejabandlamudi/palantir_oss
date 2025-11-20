from typing import List, Optional, TypedDict

class Worker(TypedDict):
    id: str
    descriptor: str  # Name
    primaryWorkEmail: str
    businessTitle: str
    supervisoryOrganization: str
    location: str
    isManager: bool
