from pathlib import Path
import sqlite3
import json
from datetime import datetime

DB_FILE = Path(__file__).resolve().parent.parent / "sessions.db"


def get_connection():
    return sqlite3.connect(DB_FILE)


def init_db() -> None:
    conn = get_connection()
    try:
        cursor = conn.cursor()

        # 🧠 Main run table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS runs (
                run_id TEXT PRIMARY KEY,
                status TEXT,
                current_step TEXT,
                created_at TEXT,
                updated_at TEXT
            )
            """
        )

        # 📦 Memory snapshots
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS memory_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id TEXT,
                step TEXT,
                memory_json TEXT,
                created_at TEXT
            )
            """
        )

        # 🧾 Final run output payload (same structure as exported response JSON)
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS run_outputs (
                run_id TEXT PRIMARY KEY,
                response_json TEXT,
                created_at TEXT,
                updated_at TEXT
            )
            """
        )

        conn.commit()
    finally:
        conn.close()


# 🧠 Save or update run state
def upsert_run(run_id: str, status: str, current_step: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        now = datetime.utcnow().isoformat()

        cursor.execute(
            """
            INSERT INTO runs (run_id, status, current_step, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(run_id) DO UPDATE SET
                status=excluded.status,
                current_step=excluded.current_step,
                updated_at=excluded.updated_at
            """,
            (run_id, status, current_step, now, now),
        )

        conn.commit()
    finally:
        conn.close()


# 📦 Save memory snapshot
def save_memory_snapshot(run_id: str, step: str, memory: dict):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO memory_snapshots (run_id, step, memory_json, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (run_id, step, json.dumps(memory), datetime.utcnow().isoformat()),
        )

        conn.commit()
    finally:
        conn.close()


# 🔍 Fetch run
def get_run(run_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM runs WHERE run_id = ?", (run_id,))

        return cursor.fetchone()
    finally:
        conn.close()


def get_run_status(run_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT status, current_step FROM runs WHERE run_id = ?", (run_id,)
        )

        row = cursor.fetchone()

        if not row:
            return None

        return {"status": row[0], "current_step": row[1]}
    finally:
        conn.close()


# 🔍 Fetch memory history
def get_memory_history(run_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT step, memory_json, created_at
            FROM memory_snapshots
            WHERE run_id = ?
            ORDER BY created_at ASC
            """,
            (run_id,),
        )

        return cursor.fetchall()
    finally:
        conn.close()


def get_latest_memory_snapshot(run_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT step, memory_json, created_at
            FROM memory_snapshots
            WHERE run_id = ?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (run_id,),
        )

        row = cursor.fetchone()
        if not row:
            return None

        step, memory_json, created_at = row

        try:
            memory = json.loads(memory_json) if memory_json else {}
        except json.JSONDecodeError:
            memory = {}

        return {
            "step": step,
            "memory": memory,
            "created_at": created_at,
        }
    finally:
        conn.close()


# 🧾 Save or update final response payload
def upsert_run_output(run_id: str, response: dict):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()

        cursor.execute(
            """
            INSERT INTO run_outputs (run_id, response_json, created_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(run_id) DO UPDATE SET
                response_json=excluded.response_json,
                updated_at=excluded.updated_at
            """,
            (run_id, json.dumps(response), now, now),
        )

        conn.commit()
    finally:
        conn.close()


# 🔍 Fetch final response payload
def get_run_output(run_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT response_json FROM run_outputs WHERE run_id = ?", (run_id,)
        )

        row = cursor.fetchone()
        if not row:
            return None

        return json.loads(row[0])
    finally:
        conn.close()
