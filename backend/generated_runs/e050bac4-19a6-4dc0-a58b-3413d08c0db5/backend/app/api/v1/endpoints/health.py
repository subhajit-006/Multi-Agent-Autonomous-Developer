from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import sqlite3
from pathlib import Path
import os

# Database setup
DB_PATH = Path(__file__).parent.parent.parent.parent / "data" / "submissions.db"
os.makedirs(DB_PATH.parent, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
    finally:
        conn.close()

# Models
class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    database_status: str

# Router
router = APIRouter(prefix="/api/v1")

@router.get("/health", response_model=HealthResponse)
async def health_check():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow(),
            "database_status": "connected"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "unhealthy",
                "timestamp": datetime.utcnow(),
                "database_status": f"error: {str(e)}"
            }
        )