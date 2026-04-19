from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import sqlite3
import os
from pathlib import Path

# Database setup
DB_PATH = Path(__file__).parent.parent / "data" / "submissions.db"
os.makedirs(DB_PATH.parent, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
    finally:
        conn.close()

# Initialize database
def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS form_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_agent TEXT,
            ip_address TEXT
        )
        """)
        conn.commit()

# Models
class FormSubmitRequest(BaseModel):
    email: EmailStr

class FormSubmissionResponse(BaseModel):
    id: int
    email: str
    timestamp: datetime
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    database_status: str

# Initialize FastAPI app
app = FastAPI(
    title="Self-Contained Landing Page API",
    description="Backend API for the self-contained landing page project",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# API Endpoints
@app.get("/api/v1/health", response_model=HealthResponse)
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

@app.post("/api/v1/forms/submit", response_model=FormSubmissionResponse)
async def submit_form(
    request: FormSubmitRequest,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None
):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO form_submissions (email, user_agent, ip_address)
                VALUES (?, ?, ?)
                """,
                (request.email, user_agent, ip_address)
            )
            conn.commit()

            # Get the inserted record
            cursor.execute(
                """
                SELECT id, email, timestamp, user_agent, ip_address
                FROM form_submissions
                WHERE id = last_insert_rowid()
                """
            )
            result = cursor.fetchone()

            if not result:
                raise HTTPException(status_code=500, detail="Failed to retrieve submission")

            return {
                "id": result[0],
                "email": result[1],
                "timestamp": datetime.fromisoformat(result[2]),
                "user_agent": result[3],
                "ip_address": result[4]
            }
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Email already submitted"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/api/v1/forms/submissions", response_model=List[FormSubmissionResponse])
async def get_submissions():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, email, timestamp, user_agent, ip_address
                FROM form_submissions
                ORDER BY timestamp DESC
                """
            )
            results = cursor.fetchall()

            return [
                {
                    "id": row[0],
                    "email": row[1],
                    "timestamp": datetime.fromisoformat(row[2]),
                    "user_agent": row[3],
                    "ip_address": row[4]
                }
                for row in results
            ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )