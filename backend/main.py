from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import extraction, reasoning, analytics, report, generate_report
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run database initialization on startup
    init_db()
    yield

app = FastAPI(title="Medical Data API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        "service": "File Data Extraction API",
        "vision_model": "Groq LLaVA 1.5 7B"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
