import json
import re
import asyncio

from core.llm import get_llm


REQUIRED_KEYS = ["tech_stack", "file_structure", "api_endpoints", "notes"]


def validate_architecture(data: dict) -> dict:
    if not isinstance(data, dict):
        return {}

    validated = {}

    for key in REQUIRED_KEYS:
        if key not in data:
            if key in ["file_structure", "api_endpoints"]:
                validated[key] = []
            elif key == "tech_stack":
                validated[key] = {
                    "frontend": "",
                    "backend": "",
                    "database": ""
                }
            else:
                validated[key] = ""
        else:
            validated[key] = data[key]

    # enforce structure
    if not isinstance(validated["file_structure"], list):
        validated["file_structure"] = []

    if not isinstance(validated["api_endpoints"], list):
        validated["api_endpoints"] = []

    if not isinstance(validated["tech_stack"], dict):
        validated["tech_stack"] = {
            "frontend": "",
            "backend": "",
            "database": ""
        }

    return validated


async def run_architect(memory, stream_callback=None) -> dict:
    llm = get_llm("architect", streaming=True)

    plan = memory.read("plan")

    if not plan:
        raise ValueError("Architect requires planner output.")

    # =========================================
    # 🧠 PHASE 1 — THINKING
    # =========================================

    thinking_prompt = f"""
You are a senior software architect.

Analyze this plan and think step-by-step.

Return ONLY JSON:

{{
  "system_design": "...",
  "components": ["...", "..."],
  "data_flow": "..."
}}

Plan:
{json.dumps(plan, indent=2)}
"""

    thinking_response = ""

    async for chunk in llm.astream(thinking_prompt):
        token = chunk.content or ""
        thinking_response += token

        if stream_callback:
            await stream_callback("architect_thinking", token)

    thinking_clean = re.sub(r"```(?:json)?", "", thinking_response).strip().rstrip("```")

    try:
        thinking_json = json.loads(thinking_clean)
    except:
        match = re.search(r'\{[\s\S]*\}', thinking_clean)
        thinking_json = json.loads(match.group()) if match else {}

    memory.write("architect_thinking", thinking_json)

    await asyncio.sleep(0.3)

    # =========================================
    # 🧠 PHASE 2 — FINAL ARCHITECTURE
    # =========================================

    architecture_prompt = f"""
Based on this reasoning:

{json.dumps(thinking_json, indent=2)}

Generate SYSTEM ARCHITECTURE.

STRICT RULES:
- Use Next.js, FastAPI, SQLite
- Return ONLY JSON
- No markdown
- No explanation
- No extra keys

FORMAT:

{{
  "tech_stack": {{
    "frontend": "Next.js",
    "backend": "FastAPI",
    "database": "SQLite"
  }},
  "file_structure": ["path/file"],
  "api_endpoints": ["METHOD /route"],
  "notes": "..."
}}

IMPORTANT:
- file_structure must be COMPLETE
- include frontend + backend
- realistic production structure
"""

    final_response = ""

    async for chunk in llm.astream(architecture_prompt):
        token = chunk.content or ""
        final_response += token

        if stream_callback:
            await stream_callback("architect_output", token)

    final_clean = re.sub(r"```(?:json)?", "", final_response).strip().rstrip("```")

    try:
        parsed = json.loads(final_clean)
    except:
        match = re.search(r'\{[\s\S]*\}', final_clean)
        parsed = json.loads(match.group()) if match else {}

    validated = validate_architecture(parsed)

    # 🔥 Save architecture
    memory.write("architecture", validated)

    return validated