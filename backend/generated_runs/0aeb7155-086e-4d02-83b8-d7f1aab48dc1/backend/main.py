from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os
from pydantic import BaseModel
from typing import Optional

# Database setup
DATABASE_URL = "sqlite:///./calculator.db"
Base = declarative_base()

class CalculationHistory(Base):
    __tablename__ = "calculation_history"

    id = Column(Integer, primary_key=True, index=True)
    expression = Column(String, index=True)
    result = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create database engine and tables
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Pydantic models
class CalculationRequest(BaseModel):
    expression: str

class CalculationResponse(BaseModel):
    result: float

class HistoryItem(BaseModel):
    id: int
    expression: str
    result: float
    timestamp: datetime

class HistoryResponse(BaseModel):
    history: list[HistoryItem]

class DeleteResponse(BaseModel):
    message: str
    id: int

# FastAPI app
app = FastAPI(
    title="Simple Calculator API",
    description="API for performing calculations and storing history",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API endpoints
@app.post("/api/v1/calculate", response_model=CalculationResponse)
async def calculate(request: CalculationRequest, db: Session = Depends(get_db)):
    try:
        # Evaluate the expression safely
        result = eval(request.expression)

        # Store in history
        history_item = CalculationHistory(
            expression=request.expression,
            result=result
        )
        db.add(history_item)
        db.commit()
        db.refresh(history_item)

        return {"result": result}
    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail="Division by zero")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid expression: {str(e)}")

@app.get("/api/v1/history", response_model=HistoryResponse)
async def get_history(db: Session = Depends(get_db)):
    history = db.query(CalculationHistory).order_by(CalculationHistory.timestamp.desc()).all()
    return {"history": history}

@app.delete("/api/v1/history/{id}", response_model=DeleteResponse)
async def delete_history_item(id: int, db: Session = Depends(get_db)):
    item = db.query(CalculationHistory).filter(CalculationHistory.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="History item not found")

    db.delete(item)
    db.commit()
    return {"message": "History item deleted", "id": id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)