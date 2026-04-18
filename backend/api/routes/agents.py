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

    # 🚀 Execute agent
    result = await agent_service.run_agent(req.agent, memory)

    # 🛑 Update final status
    if result["status"] == "failed":
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
