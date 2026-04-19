from pathlib import Path
from typing import Any, Dict, List
import json

from fastapi import APIRouter, HTTPException


from core.db import get_run, get_memory_history, get_run_output, upsert_run_output
from core.file_validation import extract_valid_files

router = APIRouter(prefix="/runs", tags=["runs"])


def _safe_relative_path(filename: str) -> Path:
    # Normalize user/LLM-provided file paths and prevent path traversal.
    candidate = (filename or "").replace("\\", "/").strip()
    while candidate.startswith("/"):
        candidate = candidate[1:]
    if ":" in candidate:
        candidate = candidate.split(":", 1)[1]

    parts = [p for p in candidate.split("/") if p and p not in {".", ".."}]
    if not parts:
        return Path("unknown.txt")
    return Path(*parts)


def _extract_files_from_payload(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    latest_files: List[Dict[str, str]] = []
    latest_seen = False

    for step in payload.get("steps", []):
        raw_memory = step.get("memory")
        if isinstance(raw_memory, str):
            try:
                memory_obj = json.loads(raw_memory)
            except json.JSONDecodeError:
                memory_obj = {}
        elif isinstance(raw_memory, dict):
            memory_obj = raw_memory
        else:
            memory_obj = {}

        if "files" in memory_obj:
            latest_seen = True
            candidate = extract_valid_files(memory_obj.get("files"))
            latest_files = candidate

    if not latest_seen:
        return []

    return latest_files


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
        formatted.append(
            {
                "step": step,
                "memory": memory_json,  # still JSON string (safe for now)
                "timestamp": created_at,
            }
        )

    return {"run_id": run_id, "steps": formatted, "total_steps": len(formatted)}


# 🧾 Get final stored response payload
@router.get("/{run_id}/response")
async def get_run_response(run_id: str) -> Dict[str, Any]:

    stored = get_run_output(run_id)
    if stored:
        stored["files"] = _extract_files_from_payload(stored)
        return stored

    history = get_memory_history(run_id)
    if not history:
        raise HTTPException(
            status_code=404, detail="No stored response found for this run"
        )

    formatted: List[Dict[str, Any]] = []
    for step, memory_json, created_at in history:
        formatted.append(
            {
                "step": step,
                "memory": memory_json,
                "timestamp": created_at,
            }
        )

    payload = {
        "run_id": run_id,
        "steps": formatted,
        "total_steps": len(formatted),
    }
    payload["files"] = _extract_files_from_payload(payload)

    # Backfill for older runs that were created before run_outputs existed.
    upsert_run_output(run_id, payload)

    return payload


@router.post("/{run_id}/materialize")
async def materialize_run_files(run_id: str) -> Dict[str, Any]:
    payload = get_run_output(run_id)

    if not payload:
        history = get_memory_history(run_id)
        if not history:
            raise HTTPException(
                status_code=404, detail="No stored response found for this run"
            )

        steps = [
            {"step": step, "memory": memory_json, "timestamp": created_at}
            for step, memory_json, created_at in history
        ]
        payload = {"run_id": run_id, "steps": steps, "total_steps": len(steps)}
        upsert_run_output(run_id, payload)

    files = _extract_files_from_payload(payload)
    if not files:
        return {
            "run_id": run_id,
            "written_files": 0,
            "output_dir": None,
            "message": "No generated files found in run response",
        }

    backend_root = Path(__file__).resolve().parents[2]
    output_dir = backend_root / "generated_runs" / run_id
    output_dir.mkdir(parents=True, exist_ok=True)

    written = []
    for file_obj in files:
        rel = _safe_relative_path(file_obj.get("filename", "unknown.txt"))
        target = output_dir / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(str(file_obj.get("content", "")), encoding="utf-8")
        written.append(str(rel).replace("\\", "/"))

    return {
        "run_id": run_id,
        "written_files": len(written),
        "output_dir": str(output_dir),
        "files": written,
    }
