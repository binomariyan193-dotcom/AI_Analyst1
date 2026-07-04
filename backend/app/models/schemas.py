from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class ChatRequest(BaseModel):
    query: str
    session_id: str

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []

class DashboardData(BaseModel):
    executive_summary: str
    key_insights: List[str]
    important_metrics: Dict[str, Any]
    recommendations: List[str]
    charts: List[Dict[str, Any]]
    sentiment: Dict[str, Any] = {}
    risks: List[str] = []
    competitors: List[Dict[str, Any]] = []
    action_items: List[Dict[str, Any]] = []
    suggested_queries: List[str] = []
    growth_summary: str = ""
    growth_charts: List[Dict[str, Any]] = []

