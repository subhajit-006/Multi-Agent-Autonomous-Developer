from typing import Any, Dict, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from core.memory import SharedMemory

router = APIRouter(prefix="/session", tags=["session"])


class SessionInspectRequest(BaseModel):
    memory: Dict[str, Any] = Field(default_factory=dict)
    include_logs: bool = True
    include_errors: bool = True
    include_outputs: bool = True


@router.post("/inspect")
async def inspect_session(req: SessionInspectRequest) -> Dict[str, Any]:

    memory = SharedMemory(req.memory)
    data = memory.dump()

    # 🧠 Extract structured sections
    meta = {
        "run_id": data.get("run_id"),
        "status": data.get("status"),
        "current_step": data.get("current_step"),
        "last_active_agent": data.get("last_active_agent"),
    }

    logs = data.get("decision_log", []) if req.include_logs else []

    errors = {
        k: v for k, v in data.items()
        if "error" in k.lower()
    } if req.include_errors else {}

    outputs = {
        k: v for k, v in data.items()
        if k in ["plan", "architecture", "files", "debug_report", "test_cases"]
    } if req.include_outputs else {}

    # 🧾 Summary insight
    summary = {
        "total_keys": len(data.keys()),
        "log_entries": len(logs),
        "error_count": len(errors),
        "has_code": "files" in outputs,
        "has_tests": "test_cases" in outputs
    }

    return {
        "meta": meta,
        "summary": summary,
        "outputs": outputs,
        "errors": errors,
        "logs": logs,
        "raw_memory": data
    }