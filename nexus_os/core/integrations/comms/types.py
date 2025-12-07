from typing import List, Optional, TypedDict

class Message(TypedDict):
    id: str
    content: str
    sender: str
    createdDateTime: str

class Channel(TypedDict):
    id: str
    displayName: str
    description: Optional[str]
