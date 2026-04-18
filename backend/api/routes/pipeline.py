from typing import Any, Dict, List, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

import asyncio

from services.pipeline_service import PipelineService
from services.agent_service import AGENT_REGISTRY

# 🔥 NEW IMPORTS
from core.memory import SharedMemory
from core.db import upsert_run

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

pipeline_service = PipelineService()


class PipelineRequest(BaseModel):
    task: str = Field(..., description="Plain-English build request")
    scope: Literal["minimal", "standard", "full"] = "standard"
    flow: List[str] = Field(
        default_factory=lambda: ["planner", "architect", "developer", "debugger", "tester"],
        description="Ordered agent execution list"
    )


# 🧠 Basic dependency validation
def validate_flow(flow: List[str]):

    required_order = {
        "architect": ["planner"],
        "developer": ["planner", "architect"],
        "debugger": ["developer"],
        "tester": ["developer"]
    }

    seen = set()

    for agent in flow:
        if agent not in AGENT_REGISTRY:
            raise HTTPException(status_code=400, detail=f"Invalid agent: {agent}")

        if agent in required_order:
            for dep in required_order[agent]:
                if dep not in seen:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Agent '{agent}' requires '{dep}' before it."
                    )

        seen.add(agent)


@router.post("/run")
async def run_pipeline(req: PipelineRequest) -> Dict[str, Any]:

    # 🚨 Validate flow
    validate_flow(req.flow)

    # 🧠 CREATE MEMORY FIRST (THIS IS THE KEY FIX)
    memory = SharedMemory()
    memory.write("task", req.task)
    memory.write("scope", req.scope)
    memory.set_status("running")

    run_id = memory.read("run_id")

    # 🔥 Persist initial state
    upsert_run(run_id, "running", "init")

    # 🚀 Run pipeline in background (NON-BLOCKING)
    asyncio.create_task(
        pipeline_service.run_pipeline(
            task=req.task,
            scope=req.scope,
            flow=req.flow,
            memory=memory  
        )
    )

    return {
        "run_id": run_id,
        "status": "started"
    }