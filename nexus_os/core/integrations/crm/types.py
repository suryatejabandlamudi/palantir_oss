from typing import List, Optional, TypedDict

class Opportunity(TypedDict):
    Id: str
    Name: str
    Amount: Optional[float]
    StageName: str
    CloseDate: str
    AccountId: Optional[str]

class Quote(TypedDict):
    Id: str
    Name: str
    GrandTotal: float
    Status: str
    OpportunityId: str
