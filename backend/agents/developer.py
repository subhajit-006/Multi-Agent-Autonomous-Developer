import re
import asyncio

from core.llm import get_llm
from core.file_validation import is_valid_filename, sanitize_file_structure


# =========================================
# 🔧 DELIMITER-BASED PARSER
# =========================================
# We ask the LLM to wrap code between plain text delimiters.
# This avoids JSON escaping hell entirely — no quotes, backslashes,
# or newlines need to be escaped inside the delimiters.

def parse_code_response(response_text: str, fallback_path: str) -> tuple[str, str]:
    """
    Expects LLM output in this shape:

        FILENAME: frontend/lib/api.ts
        ---BEGIN CODE---
        (the actual code)
        ---END CODE---

    Returns (filename, content).
    Falls back to fallback_path if FILENAME line is missing.
    """
    filename_match = re.search(r"FILENAME:\s*(.+)", response_text)
    code_match = re.search(
        r"---BEGIN CODE---\n([\s\S]+?)\n---END CODE---",
        response_text
    )

    filename = filename_match.group(1).strip() if filename_match else fallback_path
    content  = code_match.group(1).strip()     if code_match     else ""

    return filename, content


# =========================================
# 📦 CONTEXT SUMMARIZER
# =========================================
# When generating later files, we pass previously-written files as context.
# For recent files (last 3), we pass full content so the model can read
# exact function names, types, and import paths.
# For older files, we pass a truncated preview (first 30 lines) to stay
# within Groq's context window.

FULL_CONTEXT_WINDOW = 3    # How many recent files get shown in full
PREVIEW_LINE_LIMIT  = 30   # Lines shown for older files

def build_context_block(previously_generated: list[dict]) -> str:
    """
    Builds the 'files written so far' section of the prompt.

    previously_generated is a list of:
        { "filename": str, "content": str }

    Returns a formatted multi-file context string, or empty string
    if nothing has been generated yet (first file in the run).
    """
    if not previously_generated:
        return ""

    lines = [
        "=" * 60,
        "ALREADY GENERATED FILES",
        "Read these carefully before writing your file.",
        "Your output MUST be consistent with them in terms of:",
        "  - Import paths and exported function/class names",
        "  - API endpoint URLs and exact request body field names",
        "  - TypeScript type names and interfaces",
        "  - Environment variable names",
        "  - Any shared constants or config values",
        "=" * 60,
        ""
    ]

    total = len(previously_generated)

    for i, file_entry in enumerate(previously_generated):
        fname     = file_entry["filename"]
        content   = file_entry["content"]
        all_lines = content.strip().splitlines()

        # Files near the end of the list are the most recent ones.
        # Give those full content so the model reads exact signatures.
        # Give older files a truncated preview to save tokens.
        is_recent = (total - 1 - i) < FULL_CONTEXT_WINDOW

        if is_recent:
            body = "\n".join(all_lines)
            note = ""
        else:
            body = "\n".join(all_lines[:PREVIEW_LINE_LIMIT])
            note = (
                f"\n... ({len(all_lines) - PREVIEW_LINE_LIMIT} more lines — "
                "showing top only to save context)"
                if len(all_lines) > PREVIEW_LINE_LIMIT
                else ""
            )

        lines.append(f"--- {fname} ---")
        lines.append(body)
        if note:
            lines.append(note)
        lines.append("")  # blank separator between files

    return "\n".join(lines)


# =========================================
# 🧠 FILE-AWARE PROMPT BUILDER
# =========================================

def build_prompt(
    file_path:            str,
    plan:                 dict,
    architecture:         dict,
    attempt:              int       = 0,
    previously_generated: list[dict] = None
) -> str:
    """
    Builds the generation prompt for a single file.

    - Uses delimiter output format (not JSON) — no escaping issues
    - Injects all previously generated files as context
    - Retry signal tells the model exactly what was wrong
    - Special extra requirements for known complex files
    """

    previously_generated = previously_generated or []

    # --- Retry prefix ---
    retry_prefix = ""
    if attempt > 0:
        retry_prefix = (
            f"RETRY ATTEMPT {attempt + 1}: Your previous response was rejected "
            f"because the code content between ---BEGIN CODE--- and ---END CODE--- "
            f"was missing or too short. Follow the output format exactly.\n\n"
        )

    # --- Context block (previously written files) ---
    context_block = build_context_block(previously_generated)

    # --- Core prompt ---
    prompt = f"""{retry_prefix}You are a senior full-stack developer.
Generate EXACTLY ONE file: {file_path}

PROJECT PLAN:
{plan}

ARCHITECTURE:
{architecture}

{context_block}
RULES:
- Write complete, working code for {file_path} ONLY.
- Do NOT include markdown, explanations, or commentary.
- Do NOT wrap code in triple backticks.
- Be consistent with all files shown above. Match their imports,
  function names, types, endpoint paths, and field names exactly.

OUTPUT FORMAT (follow exactly, no deviations):
FILENAME: {file_path}
---BEGIN CODE---
(write the full file code here)
---END CODE---
"""

    # --- Extra requirements for specific known files ---

    if "frontend/lib/api.ts" in file_path:
        prompt += """
ADDITIONAL REQUIREMENTS for frontend/lib/api.ts:
- Use the native fetch API (no axios or any third-party HTTP lib)
- Base URL: http://localhost:8000
- Export exactly these four async functions with these exact signatures:
    export async function login(username: string, password: string): Promise<any>
    export async function register(username: string, password: string): Promise<any>
    export async function getMessages(): Promise<any[]>
    export async function sendMessage(content: string): Promise<any>
- Use async/await throughout
- Throw an Error if response.ok is false (include status code in the message)
- Return the parsed JSON body on success
"""

    elif "backend/routes/auth.py" in file_path:
        prompt += """
ADDITIONAL REQUIREMENTS for backend/routes/auth.py:
- Use FastAPI APIRouter
- POST /auth/register: accept { username, password }, create user, return token
- POST /auth/login: accept { username, password }, verify credentials, return token
- Hash passwords (use passlib with bcrypt)
- Return consistent JSON: { "token": "...", "username": "..." }
- Match the exact field names that frontend/lib/api.ts sends in its request body
"""

    elif "backend/routes/chat.py" in file_path:
        prompt += """
ADDITIONAL REQUIREMENTS for backend/routes/chat.py:
- Use FastAPI APIRouter
- GET /messages: return list of all messages ordered by timestamp ascending
- POST /messages: accept { content: str }, save with sender + timestamp, return saved message
- Protect both routes with Bearer token auth (match the token format auth.py issues)
- Message objects must have fields: { id, content, sender, timestamp }
- Match the exact shape that frontend/lib/api.ts expects in its responses
"""

    return prompt


