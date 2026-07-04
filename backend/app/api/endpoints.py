from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from typing import List, Dict, Any
import uuid
import os
from app.models.schemas import ChatRequest, ChatResponse, DashboardData
from app.services.langgraph_agents.agents import process_document_workflow
from app.services.rag_service import index_document, query_document

router = APIRouter()

# In-memory storage for MVP
dashboard_state = {}

@router.post("/upload", response_model=Dict[str, Any])
async def upload_document(file: UploadFile = File(...)):
    try:
        # Save file temporarily
        import tempfile
        temp_dir = os.path.join(tempfile.gettempdir(), "ai_analyst")
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
            
        # Run workflow
        result = process_document_workflow(file_path, file.filename)
        
        # Store in global state
        global dashboard_state
        dashboard_state = result
        
        # Build RAG Index
        if "document_text" in result:
            index_document(result["document_text"])
        
        if result.get("errors"):
            raise Exception(" | ".join(result["errors"]))
            
        return {"status": "success", "message": f"Document {file.filename} processed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard():
    if not dashboard_state:
        # Return empty/default if nothing uploaded yet
        return DashboardData(
            executive_summary="No document analyzed yet. Please upload a document.",
            key_insights=[],
            important_metrics={},
            recommendations=[],
            charts=[],
            sentiment={},
            risks=[],
            competitors=[],
            action_items=[],
            suggested_queries=[],
            growth_summary="",
            growth_charts=[]
        )
        
    return DashboardData(
        executive_summary=dashboard_state.get("summary", ""),
        key_insights=dashboard_state.get("insights", []),
        important_metrics=dashboard_state.get("metrics", {}),
        recommendations=dashboard_state.get("recommendations", []),
        charts=dashboard_state.get("charts", []),
        sentiment=dashboard_state.get("sentiment", {}),
        risks=dashboard_state.get("risks", []),
        competitors=dashboard_state.get("competitors", []),
        action_items=dashboard_state.get("action_items", []),
        suggested_queries=dashboard_state.get("suggested_queries", []),
        growth_summary=dashboard_state.get("growth_summary", ""),
        growth_charts=dashboard_state.get("growth_charts", [])
    )

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # RAG powered chat
    from app.services.langgraph_agents.agents import llm
    from langchain_core.messages import HumanMessage
    
    # Retrieve relevant chunks using RAG
    context = query_document(request.query, k=5)
    
    prompt = f"""
    You are an AI Analyst assistant. Answer the user's question based on the retrieved document context below.
    If the answer cannot be found in the context, state that you do not have enough information.
    
    Context: 
    {context}
    
    User Query: {request.query}
    """
    
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        response_text = response.content
    except Exception as e:
        response_text = f"An error occurred while generating the response: {str(e)}\n\nThis is commonly caused by exceeding your Gemini API quota."
    
    return ChatResponse(
        response=response_text,
        sources=["RAG Retrieval"]
    )
