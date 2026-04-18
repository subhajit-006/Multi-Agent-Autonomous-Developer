import json
import os
import re
from openai import AsyncOpenAI
from core.config import AGENT_MODELS


async def run_planner(memory) -> dict:
    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("OPENROUTER_API_KEY")
    )
    task = memory.read("task")
    scope = memory.read("scope")

    system_prompt = (
        "You are a senior product manager and software architect. "
        "Analyze the given task and produce a structured JSON development plan. "
        "You MUST respond with ONLY a valid JSON object — no markdown, no extra text, no code fences. "
        "The JSON must have these keys: project_name (string), description (string), "
        "features (array of strings), tasks (array of strings), estimated_files (integer)."
    )

    user_content = f"Task: {task}\nScope: {scope}"

    response = await client.chat.completions.create(
        model=AGENT_MODELS.get("planner"),
        max_tokens=4000,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]
    )

    content = response.choices[0].message.content or ""

    # Strip markdown code fences if present
    content = re.sub(r"```(?:json)?\s*", "",
                     content).strip().rstrip("```").strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Try to extract JSON object from surrounding text
        match = re.search(r'\{[\s\S]*\}', content)
        if match:
            return json.loads(match.group())
        # Return a minimal fallback so the pipeline can continue
        return {
            "project_name": task[:40],
            "description": task,
            "features": ["Core feature"],
            "tasks": ["Implement core logic"],
            "estimated_files": 3
        }
