import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Analyst"
    API_V1_STR: str = "/api/v1"
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Qdrant
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_API_KEY: str | None = os.getenv("QDRANT_API_KEY", None)
    
    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Postgres
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ai_analyst.db")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
