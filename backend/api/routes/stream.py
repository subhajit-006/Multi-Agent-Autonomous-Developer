from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json
import time
from typing import Any, Dict, List

from core.db import get_run_status, get_latest_memory_snapshot
from core.file_validation import extract_valid_files

router = APIRouter()


def _infer_language(filename: str) -> str:
    if not isinstance(filename, str):
        return "text"
    name = filename.lower()
    if "." not in name:
        return "text"
    ext = name.rsplit(".", 1)[-1]
    language_map = {
        "py": "python",
        "js": "javascript",
        "jsx": "jsx",
        "ts": "typescript",
        "tsx": "tsx",
        "json": "json",
        "md": "markdown",
        "html": "html",
        "css": "css",
        "yml": "yaml",
        "yaml": "yaml",
        "sh": "bash",
        "txt": "text",
    }
    return language_map.get(ext, ext)


def _extract_files_from_memory(memory: Dict[str, Any]) -> List[Dict[str, str]]:
    if not isinstance(memory, dict):
        return []

    valid = extract_valid_files(memory.get("files"))
    dedup: Dict[str, Dict[str, str]] = {}
    for item in valid:
        filename = item["filename"]
        dedup[filename] = {
            "filename": filename,
            "language": _infer_language(filename),
            "content": item["content"],
        }

    return list(dedup.values())


async def event_generator(run_id: str):
    last_step = None
    last_status = None
    last_debug_marker = None
    last_files_marker = None
    last_emit = time.monotonic()

    def _trim(value: str, limit: int = 240):
        if not value:
            return value
        if len(value) <= limit:
            return value
        return value[:limit] + "..."

    # Hint reconnect delay for EventSource clients.
    yield "retry: 2000\n\n"
    yield f"event: connected\ndata: {json.dumps({'run_id': run_id, 'status': 'listening'})}\n\n"

    while True:
        try:
            run = get_run_status(run_id)

            if not run:
                yield f"event: error\ndata: {json.dumps({'run_id': run_id, 'error': 'run not found'})}\n\n"
                return

            step = run.get("current_step")
            status = run.get("status")

            latest_snapshot = get_latest_memory_snapshot(run_id)
            latest_files = []
            latest_snapshot_step = None
            if latest_snapshot:
                latest_snapshot_step = latest_snapshot.get("step")
                latest_files = _extract_files_from_memory(latest_snapshot.get("memory") or {})

            if step != last_step or status != last_status:
                progress_payload = {
                    "run_id": run_id,
                    "step": step,
                    "status": status,
                }
                if latest_snapshot_step:
                    progress_payload["snapshot_step"] = latest_snapshot_step

                # Emit files during active pipeline transitions so UI updates after developer,
                # then updates again after debugger modifies code.
                if latest_files:
                    progress_payload["files"] = latest_files
                    progress_payload["files_count"] = len(latest_files)

                yield (
                    "event: progress\n"
                    f"data: {json.dumps(progress_payload)}\n\n"
                )
                last_step = step
                last_status = status
                last_emit = time.monotonic()

            if latest_snapshot:
                memory = latest_snapshot.get("memory") or {}
                developer_state = memory.get("developer_state")
                developer_attempt = memory.get("developer_attempt")
                developer_error = memory.get("developer_last_error")
                developer_traceback = memory.get("developer_last_traceback")

                marker = f"{latest_snapshot.get('created_at')}|{developer_state}|{developer_attempt}|{developer_error}"
                should_emit_debug = (
                    developer_state is not None
                    or (step is not None and str(step).startswith("developer"))
                    or (latest_snapshot.get("step") or "").startswith("developer")
                )

                if should_emit_debug and marker != last_debug_marker:
                    payload = {
                        "run_id": run_id,
                        "current_step": step,
                        "snapshot_step": latest_snapshot.get("step"),
                        "developer_state": developer_state,
                        "developer_attempt": developer_attempt,
                        "developer_last_error": _trim(developer_error),
                        "developer_last_traceback": _trim(developer_traceback, 600),
                        "snapshot_timestamp": latest_snapshot.get("created_at"),
                    }
                    yield f"event: developer_debug\ndata: {json.dumps(payload)}\n\n"
                    last_debug_marker = marker
                    last_emit = time.monotonic()

                files_marker = (
                    f"{latest_snapshot.get('created_at')}|"
                    f"{latest_snapshot.get('step')}|"
                    f"{len(latest_files)}"
                )
                if latest_files and files_marker != last_files_marker:
                    yield (
                        "event: files\n"
                        f"data: {json.dumps({'run_id': run_id, 'snapshot_step': latest_snapshot.get('step'), 'files': latest_files, 'files_count': len(latest_files)})}\n\n"
                    )
                    last_files_marker = files_marker
                    last_emit = time.monotonic()

            if status in ["completed", "failed"]:
                done_payload = {"run_id": run_id, "status": status, "step": step}
                if latest_snapshot_step:
                    done_payload["snapshot_step"] = latest_snapshot_step
                if latest_files:
                    done_payload["files"] = latest_files
                    done_payload["files_count"] = len(latest_files)
                yield (
                    "event: done\n"
                    f"data: {json.dumps(done_payload)}\n\n"
                )
                break

            # Keep long-lived SSE connections alive through proxies/load balancers.
            if time.monotonic() - last_emit >= 15:
                yield "event: heartbeat\ndata: {\"ok\":true}\n\n"
                last_emit = time.monotonic()

            await asyncio.sleep(1)
        except Exception as exc:
            yield (
                "event: error\n"
                f"data: {json.dumps({'run_id': run_id, 'error': str(exc)})}\n\n"
            )
            return


@router.get("/stream/{run_id}")
async def stream(run_id: str):
    return StreamingResponse(
        event_generator(run_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )