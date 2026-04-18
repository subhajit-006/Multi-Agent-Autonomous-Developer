from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json
import time

from core.db import get_run_status

router = APIRouter()


async def event_generator(run_id: str):
    last_step = None
    last_status = None
    last_emit = time.monotonic()

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