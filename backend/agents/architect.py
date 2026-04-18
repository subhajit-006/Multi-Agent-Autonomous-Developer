import json
import os
from openai import AsyncOpenAI
from core.config import AGENT_MODELS

async def run_architect(memory) -> dict:
    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("OPENROUTER_API_KEY")
    )
    plan = memory.read("plan")
    
    if not plan:
        raise ValueError("Architect requires a valid plan from the Planner agent.")

    system_prompt = "You are a software architect. Given a development plan, design a clean, minimal system architecture."
    
    user_content = f"Development Plan:\n{json.dumps(plan, indent=2)}\n\nConstraint: Tech stack must be Next.js, FastAPI, and SQLite (or Firebase)."

    response = await client.chat.completions.create(
        model=AGENT_MODELS.get('architect'),
        max_tokens=4000,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        tools=[{
            "type": "function",
            "function": {
                "name": "submit_architecture",
                "description": "Submit the finalized architecture document.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "tech_stack": {
                            "type": "object",
                            "properties": {
                                "frontend": {"type": "string"},
                                "backend": {"type": "string"},
                                "database": {"type": "string"}
                            },
                            "required": ["frontend", "backend", "database"]
                        },
                        "file_structure": {"type": "array", "items": {"type": "string"}},
                        "api_endpoints": {"type": "array", "items": {"type": "string"}},
                        "notes": {"type": "string"}
                    },
                    "required": ["tech_stack", "file_structure", "api_endpoints", "notes"]
                }
            }
        }],
        tool_choice={"type": "function", "function": {"name": "submit_architecture"}}
    )

    if response.choices[0].message.tool_calls:
        for tool_call in response.choices[0].message.tool_calls:
            if tool_call.function.name == "submit_architecture":
                return json.loads(tool_call.function.arguments)

    raise ValueError("Architect did not return the expected tool use data.")
