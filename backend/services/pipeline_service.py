import time
from typing import List, Dict, Any


from core.memory import SharedMemory
from services.agent_service import AgentService, AGENT_REGISTRY
from core.db import upsert_run, save_memory_snapshot


class PipelineService:

    def __init__(self):
        self.agent_service = AgentService()

    async def run_pipeline(
        self,
        task: str,
        scope: str,
        flow: List[str]
    ) -> Dict[str, Any]:

        memory = SharedMemory()

        # 🧠 Initialize context
        memory.write("task", task)
        memory.write("scope", scope)
        memory.set_status("running")

        run_id = memory.read("run_id")

        # 📝 Save initial run state
        upsert_run(run_id, "running", None)
        save_memory_snapshot(run_id, "init", memory.dump())

        results = []
        start_time = time.time()

        # 🔄 Execute pipeline
        for agent in flow:

            if agent not in AGENT_REGISTRY:
                memory.set_status("failed")

                upsert_run(run_id, "failed", agent)
                save_memory_snapshot(run_id, agent, memory.dump())

                return {
                    "run_id": run_id,
                    "status": "failed",
                    "error": f"Invalid agent in flow: {agent}",
                    "results": results,
                    "memory": memory.dump()
                }

            # 🚦 Track step
            memory.set_current_step(agent)
            upsert_run(run_id, "running", agent)

            result = await self.agent_service.run_agent(agent, memory)
            results.append(result)

            # 🔥 =============================
            # 🔥 NEW: DEVELOPER VALIDATION
            # 🔥 =============================
            if agent == "developer" and result["status"] == "success":

                files_data = memory.read("files")

                # 🚨 Case 1: No files at all
                if not files_data or "files" not in files_data:
                    memory.write("developer_last_error", "No files generated")

                else:
                    files_list = files_data.get("files", [])

                    # 🚨 Case 2: Too few files → retry once
                    if not isinstance(files_list, list) or len(files_list) < 2:
                        memory.write("developer_last_error", "Insufficient files generated")

                        retry_result = await self.agent_service.run_agent("developer", memory)
                        results.append(retry_result)

                        if retry_result["status"] == "failed":
                            memory.set_status("failed")
                            upsert_run(run_id, "failed", "developer")

                            return {
                                "run_id": run_id,
                                "status": "failed",
                                "failed_step": "developer",
                                "results": results,
                                "memory": memory.dump(),
                                "duration": round(time.time() - start_time, 2)
                            }

                    # 🧠 Case 3: Architecture coverage check
                    architecture = memory.read("architecture") or {}
                    arch_files = architecture.get("file_structure", [])

                    dev_files = [
                        f.get("filename")
                        for f in files_list
                        if isinstance(f, dict)
                    ]

                    if arch_files:
                        coverage = len(set(dev_files) & set(arch_files))

                        if coverage < max(1, len(arch_files) // 3):
                            memory.write("developer_last_error", "Low architecture coverage")

            # 📦 Save snapshot AFTER execution
            save_memory_snapshot(run_id, agent, memory.dump())

            # 🛑 Handle failure
            if result["status"] == "failed":
                memory.set_status("failed")

                upsert_run(run_id, "failed", agent)

                return {
                    "run_id": run_id,
                    "status": "failed",
                    "failed_step": agent,
                    "results": results,
                    "memory": memory.dump(),
                    "duration": round(time.time() - start_time, 2)
                }

        # ✅ Success
        memory.set_status("completed")
        upsert_run(run_id, "completed", None)

        return {
            "run_id": run_id,
            "status": "completed",
            "total_time": round(time.time() - start_time, 2),
            "results": results,
            "memory": memory.dump()
        }