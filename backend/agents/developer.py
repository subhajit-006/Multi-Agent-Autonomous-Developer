import json
import os
from openai import AsyncOpenAI
from core.config import AGENT_MODELS

async def run_developer(memory) -> dict:
    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("OPENROUTER_API_KEY")
    )

    plan = memory.read("plan")
    architecture = memory.read("architecture")
    scope = memory.read("scope")

    if not plan or not architecture:
        raise ValueError("Developer requires both a plan and architecture to proceed.")

    # 🔥 NEW: smarter file limit based on architecture
    file_structure = architecture.get("file_structure", [])
    expected_files = len(file_structure)

    # Hard cap to prevent token explosion
    max_files = min(expected_files, 12) if expected_files > 0 else 6

    system_prompt = (
        "You are a senior full-stack developer. "
        "Write complete, production-ready code. "
        "No placeholders. No TODOs. Code must be functional and connected."
    )

    # 🔥 NEW: stronger, stricter instructions
    user_content = (
        f"Plan: {json.dumps(plan, indent=2)}\n\n"
        f"Architecture: {json.dumps(architecture, indent=2)}\n\n"

        "You MUST generate ALL critical files from the architecture file_structure.\n\n"

        "Rules:\n"
        "- Prioritize backend core logic (API routes, DB, auth)\n"
        "- Include at least one frontend entry (page/component)\n"
        "- Implement real working logic (no placeholders)\n"
        "- Ensure files integrate into a working system\n"
        "- Do NOT stop early\n\n"

        f"Limit: You can generate up to {max_files} files, but they must cover the full system flow.\n\n"

        "Use the write_file tool for EACH file."
    )

    generated_files = {}

    response = await client.chat.completions.create(
        model=AGENT_MODELS.get("developer"),
        max_tokens=8192,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        tools=[{
            "type": "function",
            "function": {
                "name": "write_file",
                "description": "Outputs a complete production code file.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Relative file path e.g. frontend/app/page.tsx"
                        },
                        "content": {
                            "type": "string",
                            "description": "Complete file code content"
                        }
                    },
                    "required": ["path", "content"]
                }
            }
        }]
    )

    # 🔥 safer extraction
    tool_calls = []
    if response and response.choices and response.choices[0].message:
        tool_calls = response.choices[0].message.tool_calls or []

    if tool_calls:
        for tool_call in tool_calls:
            if tool_call.function.name == "write_file":
                try:
                    args = json.loads(tool_call.function.arguments)
                    path = args.get("path")
                    content = args.get("content")

                    if isinstance(path, str) and isinstance(content, str):
                        generated_files[path] = content
                except Exception:
                    continue

    # Restructure for memory
    files_list = [
        {
            "filename": k,
            "language": k.split(".")[-1] if "." in k else "txt",
            "content": c
        }
        for k, c in generated_files.items()
    ]

    return {"files": files_list}