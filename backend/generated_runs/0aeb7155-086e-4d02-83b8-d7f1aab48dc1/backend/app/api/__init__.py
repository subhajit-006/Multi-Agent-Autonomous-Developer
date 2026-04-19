from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.models.calculation import CalculationHistory
from app.schemas.calculation import CalculationRequest, CalculationResponse, HistoryItem, HistoryResponse, DeleteResponse
from app.db.session import get_db

router = APIRouter()

@router.post("/calculate", response_model=CalculationResponse)
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

@router.get("/history", response_model=HistoryResponse)
async def get_history(db: Session = Depends(get_db)):
    history = db.query(CalculationHistory).order_by(CalculationHistory.timestamp.desc()).all()
    return {"history": history}

@router.delete("/history/{id}", response_model=DeleteResponse)
async def delete_history_item(id: int, db: Session = Depends(get_db)):
    item = db.query(CalculationHistory).filter(CalculationHistory.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="History item not found")

    db.delete(item)
    db.commit()
    return {"message": "History item deleted", "id": id}