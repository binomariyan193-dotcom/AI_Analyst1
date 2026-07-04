import json
import os
import operator
from typing import TypedDict, List, Dict, Any, Annotated
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from app.core.config import settings
from dotenv import load_dotenv

# Ensure env vars are loaded into os.environ for other langchain integrations if needed
load_dotenv()

# Initialize LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.2,
    google_api_key=settings.GEMINI_API_KEY
)

class AgentState(TypedDict):
    document_text: str
    metadata: Dict[str, Any]
    summary: str
    insights: List[str]
    metrics: Dict[str, Any]
    recommendations: List[str]
    charts: List[Dict[str, Any]]
    sentiment: Dict[str, Any]
    risks: List[str]
    competitors: List[Dict[str, Any]]
    action_items: List[Dict[str, Any]]
    errors: Annotated[List[str], operator.add]
    suggested_queries: List[str]
    growth_summary: str
    growth_charts: List[Dict[str, Any]]
    financial_advice: List[str]
    market_strategies: List[str]
    risk_mitigations: List[str]
    operational_improvements: List[str]
    marketing_campaigns: List[str]

# --- Nodes ---

def document_analysis_node(state: AgentState):
    """Analyzes the document in a single comprehensive step to reduce API requests and rate limit issues."""
    prompt = f"""
    You are an expert AI Business Analyst. Analyze the following document text and extract all required insights to populate a dashboard.
    
    Document Text:
    {state['document_text'][:50000]}  # Truncated for safety
    
    You must output strictly in JSON format with the following keys and values:
    {{
      "summary": "A short executive summary (max 3 sentences).",
      "insights": ["3-5 key business insights (list of strings)"],
      "metrics": {{
         "Important metrics as key-value pairs": "e.g., 'Total Revenue': '$1.2M'"
      }},
      "recommendations": ["2-3 strategic recommendations (list of strings)"],
      "charts": [
         {{
            "type": "chart type, one of 'line', 'bar', 'pie', 'area', 'hexbin'",
            "title": "chart title describing the metric",
            "data": [
               {{"name": "label", "value": number}} // Use this structure for line, bar, pie, area.
               // OR use {{"x": number, "y": number, "weight": number}} if type is 'hexbin'. Generate 10-15 data points for hexbins.
            ]
         }}
      ],
      "sentiment": {{
         "score": "overall sentiment score (Positive/Negative/Neutral)",
         "explanation": "brief explanation"
      }},
      "risks": ["3-5 potential business risks, threats, or vulnerabilities (list of strings)"],
      "competitors": [
         {{
            "name": "competitor name",
            "threat": "summary of the threat/context"
         }}
      ],
      "action_items": [
         {{
            "task": "description of the task",
            "owner": "potential owner (or 'Unassigned')",
            "deadline": "mentioned deadline (or 'None')"
         }}
      ],
      "suggested_queries": ["3 highly specific, interesting follow-up questions/prompts the user can ask about the data (list of strings)"],
      "growth_summary": "A concise summary of growth trends, trajectory, or future forecasts (2-3 sentences).",
      "growth_charts": [
         {{
            "type": "chart type, one of 'line', 'bar', 'pie', 'area' (prefer 'line' or 'area' for trends)",
            "title": "growth chart title",
            "data": [
               {{"name": "label", "value": number}}
            ]
         }}
      ]
    }}
    
    Ensure the JSON matches this structure exactly. Output only valid JSON. Do not include markdown code block syntax except wrapping it with ```json ... ```.
    """
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        # Clean markdown code block wraps
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        data = json.loads(content)
        
        return {
            "summary": data.get("summary", "Summary generation failed."),
            "insights": data.get("insights", []),
            "metrics": data.get("metrics", {}),
            "recommendations": data.get("recommendations", []),
            "charts": data.get("charts", []),
            "sentiment": data.get("sentiment", {}),
            "risks": data.get("risks", []),
            "competitors": data.get("competitors", []),
            "action_items": data.get("action_items", []),
            "suggested_queries": data.get("suggested_queries", []),
            "growth_summary": data.get("growth_summary", ""),
            "growth_charts": data.get("growth_charts", [])
        }
    except Exception as e:
        return {"errors": [f"Analysis Error: {str(e)}"]}

def financial_advice_node(state: AgentState):
    """Analyzes the extracted insights and metrics to provide strategic financial advice."""
    prompt = f"""
    You are an expert Financial Advisor. Based on the following business analysis and document summary, provide 3-5 specific, actionable financial recommendations or advice points.
    
    Summary: {state.get('summary')}
    Key Insights: {state.get('insights')}
    Important Metrics: {state.get('metrics')}
    
    You must output strictly in JSON format with the following structure:
    {{
      "financial_advice": ["3-5 financial recommendations (list of strings)"]
    }}
    
    Ensure the JSON matches this structure exactly. Output only valid JSON. Do not include markdown code block syntax except wrapping it with ```json ... ```.
    """
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        data = json.loads(content)
        return {"financial_advice": data.get("financial_advice", [])}
    except Exception as e:
        return {"errors": [f"Financial Advice Error: {str(e)}"]}

