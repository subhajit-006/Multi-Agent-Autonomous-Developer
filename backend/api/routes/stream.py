from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json
import time

from core.db import get_run_status, get_latest_memory_snapshot

router = APIRouter()


async def event_generator(run_id: str):
    last_step = None
    last_status = None
    last_debug_marker = None
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

            if step != last_step or status != last_status:
                yield (
                    "event: progress\n"
                    f"data: {json.dumps({'run_id': run_id, 'step': step, 'status': status})}\n\n"
                )
                last_step = step
                last_status = status
                last_emit = time.monotonic()

            latest_snapshot = get_latest_memory_snapshot(run_id)
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

            if status in ["completed", "failed"]:
                yield (
                    "event: done\n"
                    f"data: {json.dumps({'run_id': run_id, 'status': status, 'step': step})}\n\n"
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