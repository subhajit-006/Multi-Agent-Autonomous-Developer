import time
from typing import Dict, Any, Callable

try:
    from backend.core.memory import SharedMemory
except ModuleNotFoundError:
    from core.memory import SharedMemory

from agents.planner import run_planner
from agents.architect import run_architect
from agents.developer import run_developer
from agents.debugger import run_debugger
from agents.tester import run_tester


AGENT_REGISTRY: Dict[str, tuple[Callable, str]] = {
    "planner": (run_planner, "plan"),
    "architect": (run_architect, "architecture"),
    "developer": (run_developer, "files"),
    "debugger": (run_debugger, "debug_report"),
    "tester": (run_tester, "test_cases"),
}


class AgentService:

    async def run_agent(
        self,
        agent_name: str,
        memory: SharedMemory,
        max_retries: int = 3
    ) -> Dict[str, Any]:

        run_id = memory.read("run_id")

        if agent_name not in AGENT_REGISTRY:
            return {
                "run_id": run_id,
                "agent": agent_name,
                "status": "failed",
                "error": f"Invalid agent: {agent_name}",
                "attempts": 0
            }

        agent_func, output_key = AGENT_REGISTRY[agent_name]

        start_time = time.time()
        last_error = None

        for attempt in range(1, max_retries + 1):
            try:
                # 🧠 Attach retry context
                if last_error:
                    memory.write(f"{agent_name}_error_context", last_error)

                memory.write("last_active_agent", agent_name)

                result = await agent_func(memory)

                # 📦 Store result
                memory.write(output_key, result)

                return {
                    "run_id": run_id,
                    "agent": agent_name,
                    "status": "success",
                    "output_key": output_key,
                    "output": result,
                    "attempts": attempt,
                    "duration": round(time.time() - start_time, 2)
                }

            except Exception as e:
                last_error = str(e)

                # 🧾 Log failure into memory
                memory.write(f"{agent_name}_last_error", last_error)

        # ❌ Final failure after retries
        memory.write(output_key, None)

        return {
            "run_id": run_id,
            "agent": agent_name,
            "status": "failed",
            "error": last_error,
            "attempts": max_retries,
            "duration": round(time.time() - start_time, 2)
        }