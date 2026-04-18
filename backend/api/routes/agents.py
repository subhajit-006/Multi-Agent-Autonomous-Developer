from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from core.memory import SharedMemory
from services.agent_service import AgentService

router = APIRouter(prefix="/agent", tags=["agent"])

agent_service = AgentService()


class AgentRequest(BaseModel):
    agent: str
    memory: Dict[str, Any] = Field(default_factory=dict)
    task: Optional[str] = None
    scope: Optional[str] = None


# 🔥 STREAM DEBUG FUNCTION
async def debug_stream(agent: str, message: str):
    """
    Streams agent thoughts to console.
    Later this can be wired to SSE/WebSocket.
    """
    print(f"[{agent}] {message}", flush=True)


@router.post("/run")
async def run_agent(req: AgentRequest):

    # 🧠 Initialize memory (supports resume)
    memory = SharedMemory(req.memory)

    run_id = memory.read("run_id")

    # 🚦 Set execution state
    memory.set_status("running")
    memory.set_current_step(req.agent)

    # Inject task/scope only if provided
    if req.task:
        memory.write("task", req.task)

    if req.scope:
        memory.write("scope", req.scope)

    # 🚀 Execute agent WITH STREAMING
    try:
        result = await agent_service.run_agent(
            req.agent,
            memory,
            stream_callback=debug_stream   # 🔥 THIS IS THE FIX
        )
    except TypeError:
        # fallback if some agents don't support stream_callback yet
        result = await agent_service.run_agent(req.agent, memory)

    # 🛑 Update final status
    if result.get("status") == "failed":
        memory.set_status("failed")
    else:
        memory.set_status("completed")

    return {
        "run_id": run_id,
        "agent": req.agent,
        "status": memory.read("status"),
        "result": result,
        "memory": memory.dump()
    }