# services/orchestrator.py

try:
    from backend.services.pipeline_service import PipelineService
except ModuleNotFoundError:
    from services.pipeline_service import PipelineService


class Orchestrator:

    def __init__(self):
        self.pipeline = PipelineService()

    async def execute(self, task: str, scope: str):

        default_flow = [
            "planner",
            "architect",
            "developer",
            "debugger",
            "tester"
        ]

        return await self.pipeline.run_pipeline(
            task=task,
            scope=scope,
            flow=default_flow
        )