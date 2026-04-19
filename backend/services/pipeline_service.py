import asyncio
import time
from typing import List, Dict, Any

from core.memory import SharedMemory
from services.agent_service import AgentService, AGENT_REGISTRY
from core.db import (
    upsert_run,
    save_memory_snapshot,
    get_memory_history,
    upsert_run_output,
)


class PipelineService:
    def __init__(self):
        self.agent_service = AgentService()

    @staticmethod
    def _prepare_file_structure_for_scope(
        file_structure: List[str], scope: str
    ) -> List[str]:
        if not isinstance(file_structure, list):
            return []

        # Remove duplicates while preserving order.
        unique_files = []
        seen = set()
        for item in file_structure:
            if not isinstance(item, str):
                continue
            normalized = item.strip()
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            unique_files.append(normalized)

        # Skip files that are typically generated externally or binary assets.
        blocked_suffixes = (
            ".lock",
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".webp",
            ".ico",
            ".svg",
            ".pdf",
            ".zip",
        )
        blocked_names = {
            "package-lock.json",
            "pnpm-lock.yaml",
            "yarn.lock",
            ".env",
            ".env.local",
        }

        filtered = []
        for path in unique_files:
            lower = path.lower()
            name = lower.split("/")[-1]
            if name in blocked_names:
                continue
            if lower.endswith(blocked_suffixes):
                continue
            filtered.append(path)

        # Scope-based caps keep generation tractable.
        scope_caps = {
            "minimal": 12,
            "standard": 24,
            "full": 40,
        }
        cap = scope_caps.get((scope or "").lower(), 24)

        return filtered[:cap]

    @staticmethod
    def _persist_final_output(run_id: str) -> None:
        history = get_memory_history(run_id)

        formatted = []
        for step, memory_json, created_at in history:
            formatted.append(
                {
                    "step": step,
                    "memory": memory_json,
                    "timestamp": created_at,
                }
            )

        upsert_run_output(
            run_id,
            {
                "run_id": run_id,
                "steps": formatted,
                "total_steps": len(formatted),
            },
        )

    async def run_pipeline(
        self, task: str, scope: str, flow: List[str], memory: SharedMemory = None
    ) -> Dict[str, Any]:

        # FIX: use passed memory (CRITICAL for SSE)
        if memory is None:
            memory = SharedMemory()

        # 🧠 Initialize context ONLY if fresh
        if not memory.read("task"):
            memory.write("task", task)
            memory.write("scope", scope)
            memory.set_status("running")

        run_id = memory.read("run_id")

        # 📝 Save initial state (safe overwrite)
        upsert_run(run_id, "running", memory.read("current_step"))
        save_memory_snapshot(run_id, "init", memory.dump())

        results = []
        start_time = time.time()

        agent_timeouts = {
            "planner": 120,
            "architect": 180,
            "developer": 300,
            "debugger": 180,
            "tester": 180,
        }

        # 🔄 Execute pipeline
        for agent in flow:
            if agent not in AGENT_REGISTRY:
                memory.set_status("failed")

                upsert_run(run_id, "failed", agent)
                save_memory_snapshot(run_id, agent, memory.dump())
                self._persist_final_output(run_id)

                return {
                    "run_id": run_id,
                    "status": "failed",
                    "error": f"Invalid agent in flow: {agent}",
                    "results": results,
                    "memory": memory.dump(),
                }

            # 🚦 Track step (THIS DRIVES SSE)
            memory.set_current_step(agent)
            upsert_run(run_id, "running", agent)

            # Pre-trim architecture before developer to avoid runaway file generation.
            if agent == "developer":
                architecture = memory.read("architecture") or {}
                original_fs = architecture.get("file_structure", [])
                scoped_fs = self._prepare_file_structure_for_scope(original_fs, scope)

                architecture["file_structure"] = scoped_fs
                memory.write("architecture", architecture)
                memory.write("developer_target_file_count", len(scoped_fs))

            try:
                result = await asyncio.wait_for(
                    self.agent_service.run_agent(agent, memory),
                    timeout=agent_timeouts.get(agent, 180),
                )
            except asyncio.TimeoutError:
                memory.write(
                    f"{agent}_last_error",
                    f"Agent timed out after {agent_timeouts.get(agent, 180)}s",
                )
                result = {
                    "run_id": run_id,
                    "agent": agent,
                    "status": "failed",
                    "error": f"Agent '{agent}' timed out after {agent_timeouts.get(agent, 180)} seconds",
                    "traceback": None,
                    "attempts": 1,
                }

            results.append(result)

            # 🔥 =============================
            # 🔥 DEVELOPER VALIDATION
            # 🔥 =============================
            if agent == "developer" and result["status"] == "success":
                files_data = memory.read("files")

                if not files_data or "files" not in files_data:
                    memory.write("developer_last_error", "No files generated")

                else:
                    files_list = files_data.get("files", [])

                    # 🚨 Too few files → retry
                    if not isinstance(files_list, list) or len(files_list) < 2:
                        memory.write(
                            "developer_last_error", "Insufficient files generated"
                        )

                        retry_result = await self.agent_service.run_agent(
                            "developer", memory
                        )
                        results.append(retry_result)

                        if retry_result["status"] == "failed":
                            memory.set_status("failed")
                            upsert_run(run_id, "failed", "developer")
                            save_memory_snapshot(
                                run_id, "developer_failed", memory.dump()
                            )
                            self._persist_final_output(run_id)

                            return {
                                "run_id": run_id,
                                "status": "failed",
                                "failed_step": "developer",
                                "error": retry_result.get("error"),
                                "traceback": retry_result.get("traceback"),
                                "results": results,
                                "memory": memory.dump(),
                                "duration": round(time.time() - start_time, 2),
                            }

                    # 🧠 Architecture coverage check
                    architecture = memory.read("architecture") or {}
                    arch_files = architecture.get("file_structure", [])

                    dev_files = [
                        f.get("filename") for f in files_list if isinstance(f, dict)
                    ]

                    if arch_files:
                        coverage = len(set(dev_files) & set(arch_files))

                        if coverage < max(1, len(arch_files) // 3):
                            memory.write(
                                "developer_last_error", "Low architecture coverage"
                            )

            # Save snapshot AFTER execution
            save_memory_snapshot(run_id, agent, memory.dump())

            # Handle failure
            if result["status"] == "failed":
                memory.set_status("failed")

                upsert_run(run_id, "failed", agent)
                save_memory_snapshot(run_id, f"{agent}_failed", memory.dump())
                self._persist_final_output(run_id)

                return {
                    "run_id": run_id,
                    "status": "failed",
                    "failed_step": agent,
                    "error": result.get("error"),
                    "traceback": result.get("traceback"),
                    "results": results,
                    "memory": memory.dump(),
                    "duration": round(time.time() - start_time, 2),
                }

        # ✅ Success
        memory.set_status("completed")
        upsert_run(run_id, "completed", None)
        save_memory_snapshot(run_id, "final", memory.dump())
        self._persist_final_output(run_id)

        return {
            "run_id": run_id,
            "status": "completed",
            "total_time": round(time.time() - start_time, 2),
            "results": results,
            "memory": memory.dump(),
        }
