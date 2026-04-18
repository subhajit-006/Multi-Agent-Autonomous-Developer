# MAAD N8N Architecture - Quick Reference

## Execution Flow

### 1. Request arrives at N8N Webhook
```
User/Frontend → N8N Webhook (/webhook/maad-pipeline-webhook)
↓
{
  "task": "Build a todo app",
  "scope": "minimal"
}
```

### 2. Pipeline Initialization
```
N8N: Init Pipeline Node
↓
POST /pipeline/init
↓
Backend returns:
{
  "session_id": "abc-123-def"
}
```

### 3. Sequential Agent Execution (with Data Flow)

#### Agent 1: Planner
```
POST /agent/planner
{
  "session_id": "abc-123-def",
  "task": "Build a todo app",
  "scope": "minimal"
}
↓
Response:
{
  "status": "success",
  "output": {
    "project_name": "Todo App",
    "description": "...",
    "features": ["Add items", "Delete items", ...],
    "tasks": ["..."],
    "estimated_files": 4
  }
}
```

#### Agent 2: Architect (receives Planner output)
```
POST /agent/architect
{
  "session_id": "abc-123-def",
  "plan": { /* from Planner */ }
}
↓
Response:
{
  "status": "success",
  "output": {
    "tech_stack": {
      "frontend": "Next.js",
      "backend": "FastAPI",
      "database": "SQLite"
    },
    "file_structure": ["components/", "api/", ...],
    "api_endpoints": ["/api/todos", ...],
    "notes": "..."
  }
}
```

#### Agent 3: Developer (receives Planner + Architect output)
```
POST /agent/developer
{
  "session_id": "abc-123-def",
  "plan": { /* from Planner */ },
  "architecture": { /* from Architect */ }
}
↓
Response:
{
  "status": "success",
  "output": {
    "files": {
      "app/page.tsx": "export default function...",
      "app/api/todos/route.ts": "export async function...",
      ...
    }
  }
}
```

#### Agent 4: Debugger (reviews generated code)
```
POST /agent/debugger
{
  "session_id": "abc-123-def",
  "files": { /* from Developer */ }
}
↓
Response:
{
  "status": "success",
  "output": {
    "issues_found": 2,
    "fixes": ["Added missing import", "Fixed TypeError"],
    "corrected_files": {}
  }
}
```

#### Agent 5: Tester (generates tests)
```
POST /agent/tester
{
  "session_id": "abc-123-def",
  "files": { /* from Developer */ }
}
↓
Response:
{
  "status": "success",
  "output": {
    "test_file_path": "app/__tests__/todo.test.ts",
    "test_file_content": "describe('Todo App'...",
    "test_cases": ["should add item", "should delete item"],
    "coverage_areas": ["Add functionality", "Delete functionality"]
  }
}
```

### 4. Final State Retrieval
```
N8N: Get Final Session State Node
↓
GET /session/abc-123-def
↓
Response contains ALL outputs:
{
  "session_id": "abc-123-def",
  "task": "Build a todo app",
  "scope": "minimal",
  "plan": { /* Planner output */ },
  "architecture": { /* Architect output */ },
  "files": { /* Developer output */ },
  "debug_report": { /* Debugger output */ },
  "test_cases": { /* Tester output */ },
  "started_at": "2026-04-18T10:00:00Z"
}
```

### 5. Response to Webhook Caller
```
N8N: Return Response Node
↓
Status 200 OK
{
  "session_id": "abc-123-def",
  "status": "completed",
  "agents_executed": ["planner", "architect", "developer", "debugger", "tester"],
  "has_files": true,
  "has_test_cases": true
}
```

## Error Handling & Retries

Each agent endpoint has automatic retry configuration:
- Planner, Architect, Developer: **3 retries** (5 second delays)
- Debugger, Tester: **2 retries** (5 second delays)

If an agent fails after retries:
- N8N catches the error
- Returns 500 with error details
- Workflow can be configured to continue or stop

## State Persistence

All outputs are stored in SQLite:
```
sessions.db
├── session_id: "abc-123-def"
├── created_at: "2026-04-18T10:00:00Z"
├── updated_at: "2026-04-18T10:05:00Z"
└── data: {
    "task": "...",
    "scope": "...",
    "plan": {...},
    "architecture": {...},
    "files": {...},
    "debug_report": {...},
    "test_cases": {...}
  }
```

## Model Execution (Per-Agent)

Each agent uses the configured model from `.env`:

```
Planner       → PLANNER_MODEL       (google/gemma-4:free)
Architect     → ARCHITECT_MODEL     (meta-llama/llama-3-70b:free)
Developer     → DEVELOPER_MODEL     (google/gemma-4:free)
Debugger      → DEBUGGER_MODEL      (meta-llama/llama-3-8b:free)
Tester        → TESTER_MODEL        (google/gemma-4:free)
```

All models use OpenRouter API endpoint:
```
https://openrouter.ai/api/v1
```

## Database Schema

```sql
CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  data TEXT  -- JSON string containing all agent outputs
);
```

Example session data:
```json
{
  "task": "Build a todo app",
  "scope": "minimal",
  "started_at": "2026-04-18T10:00:00Z",
  "decision_log": [
    {"timestamp": "10:00:01", "key": "task", "action": "Updated state for 'task'"},
    {"timestamp": "10:00:05", "key": "plan", "action": "Updated state for 'plan'"},
    ...
  ],
  "plan": {...},
  "architecture": {...},
  "files": {...},
  "debug_report": {...},
  "test_cases": {...}
}
```

## Performance Characteristics

Estimated execution times (per agent):
- Planner: 10-15 seconds
- Architect: 15-20 seconds
- Developer: 30-45 seconds (depends on file count)
- Debugger: 10-15 seconds
- Tester: 15-25 seconds

**Total pipeline**: 80-120 seconds (1.5-2 minutes)

## Scaling Considerations

### Single Instance
- Handles ~10 concurrent requests
- Single SQLite database
- Sufficient for development

### Multiple Instances (Horizontal Scaling)
1. Run multiple FastAPI instances behind load balancer
2. Switch to PostgreSQL for `sessions.db`
3. Add Redis for caching planner results
4. Use N8N clustering for reliability

### Optimization Tips
- Cache planner outputs for similar tasks
- Reuse architecture for same tech stacks
- Parallel agent execution (advanced N8N workflows)
- Model-specific prompt tuning

## Monitoring & Debugging

### FastAPI Health Check
```bash
curl http://localhost:8000/health
```

### N8N Monitoring
- Dashboard: http://localhost:5678
- Execution history visible in UI
- Logs show request/response for each node

### Backend Logs
```bash
docker-compose logs backend
# or
docker-compose logs -f backend  # tail logs
```

### Database Inspection (SQLite)
```bash
sqlite3 ./sessions.db
sqlite> SELECT session_id, created_at FROM sessions;
```

## Configuration Override Examples

### Use Claude 3 Sonnet for Planning
In `.env`:
```
PLANNER_MODEL=anthropic/claude-3-sonnet
```

### Use GPT-4 for Architecture
```
ARCHITECT_MODEL=openai/gpt-4-turbo-preview
```

### Mixed Models Strategy
```
PLANNER_MODEL=google/gemma-4:free            # Fast planning
ARCHITECT_MODEL=anthropic/claude-3-opus      # Best architecture (paid)
DEVELOPER_MODEL=google/gemma-4:free          # Fast coding
DEBUGGER_MODEL=meta-llama/llama-3-8b:free   # Quick reviews
TESTER_MODEL=google/gemma-4:free             # Adequate tests
```

---

**Version**: 2.0.0 (N8N Integrated)
