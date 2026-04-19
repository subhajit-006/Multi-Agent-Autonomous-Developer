import json
from core.llm import get_llm
from core.file_validation import is_valid_filename


# =========================================
# 🧠 NORMALIZE FILES
# =========================================
def normalize_files(raw_files):
    valid = []

    for f in raw_files:
        if not isinstance(f, dict):
            continue

        name = f.get("filename")
        content = f.get("content")

        if not is_valid_filename(name) or not isinstance(content, str):
            continue

        valid.append({
            "filename": name,
            "content": content
        })

    return valid


# =========================================
# 🔍 ANALYZE
# =========================================
async def analyze_code(llm, files):
    prompt = f"""
You are a senior software architect.

Analyze the codebase and find issues.

Classify into:
- critical
- functional
- minor

Return ONLY JSON:

{{
  "critical": ["..."],
  "functional": ["..."],
  "minor": ["..."]
}}

Codebase:
"""

    for f in files:
        prompt += f"\n--- {f['filename']} ---\n{f['content']}\n"

    response = await llm.ainvoke(prompt)

    try:
        return json.loads(response.content)
    except:
        return {"critical": [], "functional": [], "minor": []}


# =========================================
# 🔧 FIX
# =========================================
async def fix_code(llm, files, issues):
    prompt = f"""
You are fixing a broken codebase.

ONLY fix critical and functional issues.

Rules:
- Return ONLY changed files
- Do NOT rewrite everything
- Keep structure intact

Return JSON:

{{
  "corrected_files": [
    {{ "path": "...", "content": "..." }}
  ]
}}

Issues:
{json.dumps(issues, indent=2)}

Codebase:
"""

    for f in files:
        prompt += f"\n--- {f['filename']} ---\n{f['content']}\n"

    response = await llm.ainvoke(prompt)

    try:
        return json.loads(response.content)
    except:
        return {"corrected_files": []}


# =========================================
# 🚀 MAIN DEBUGGER
# =========================================
async def run_debugger(memory) -> dict:

    llm = get_llm("debugger", streaming=False)  # ← uses Mistral

    data = memory.read("files")

    if not data or "files" not in data:
        return {"issues_found": 0, "corrected_files": []}

    raw_files = data.get("files")

    files = normalize_files(raw_files)

    if not files:
        return {"issues_found": 0, "corrected_files": []}

    # =========================================
    # 🔍 ANALYZE
    # =========================================
    issues = await analyze_code(llm, files)

    total = sum(len(issues.get(k, [])) for k in ["critical", "functional", "minor"])

    # =========================================
    # 🔧 FIX (only if needed)
    # =========================================
    if not issues.get("critical") and not issues.get("functional"):
        return {
            "issues_found": total,
            "corrected_files": []
        }

    fix_result = await fix_code(llm, files, issues)

    corrected = fix_result.get("corrected_files", [])

    if not corrected:
        return {
            "issues_found": total,
            "corrected_files": []
        }

    # =========================================
    # 🔄 APPLY PATCH
    # =========================================
    patch_map = {
        f["path"]: f["content"]
        for f in corrected
        if isinstance(f, dict)
    }

    new_files = []

    for f in files:
        name = f["filename"]

        if name in patch_map:
            new_files.append({
                "filename": name,
                "content": patch_map[name]
            })
        else:
            new_files.append(f)

    memory.write("files", {"files": new_files})

    return {
        "issues_found": total,
        "fixes": issues,
        "corrected_files": corrected
    }