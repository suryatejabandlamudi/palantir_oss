from typing import List, Optional, TypedDict

class JiraIssue(TypedDict):
    id: str
    key: str
    summary: str
    status: str
    assignee: Optional[str]
    priority: str

class ConfluencePage(TypedDict):
    id: str
    title: str
    url: str
    excerpt: str
