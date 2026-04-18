import json
import re
import asyncio

from core.llm import get_llm


REQUIRED_KEYS = ["project_name", "description", "features", "tasks"]


def validate_plan(data: dict) -> dict:
    """
    Ensures strict schema compliance.
    Fixes minor issues instead of breaking pipeline.
    """
    if not isinstance(data, dict):
        return {}

    validated = {}

    for key in REQUIRED_KEYS:
        if key not in data:
            # fill missing safely
            if key in ["features", "tasks"]:
                validated[key] = []
            else:
                validated[key] = ""
        else:
            validated[key] = data[key]

    # enforce types
    if not isinstance(validated["features"], list):
        validated["features"] = []

    if not isinstance(validated["tasks"], list):
        validated["tasks"] = []

    return validated


async def run_planner(memory, stream_callback=None) -> dict:
    llm = get_llm("planner", streaming=True)

    task = memory.read("task")
    scope = memory.read("scope")

    if not task:
        raise ValueError("Planner requires a task.")

    # =========================================
    # 🧠 PHASE 1 — THINKING (STREAMED)
    # =========================================

    thinking_prompt = f"""
You are a senior product planner.

Think step-by-step.

Return ONLY JSON:

{{
  "understanding": "...",
  "breakdown": ["...", "..."],
  "approach": "..."
}}

Task: {task}
Scope: {scope}
"""

    thinking_response = ""

    async for chunk in llm.astream(thinking_prompt):
        token = chunk.content or ""
        thinking_response += token

        if stream_callback:
            await stream_callback("planner_thinking", token)

    thinking_clean = re.sub(r"```(?:json)?", "", thinking_response).strip().rstrip("```")

    try:
        thinking_json = json.loads(thinking_clean)
    except:
        match = re.search(r'\{[\s\S]*\}', thinking_clean)
        thinking_json = json.loads(match.group()) if match else {}

    memory.write("planner_thinking", thinking_json)

    await asyncio.sleep(0.3)

    # =========================================
    # 🧠 PHASE 2 — FINAL PLAN (STRICT JSON)
    # =========================================

    plan_prompt = f"""
Based on this reasoning:

{json.dumps(thinking_json, indent=2)}

Generate FINAL PLAN.

STRICT RULES:
- Return ONLY JSON
- No markdown
- No explanation
- No extra keys
- Must include EXACT keys:
  project_name, description, features, tasks

Format:

{{
  "project_name": "string",
  "description": "string",
  "features": ["string"],
  "tasks": ["string"]
}}
"""

    final_response = ""

    async for chunk in llm.astream(plan_prompt):
        token = chunk.content or ""
        final_response += token

        if stream_callback:
            await stream_callback("planner_output", token)

    final_clean = re.sub(r"```(?:json)?", "", final_response).strip().rstrip("```")

    try:
        parsed = json.loads(final_clean)
    except:
        match = re.search(r'\{[\s\S]*\}', final_clean)
        parsed = json.loads(match.group()) if match else {}

    validated = validate_plan(parsed)

    # 🔥 store final plan
    memory.write("plan", validated)

    return validated