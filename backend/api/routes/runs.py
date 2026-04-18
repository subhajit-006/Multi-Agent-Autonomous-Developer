from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException


from core.db import get_run, get_memory_history

router = APIRouter(prefix="/runs", tags=["runs"])


# 🧠 Get run status
@router.get("/{run_id}")
async def get_run_status(run_id: str) -> Dict[str, Any]:

    run = get_run(run_id)

    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    return {
        "run_id": run[0],
        "status": run[1],
        "current_step": run[2],
        "created_at": run[3],
        "updated_at": run[4],
    }


# 📦 Get full execution history
@router.get("/{run_id}/history")
async def get_run_history(run_id: str) -> Dict[str, Any]:

    history = get_memory_history(run_id)

    if not history:
        raise HTTPException(status_code=404, detail="No history found for this run")

    formatted: List[Dict[str, Any]] = []

    for step, memory_json, created_at in history:
        formatted.append({
            "step": step,
            "memory": memory_json,  # still JSON string (safe for now)
            "timestamp": created_at
        })

    return {
        "run_id": run_id,
        "steps": formatted,
        "total_steps": len(formatted)
    }