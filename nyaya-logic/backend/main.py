"""Nyāya-Logic FastAPI backend."""

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .analyzer import analyze_argument
from .models import AnalyzeRequest, AnalyzeResponse

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app = FastAPI(
    title="Nyāya-Logic",
    description="Classical Indian Nyāya epistemological argument analyzer",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "nyaya-logic"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(body: AnalyzeRequest) -> AnalyzeResponse:
    return await analyze_argument(body.argument)


@app.get("/")
async def serve_frontend() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")


if FRONTEND_DIR.is_dir():
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")