def market_strategy_node(state: AgentState):
    """Proposes go-to-market strategies and positioning based on competitors and insights."""
    prompt = f"""
    You are an expert Market Strategy Analyst. Based on the following business analysis, provide 3-5 specific, actionable market strategies or positioning recommendations.
    
    Summary: {state.get('summary')}
    Key Insights: {state.get('insights')}
    Competitors: {state.get('competitors')}
    
    You must output strictly in JSON format with the following structure:
    {{
      "market_strategies": ["3-5 market strategy recommendations (list of strings)"]
    }}
    
    Ensure the JSON matches this structure exactly. Output only valid JSON. Do not include markdown code block syntax except wrapping it with ```json ... ```.
    """
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        data = json.loads(content)
        return {"market_strategies": data.get("market_strategies", [])}
    except Exception as e:
        return {"errors": [f"Market Strategy Error: {str(e)}"]}

def risk_management_node(state: AgentState):
    """Proposes actionable mitigation strategies for identified business risks."""
    prompt = f"""
    You are an expert Risk Management Consultant. Based on the following business risks, provide 3-5 specific, actionable mitigation strategies.
    
    Identified Risks: {state.get('risks')}
    Summary: {state.get('summary')}
    
    You must output strictly in JSON format with the following structure:
    {{
      "risk_mitigations": ["3-5 risk mitigation strategies (list of strings)"]
    }}
    
    Ensure the JSON matches this structure exactly. Output only valid JSON. Do not include markdown code block syntax except wrapping it with ```json ... ```.
    """
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        data = json.loads(content)
        return {"risk_mitigations": data.get("risk_mitigations", [])}
    except Exception as e:
        return {"errors": [f"Risk Management Error: {str(e)}"]}

def operational_efficiency_node(state: AgentState):
    """Suggests operational improvements and workflow optimizations based on action items and metrics."""
    prompt = f"""
    You are an expert Operations Analyst. Based on the following metrics and action items, provide 3-5 specific, actionable operational improvements.
    
    Important Metrics: {state.get('metrics')}
    Action Items: {state.get('action_items')}
    
    You must output strictly in JSON format with the following structure:
    {{
      "operational_improvements": ["3-5 operational improvement recommendations (list of strings)"]
    }}
    
    Ensure the JSON matches this structure exactly. Output only valid JSON. Do not include markdown code block syntax except wrapping it with ```json ... ```.
    """
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        data = json.loads(content)
        return {"operational_improvements": data.get("operational_improvements", [])}
    except Exception as e:
        return {"errors": [f"Operational Efficiency Error: {str(e)}"]}

def marketing_branding_node(state: AgentState):
    """Proposes targeted marketing campaigns or branding adjustments based on sentiment and summary."""
    prompt = f"""
    You are an expert Marketing & Branding Strategist. Based on the following overall sentiment and summary, provide 3-5 specific marketing campaigns or branding recommendations.
    
    Summary: {state.get('summary')}
    Sentiment Analysis: {state.get('sentiment')}
    
    You must output strictly in JSON format with the following structure:
    {{
      "marketing_campaigns": ["3-5 marketing or branding recommendations (list of strings)"]
    }}
    
    Ensure the JSON matches this structure exactly. Output only valid JSON. Do not include markdown code block syntax except wrapping it with ```json ... ```.
    """
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        data = json.loads(content)
        return {"marketing_campaigns": data.get("marketing_campaigns", [])}
    except Exception as e:
        return {"errors": [f"Marketing Branding Error: {str(e)}"]}

def build_workflow():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("analysis", document_analysis_node)
    workflow.add_node("financial_advice", financial_advice_node)
    workflow.add_node("market_strategy", market_strategy_node)
    workflow.add_node("risk_management", risk_management_node)
    workflow.add_node("operational_efficiency", operational_efficiency_node)
    workflow.add_node("marketing_branding", marketing_branding_node)
    
    workflow.set_entry_point("analysis")
    
    workflow.add_edge("analysis", "financial_advice")
    workflow.add_edge("financial_advice", "market_strategy")
    workflow.add_edge("market_strategy", "risk_management")
    workflow.add_edge("risk_management", "operational_efficiency")
    workflow.add_edge("operational_efficiency", "marketing_branding")
    workflow.add_edge("marketing_branding", END)
    
    return workflow.compile()

# Global compiled graph
app_workflow = build_workflow()

def process_document_workflow(file_path: str, filename: str) -> Dict[str, Any]:
    from app.services.document_processor.processor import process_document
    
    # 1. Process document
    doc_data = process_document(file_path)
    
    # 2. Initialize State
    initial_state = AgentState(
        document_text=doc_data["text"],
        metadata=doc_data["metadata"],
        summary="",
        insights=[],
        metrics={},
        recommendations=[],
        charts=[],
        sentiment={},
        risks=[],
        competitors=[],
        action_items=[],
        errors=[],
        suggested_queries=[],
        growth_summary="",
        growth_charts=[],
        financial_advice=[],
        market_strategies=[],
        risk_mitigations=[],
        operational_improvements=[],
        marketing_campaigns=[]
    )
    
    # 3. Run Graph
    result_state = app_workflow.invoke(initial_state)
    
    return result_state
