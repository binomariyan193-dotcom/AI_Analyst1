import os
from typing import List, Dict, Any
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from app.core.config import settings

# Global vector store
vector_store = None

def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-2",
        google_api_key=settings.GEMINI_API_KEY
    )

def index_document(text: str) -> bool:
    """Chunks the document text and indexes it in the in-memory Qdrant vector store."""
    global vector_store
    
    if not text or not text.strip():
        return False
        
    try:
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_text(text)
        
        # Create embeddings and store in Qdrant (in-memory)
        embeddings = get_embeddings()
        vector_store = QdrantVectorStore.from_texts(
            texts=chunks,
            embedding=embeddings,
            location=":memory:",
            collection_name="ai-analyst"
        )
        
        return True
    except Exception as e:
        print(f"Error indexing document: {str(e)}")
        return False

def query_document(query: str, k: int = 4) -> str:
    """Queries the vector store for the top k most relevant chunks."""
    global vector_store
    
    if not vector_store:
        return "No document has been indexed yet."
        
    try:
        # Perform similarity search
        docs = vector_store.similarity_search(query, k=k)
        
        # Combine the retrieved chunks into a single context string
        context = "\n\n---\n\n".join([doc.page_content for doc in docs])
        return context
    except Exception as e:
        print(f"Error querying document: {str(e)}")
        return f"Error retrieving context: {str(e)}"