# =========================================
# 🚀 MAIN DEVELOPER FUNCTION
# =========================================

async def run_developer(memory, stream_callback=None) -> dict:
    """
    Generates all files in the architecture's file_structure, one by one.

    Each file is generated with full awareness of previously generated files
    so imports, function names, API field names, and types stay consistent
    across the entire codebase.

    Key design decisions:
    - streaming=False: we need the complete response to parse delimiters
    - max_tokens should be 4096+ in get_llm() for Groq — set it there
    - Hard fail on any file that cannot be generated after MAX_RETRIES
    - context_so_far grows after each success so later files are informed
    """

    llm = get_llm("developer", streaming=False)

    plan         = memory.read("plan")
    architecture = memory.read("architecture")

    if not plan or not architecture:
        raise ValueError("Developer agent requires both 'plan' and 'architecture' in memory.")

    file_structure = architecture.get("file_structure", [])
    valid_file_structure = sanitize_file_structure(file_structure)
    if not valid_file_structure:
        raise ValueError("No valid file paths found in architecture.file_structure.")

    generated_files = []   # Final list of { filename, language, content }
    context_so_far  = []   # Grows after each successful generation

    # =========================================
    # 🔁 FILE-BY-FILE GENERATION LOOP
    # =========================================

    for file_path in valid_file_structure:

        if stream_callback:
            await stream_callback("developer_step", f"Generating: {file_path}")

        MAX_RETRIES = 3
        content  = ""
        filename = file_path

        for attempt in range(MAX_RETRIES):

            if stream_callback:
                await stream_callback(
                    "developer_attempt",
                    f"{file_path} — attempt {attempt + 1}/{MAX_RETRIES}"
                )

            # Build prompt — passes all files generated so far as context
            prompt = build_prompt(
                file_path,
                plan,
                architecture,
                attempt=attempt,
                previously_generated=context_so_far
            )

            try:
                response      = await llm.ainvoke(prompt)
                response_text = response.content or ""
            except Exception as e:
                error_msg = str(e)
                if stream_callback:
                    await stream_callback("developer_error", error_msg)

                # Groq rate limit — wait longer before retrying
                if "RESOURCE_EXHAUSTED" in error_msg or "rate_limit" in error_msg.lower():
                    await asyncio.sleep(5)
                else:
                    await asyncio.sleep(1)
                continue

            # Parse using delimiters — immune to JSON escaping issues
            filename, content = parse_code_response(response_text, fallback_path=file_path)

            if not is_valid_filename(filename):
                raise ValueError(f"Developer generated invalid filename: {filename}")

            if content and len(content.strip()) > 20:
                break  # Valid content received — exit retry loop

            await asyncio.sleep(1)  # Brief pause before retry

        # =========================================
        # HARD FAIL — never silently skip a file
        # =========================================
        if not content or len(content.strip()) < 20:
            error_msg = (
                f"Failed to generate file after {MAX_RETRIES} retries: {file_path}"
            )
            memory.write("developer_last_error", error_msg)
            memory.write("developer_error_context", error_msg)
            raise ValueError(error_msg)

        # =========================================
        # SUCCESS — record file and update context
        # =========================================

        file_record = {
            "filename": filename,
            "language": filename.rsplit(".", 1)[-1] if "." in filename else "txt",
            "content":  content
        }

        generated_files.append(file_record)

        # Key line: the next file will see this file's full content
        context_so_far.append({
            "filename": filename,
            "content":  content
        })

        if stream_callback:
            await stream_callback(
                "developer_success",
                f"Generated: {filename} ({len(content.splitlines())} lines)"
            )

        # Small delay between files — respects Groq rate limits
        await asyncio.sleep(0.3)

    # =========================================
    # 🧠 FINAL VALIDATION
    # =========================================

    if len(generated_files) != len(valid_file_structure):
        raise ValueError(
            f"File count mismatch: expected {len(valid_file_structure)}, "
            f"got {len(generated_files)}"
        )

    # =========================================
    # 💾 STORE RESULT IN MEMORY
    # =========================================

    memory.write("files", {"files": generated_files})
    memory.write("developer_last_error", None)

    return {"files": generated_files}