# AI Analyst - Agentic RAG Platform

AI Analyst is a production-ready full-stack application that acts as an Agentic RAG (Retrieval Augmented Generation) platform. Users can upload documents (PDF, DOCX, CSV, XLSX) and the system automatically analyzes the content, generates summaries, visualizations, recommendations, and future trend predictions.

## Architecture

*   **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, ShadCN UI, Recharts
*   **Backend**: FastAPI, Python 3.12+
*   **AI/Orchestration**: LangGraph, LangChain, Gemini 2.5 Flash
*   **Database (Configured for)**: PostgreSQL & Qdrant (Local testing falls back to in-memory/SQLite for ease of use)

## Prerequisites

*   Node.js (v20+)
*   Python 3.10+
*   Docker (Optional, for Vector DB & Postgres)

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
QDRANT_URL=http://localhost:6333
DATABASE_URL=sqlite:///./ai_analyst.db
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Running Infrastructure (Optional)

If you wish to use Qdrant and PostgreSQL natively:

```bash
docker-compose up -d
```

## Features

1.  **Multi-Format Document Upload**: Process PDFs, CSVs, and Excel files natively using PyMuPDF and Pandas.
2.  **Agentic RAG Workflow**: A multi-agent LangGraph workflow processes the document, extracts KPIs, and determines the best way to visualize the data.
3.  **Dynamic Visualizations**: Recharts integration dynamically creates Line, Bar, Pie, and Area charts based on LLM outputs.
4.  **Interactive AI Chat**: Ask questions about the uploaded document and receive context-aware responses.

## Future Roadmap

*   Implement Prophet forecasting for time-series anomaly detection.
*   Persistent document history using PostgreSQL.
*   Full Supabase Auth integration.
*   Deploy on Vercel (Frontend) and Railway (Backend).
