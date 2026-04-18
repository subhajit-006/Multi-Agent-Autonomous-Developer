import logging
import time
import traceback
from typing import Dict, Any, Callable

from core.memory import SharedMemory
from core.db import upsert_run, save_memory_snapshot

from agents.planner import run_planner
from agents.architect import run_architect
from agents.developer import run_developer
from agents.debugger import run_debugger
from agents.tester import run_tester


logger = logging.getLogger(__name__)


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
        last_traceback = None

        logger.info("Agent '%s' started (run_id=%s, max_retries=%s)", agent_name, run_id, max_retries)

        for attempt in range(1, max_retries + 1):
            try:
                # 🧠 Attach retry context
                if last_error:
                    memory.write(f"{agent_name}_error_context", last_error)
                if last_traceback:
                    memory.write(f"{agent_name}_error_traceback", last_traceback)

                memory.write("last_active_agent", agent_name)

                if agent_name == "developer":
                    memory.write("developer_attempt", attempt)
                    memory.write("developer_state", "running")
                    upsert_run(run_id, "running", f"developer:attempt:{attempt}")
                    logger.info("Developer attempt %s/%s started (run_id=%s)", attempt, max_retries, run_id)

                result = await agent_func(memory)

                # 📦 Store result
                memory.write(output_key, result)

                if agent_name == "developer":
                    memory.write("developer_state", "completed")
                    logger.info(
                        "Developer completed successfully on attempt %s/%s (run_id=%s)",
                        attempt,
                        max_retries,
                        run_id,
                    )

                logger.info(
                    "Agent '%s' succeeded on attempt %s/%s (run_id=%s)",
                    agent_name,
                    attempt,
                    max_retries,
                    run_id,
                )

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
                last_traceback = traceback.format_exc()

                logger.exception(
                    "Agent '%s' crashed on attempt %s/%s (run_id=%s)",
                    agent_name,
                    attempt,
                    max_retries,
                    run_id,
                )

                # 🧾 Log failure into memory
                memory.write(f"{agent_name}_last_error", last_error)
                memory.write(f"{agent_name}_last_traceback", last_traceback)
                save_memory_snapshot(run_id, f"{agent_name}_attempt_{attempt}_error", memory.dump())

                if agent_name == "developer":
                    state = "retrying" if attempt < max_retries else "failed"
                    memory.write("developer_state", state)
                    upsert_run(run_id, "running", f"developer:{state}:{attempt}")
                    logger.warning(
                        "Developer attempt %s/%s failed (run_id=%s): %s",
                        attempt,
                        max_retries,
                        run_id,
                        last_error,
                    )

        # Final failure after retries
        memory.write(output_key, None)
        logger.error("Agent '%s' failed after %s attempts (run_id=%s)", agent_name, max_retries, run_id)

        return {
            "run_id": run_id,
            "agent": agent_name,
            "status": "failed",
            "error": last_error,
            "traceback": last_traceback,
            "attempts": max_retries,
            "duration": round(time.time() - start_time, 2)
        }