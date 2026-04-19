from typing import Any, Dict, List


def is_valid_filename(filename: Any) -> bool:
    if not isinstance(filename, str):
        return False

    name = filename.strip()
    if not name:
        return False
    if name.endswith("/"):
        return False
    if "." not in name:
        return False

    return True


def sanitize_file_structure(file_structure: Any) -> List[str]:
    if not isinstance(file_structure, list):
        return []

    sanitized: List[str] = []
    seen = set()

    for item in file_structure:
        if not is_valid_filename(item):
            continue

        normalized = item.strip().replace("\\", "/")
        if normalized in seen:
            continue

        seen.add(normalized)
        sanitized.append(normalized)

    return sanitized


def extract_valid_files(files_container: Any) -> List[Dict[str, str]]:
    if isinstance(files_container, dict):
        raw_files = files_container.get("files", [])
    elif isinstance(files_container, list):
        raw_files = files_container
    else:
        raw_files = []

    if not isinstance(raw_files, list):
        return []

    valid: List[Dict[str, str]] = []

    for item in raw_files:
        if not isinstance(item, dict):
            continue

        filename = item.get("filename") or item.get("name")
        content = item.get("content")

        if not is_valid_filename(filename):
            continue
        if not isinstance(content, str):
            continue

        valid.append(
            {
                "filename": filename.strip().replace("\\", "/"),
                "content": content,
            }
        )

    return valid