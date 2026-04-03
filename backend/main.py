# ── Load .env from project root before any module (Groq/Qdrant) reads env vars
import os
from pathlib import Path
from dotenv import load_dotenv
_env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=False)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import extraction, reasoning, analytics, report, generate_report
from database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Jeevan ICU Sepsis Detection API",
    description="AI-assisted early sepsis detection for ICU monitoring",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Core feature routers ──────────────────────────────────────────
app.include_router(extraction.router)
app.include_router(reasoning.router)
app.include_router(analytics.router)
app.include_router(report.router)
app.include_router(generate_report.report_router)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Jeevan ICU Sepsis Detection API",
        "version": "2.0.0",
        "endpoints": [
            "POST /extract",
            "POST /reason-medical",
            "GET  /api/patients",
            "GET  /api/patients/{id}",
            "GET  /api/patients/{id}/vitals",
            "GET  /api/patients/{id}/labs",
            "GET  /api/patients/{id}/timeline",
            "GET  /api/patients/{id}/risk-assessment",
            "GET  /api/alerts",
            "POST /api/alerts/{id}/dismiss",
            "GET  /api/handover",
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
