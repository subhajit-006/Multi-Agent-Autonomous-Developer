import json
import os
from openai import AsyncOpenAI
from core.config import AGENT_MODELS

async def run_tester(memory) -> dict:
    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("OPENROUTER_API_KEY")
    )

    # 🔥 NEW: include full system context
    plan = memory.read("plan")
    architecture = memory.read("architecture")
    developed_data = memory.read("files")

    if not developed_data or "files" not in developed_data:
        raise ValueError("Tester cannot proceed: No codebase found.")

    code_files = developed_data["files"]

    # 🔥 NEW: stronger system-level validation role
    system_prompt = (
        "You are a senior QA engineer and system validator. "
        "Your job is to verify that the implementation satisfies the original plan and architecture."
    )

    # 🔥 NEW: richer context-aware input
    user_content = (
        f"Original Plan:\n{json.dumps(plan, indent=2)}\n\n"
        f"Architecture:\n{json.dumps(architecture, indent=2)}\n\n"
        "Final Codebase:\n"
    )

    for f in code_files:
        user_content += f"\n--- {f['filename']} ---\n{f['content']}\n"

    user_content += (
        "\n\nYour tasks:\n"
        "1. Validate that all key features from the plan are implemented\n"
        "2. Validate API endpoints match architecture\n"
        "3. Check authentication and data flow\n"
        "4. Identify missing components or incomplete logic\n\n"
        "Then:\n"
        "- Generate unit tests\n"
        "- Generate integration tests\n"
        "- Highlight coverage gaps\n"
    )

    response = await client.chat.completions.create(
        model=AGENT_MODELS.get("tester"),
        max_tokens=4000,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        tools=[{
            "type": "function",
            "function": {
                "name": "submit_tests",
                "description": "Submit generated tests.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "test_file_path": {"type": "string"},
                        "test_file_content": {"type": "string"},
                        "test_cases": {"type": "array", "items": {"type": "string"}},
                        "coverage_areas": {"type": "array", "items": {"type": "string"}}
                    },
                    "required": ["test_file_path", "test_file_content", "test_cases", "coverage_areas"]
                }
            }
        }],
        tool_choice={"type": "function", "function": {"name": "submit_tests"}}
    )

    tool_calls = []
    if response and response.choices and response.choices[0].message:
        tool_calls = response.choices[0].message.tool_calls or []

    if tool_calls:
        for tool_call in tool_calls:
            if tool_call.function.name == "submit_tests":
                try:
                    test_data = json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    test_data = {}

                if not isinstance(test_data, dict):
                    test_data = {}

                # 🔥 Safe extraction
                test_file_path = test_data.get("test_file_path", "tests/app.test.js")
                test_file_content = test_data.get("test_file_content", "")
                test_cases = test_data.get("test_cases", [])
                coverage_areas = test_data.get("coverage_areas", [])

                # Append test file into memory
                new_files_list = code_files.copy()
                new_files_list.append({
                    "filename": test_file_path,
                    "language": test_file_path.split(".")[-1] if "." in test_file_path else "txt",
                    "content": test_file_content
                })

                memory.write("files", {"files": new_files_list})

                return {
                    "test_file": test_file_content,
                    "test_cases": test_cases if isinstance(test_cases, list) else [],
                    "coverage_areas": coverage_areas if isinstance(coverage_areas, list) else []
                }

    raise ValueError("Tester did not return the expected tool use data.")