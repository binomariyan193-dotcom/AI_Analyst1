from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from app.core.security import create_access_token
from app.db.database import get_db
from app.models.user import User
from sqlalchemy.orm import Session
from fastapi_sso.sso.google import GoogleSSO
from fastapi_sso.sso.github import GithubSSO
import os

router = APIRouter()

google_sso = GoogleSSO(
    client_id=os.getenv("GOOGLE_CLIENT_ID", "your_client_id"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET", "your_client_secret"),
    redirect_uri="http://localhost:8000/api/v1/auth/google/callback",
    allow_insecure_http=True,
)

github_sso = GithubSSO(
    client_id=os.getenv("GITHUB_CLIENT_ID", "your_client_id"),
    client_secret=os.getenv("GITHUB_CLIENT_SECRET", "your_client_secret"),
    redirect_uri="http://localhost:8000/api/v1/auth/github/callback",
    allow_insecure_http=True,
)

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# Mock user for MVP
MOCK_USER = {
    "email": "admin@example.com",
    "password": "password123"  # In a real app, this would be hashed
}

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # 1. Check if it's the mock admin user
    if request.email == MOCK_USER["email"] and request.password == MOCK_USER["password"]:
        access_token = create_access_token(subject=request.email)
        return {"access_token": access_token, "token_type": "bearer"}
        
    # 2. Check local database for users created via local signup
    user = db.query(User).filter(User.email == request.email).first()
    if user and user.hashed_password == request.password: # Simplified check for demonstration
        access_token = create_access_token(subject=user.email)
        return {"access_token": access_token, "token_type": "bearer"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

# --- GOOGLE OAUTH ---

@router.get("/google/login")
async def google_login():
    """Redirect the user to Google login page."""
    with google_sso:
        return await google_sso.get_login_redirect()

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Process Google login callback and return a JWT."""
    with google_sso:
        user_info = await google_sso.verify_and_process(request)
        
    # Create or update user in database
    user = db.query(User).filter(User.email == user_info.email).first()
    if not user:
        user = User(
            email=user_info.email,
            provider="google",
            provider_id=user_info.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate our internal JWT
    access_token = create_access_token(subject=user.email)
    
    # Redirect to the frontend callback page with the token
    # The frontend will grab the token from the URL and store it
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return RedirectResponse(f"{frontend_url}/auth/callback?token={access_token}")

# --- GITHUB OAUTH ---

@router.get("/github/login")
async def github_login():
    """Redirect the user to GitHub login page."""
    with github_sso:
        return await github_sso.get_login_redirect()

@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    """Process GitHub login callback and return a JWT."""
    with github_sso:
        user_info = await github_sso.verify_and_process(request)
        
    # GitHub email might be null in some cases depending on privacy settings, 
    # but we assume it's available for this implementation
    email = user_info.email or f"{user_info.id}@github.dummy"
    
    # Create or update user in database
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            provider="github",
            provider_id=user_info.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate our internal JWT
    access_token = create_access_token(subject=user.email)
    
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return RedirectResponse(f"{frontend_url}/auth/callback?token={access_token}")

