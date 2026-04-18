from typing import Any, Dict, List, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


from services.pipeline_service import PipelineService
from services.agent_service import AGENT_REGISTRY

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

pipeline_service = PipelineService()


class PipelineRequest(BaseModel):
    task: str = Field(..., description="Plain-English build request")
    scope: Literal["minimal", "standard", "full"] = "standard"
    flow: List[str] = Field(
        default_factory=lambda: ["planner", "architect", "developer", "debugger", "tester"],
        description="Ordered agent execution list"
    )


# 🧠 Basic dependency validation (keeps chaos in check)
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
                        detail=f"Agent '{agent}' requires '{dep}' to run before it."
                    )

        seen.add(agent)


@router.post("/run")
async def run_pipeline(req: PipelineRequest) -> Dict[str, Any]:

    # 🚨 Validate flow before execution
    validate_flow(req.flow)

    result = await pipeline_service.run_pipeline(
        task=req.task,
        scope=req.scope,
        flow=req.flow,
    )

    return {
        "run_id": result.get("run_id"),
        "status": result.get("status"),
        "duration": result.get("total_time"),
        "failed_step": result.get("failed_step"),
        "results": result.get("results"),
        "memory": result.get("memory"),
    }