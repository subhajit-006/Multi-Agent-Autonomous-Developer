# MAAD Backend API Endpoints

This document explains all currently registered backend route endpoints from the FastAPI app.

## Base URL

- Local default: `http://localhost:8000`

## Health

### GET /health

Checks if the backend is alive.

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-04-19T10:22:33.123456"
}
```

## Agent

Prefix: `/agent`

### POST /agent/run

Runs one agent directly.

Request body:

```json
{
  "agent": "planner",
  "memory": {},
  "task": "Build a landing page",
  "scope": "minimal"
}
```

Notes:
- `memory`, `task`, and `scope` are optional (except `agent`).
- Status in returned memory is set to `running` during execution, then `completed` or `failed`.

Response shape:

```json
{
  "run_id": "<uuid>",
  "agent": "planner",
  "status": "completed",
  "result": {},
  "memory": {}
}
```

## Pipeline

Prefix: `/pipeline`

### POST /pipeline/run

Starts pipeline execution in the background and returns immediately.

Request body:

```json
{
  "task": "Build me a landing page",
  "scope": "minimal",
  "flow": ["planner", "architect", "developer"]
}
```

Rules:
- Default flow is `planner -> architect -> developer`.
- `debugger` and `tester` are currently disabled and return HTTP 400 if included.
- Dependency checks are enforced (`developer` requires `planner` and `architect`, etc.).

Response:

```json
{
  "run_id": "<uuid>",
  "status": "started"
}
```

## Session

Prefix: `/session`

### POST /session/inspect

Inspects an in-memory session payload and returns meta, logs, errors, outputs, and summary.

Request body:

```json
{
  "memory": {},
  "include_logs": true,
  "include_errors": true,
  "include_outputs": true
}
```

Response keys:
- `meta`
- `summary`
- `outputs`
- `errors`
- `logs`
- `raw_memory`

## Runs

Prefix: `/runs`

### GET /runs/{run_id}

Returns run status from `runs` table.

Response:

```json
{
  "run_id": "<uuid>",
  "status": "running",
  "current_step": "developer",
  "created_at": "...",
  "updated_at": "..."
}
```

Errors:
- `404 Run not found`

### GET /runs/{run_id}/history

Returns full memory snapshot history from `memory_snapshots` table.

Response:

```json
{
  "run_id": "<uuid>",
  "steps": [
    {
      "step": "planner",
      "memory": "{...json-string...}",
      "timestamp": "..."
    }
  ],
  "total_steps": 1
}
```

Errors:
- `404 No history found for this run`

## Streaming

No prefix (`/stream/{run_id}` is mounted directly).

### GET /stream/{run_id}

Server-Sent Events (SSE) endpoint for live run progress.

Event types:
- `connected`: initial handshake
- `progress`: current `step` and `status` changes
- `developer_debug`: developer attempt/state/error/traceback updates
- `heartbeat`: keep-alive event every ~15s
- `done`: emitted when run is `completed` or `failed`
- `error`: emitted on stream/run lookup issues

Headers used:
- `Cache-Control: no-cache, no-transform`
- `Connection: keep-alive`
- `X-Accel-Buffering: no`

## Notes

- Routes are registered in `backend/main.py`.
- Database-backed run state is stored in `backend/sessions.db`.
- Startup calls database initialization (`init_db()`) before serving requests.
