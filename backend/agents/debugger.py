import json
import os
from openai import AsyncOpenAI
from core.config import AGENT_MODELS

async def run_debugger(memory) -> dict:
    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("OPENROUTER_API_KEY")
    )
    developed_data = memory.read("files")
    
    if not developed_data or "files" not in developed_data:
        # Nothing to debug, pass through
        return {"issues_found": 0, "fixes": [], "corrected_files": []}

    raw_code_files = developed_data.get("files")
    if not isinstance(raw_code_files, list):
        return {"issues_found": 0, "fixes": [], "corrected_files": []}

    # Normalize generated files to avoid crashes on malformed entries.
    code_files = []
    for item in raw_code_files:
        if not isinstance(item, dict):
            continue
        filename = item.get("filename")
        content = item.get("content")
        if not isinstance(filename, str) or not isinstance(content, str):
            continue
        language = item.get("language")
        if not isinstance(language, str):
            language = filename.split(".")[-1] if "." in filename else "txt"
        code_files.append({"filename": filename, "language": language, "content": content})

    if not code_files:
        return {"issues_found": 0, "fixes": [], "corrected_files": []}

    system_prompt = "You are an expert code reviewer and debugger. Review this code for bugs, missing imports, type errors, and security issues."
    
    user_content = "Generated Files:\n"
    for f in code_files:
        user_content += f"\n--- {f['filename']} ---\n{f['content']}\n"
        
    user_content += "\nIdentify issues. Output corrected files if fixes were applied."

    response = await client.chat.completions.create(
        model=AGENT_MODELS.get("debugger"),
        max_tokens=8192,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        tools=[{
            "type": "function",
            "function": {
                "name": "submit_review",
                "description": "Submit the debug report and corrected files.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "issues_found": {"type": "integer"},
                        "fixes": {"type": "array", "items": {"type": "string"}},
                        "corrected_files": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "path": {"type": "string"},
                                    "content": {"type": "string"}
                                },
                                "required": ["path", "content"]
                            }
                        }
                    },
                    "required": ["issues_found", "fixes", "corrected_files"]
                }
            }
        }],
        tool_choice={"type": "function", "function": {"name": "submit_review"}}
    )

    tool_calls = []
    if response and response.choices and response.choices[0].message:
        tool_calls = response.choices[0].message.tool_calls or []

    if tool_calls:
        for tool_call in tool_calls:
            if tool_call.function.name == "submit_review":
                raw_arguments = tool_call.function.arguments
                try:
                    review = json.loads(raw_arguments) if raw_arguments else {}
                except json.JSONDecodeError:
                    review = {}

                if not isinstance(review, dict):
                    review = {}

                issues_found = review.get("issues_found", 0)
                if not isinstance(issues_found, int):
                    issues_found = 0

                fixes = review.get("fixes", [])
                if not isinstance(fixes, list):
                    fixes = []

                corrected_files = review.get("corrected_files", [])
                if not isinstance(corrected_files, list):
                    corrected_files = []

                review = {
                    "issues_found": issues_found,
                    "fixes": fixes,
                    "corrected_files": corrected_files,
                }
                
                # If fixes happened, overwrite original memory state for files to pass to tester
                if review.get("issues_found", 0) > 0 and review.get("corrected_files"):
                    corrected_map = {}
                    for cf in review["corrected_files"]:
                        if not isinstance(cf, dict):
                            continue
                        path = cf.get("path")
                        content = cf.get("content")
                        if isinstance(path, str) and isinstance(content, str):
                            corrected_map[path] = {"path": path, "content": content}
                    
                    new_files_list = []
                    for original_file in code_files:
                        path = original_file.get("filename")
                        if not isinstance(path, str):
                            continue
                        if path in corrected_map:
                            new_files_list.append({
                                "filename": path,
                                "language": original_file.get("language", "txt"),
                                "content": corrected_map[path]["content"]
                            })
                        else:
                            new_files_list.append(original_file)
                    
                    # Write back the corrected codebase
                    memory.write("files", {"files": new_files_list})
                    
                return review

    # Fail-soft behavior: keep pipeline moving when model returns plain text/no tool call.
    return {
        "issues_found": 0,
        "fixes": ["Debugger returned no valid tool output; skipped automated corrections."],
        "corrected_files": []
    }
