from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json

from core.db import get_run_status

router = APIRouter()


async def event_generator(run_id: str):
    last_step = None

    while True:
        run = get_run_status(run_id)

        if not run:
            yield f"data: {json.dumps({'error': 'run not found'})}\n\n"
            return

        step = run["current_step"]
        status = run["status"]

        if step != last_step:
            yield f"data: {json.dumps({'step': step, 'status': status})}\n\n"
            last_step = step

        if status in ["completed", "failed"]:
            yield f"data: {json.dumps({'status': status})}\n\n"
            break

        await asyncio.sleep(1)


@router.get("/stream/{run_id}")
async def stream(run_id: str):
    return StreamingResponse(
        event_generator(run_id),
        media_type="text/event-stream"
    )