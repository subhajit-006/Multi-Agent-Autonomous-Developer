# MAAD N8N Integration Setup Guide

## Overview

This guide explains the new **N8N-integrated architecture** for MAAD (Multi-Agent Autonomous Developer) with per-agent model configuration.

## Architecture

```
Frontend (Next.js)
    ↓
N8N Workflow (Orchestrator)
    ├→ /agent/planner (Model: Gemma-4)
    ├→ /agent/architect (Model: Llama-3-70B)
    ├→ /agent/developer (Model: Gemma-4)
    ├→ /agent/debugger (Model: Llama-3-8B)
    └→ /agent/tester (Model: Gemma-4)
    ↓
FastAPI Backend (Session Storage)
```

## Key Features

### 1. **Per-Agent Model Configuration**
Each agent uses a different LLM model optimized for its task:

| Agent | Task | Model | Why |
|-------|------|-------|-----|
| Planner | Create dev plan | Gemma-4 | Fast, efficient planning |
| Architect | Design system | Llama-3-70B | Best reasoning for architecture |
| Developer | Write code | Gemma-4 | Excellent code generation |
| Debugger | Review & fix | Llama-3-8B | Lightweight, fast reviews |
| Tester | Generate tests | Gemma-4 | Good test case generation |

### 2. **N8N Orchestration**
- Visual workflow management
- Built-in error handling & retries
- Easy to add/remove agents
- Monitor execution in real-time
- Trigger from multiple sources

### 3. **Session-Based State Management**
- SQLite database stores session state
- Each request gets a unique `session_id`
- All agent outputs persist for later retrieval
- Support for Redis caching (optional)

## Setup Instructions

### 1. **Prerequisites**
- Docker & Docker Compose
- OpenRouter API key (get free tier at https://openrouter.ai)
- Python 3.11+ (if running locally)

### 2. **Environment Configuration**

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update your OpenRouter API key:
```bash
OPENROUTER_API_KEY=sk-or-xxxxx
```

Optional: Customize per-agent models in `.env`:
```bash
PLANNER_MODEL=google/gemma-4-26b-a4b-it:free
ARCHITECT_MODEL=meta-llama/llama-3-70b-instruct:free
DEVELOPER_MODEL=google/gemma-4-26b-a4b-it:free
DEBUGGER_MODEL=meta-llama/llama-3-8b-instruct:free
TESTER_MODEL=google/gemma-4-26b-a4b-it:free
```

### 3. **Start Services with Docker Compose**

```bash
docker-compose up -d
```

This starts:
- **FastAPI Backend** (http://localhost:8000)
- **N8N** (http://localhost:5678)
- **Frontend** (http://localhost:3000)

### 4. **Import N8N Workflow**

1. Open N8N at http://localhost:5678
2. Click **"+" → "Import Workflow"**
3. Upload `maad_n8n_workflow_v2.json`
4. Click **"Activate"** to enable the workflow

### 5. **Test the Pipeline**

#### Option A: Using N8N UI
1. In N8N, click the webhook trigger node
2. Click **"Execute Node"** 
3. Test with JSON:
```json
{
  "task": "Build a todo app",
  "scope": "minimal"
}
```

#### Option B: Using cURL
```bash
curl -X POST http://localhost:5678/webhook/maad-pipeline-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Build a todo app",
    "scope": "minimal"
  }'
```

#### Option C: Using Frontend
1. Open http://localhost:3000
2. Enter task and scope
3. Click "Generate"

## API Endpoints

### Pipeline Initialization
```
POST /pipeline/init
{
  "task": "Build a todo app",
  "scope": "minimal|standard|full"
}

Response:
{
  "session_id": "uuid",
  "status": "initialized"
}
```

### Individual Agent Endpoints (called by N8N)
```
POST /agent/{agent_name}
{
  "session_id": "uuid",
  "task": "...",
  "scope": "...",
  [previous outputs...]
}

Response:
{
  "status": "success|error",
  "agent": "agent_name",
  "output": {...},
  "duration_seconds": 12.3,
  "error": null
}
```

### Get Session State
```
GET /session/{session_id}

Response:
{
  "task": "...",
  "scope": "...",
  "plan": {...},
  "architecture": {...},
  "files": {...},
  "debug_report": {...},
  "test_cases": {...}
}
```

### Health Check
```
GET /health

Response:
{
  "status": "ok",
  "version": "2.0.0",
  "models": {
    "planner": "...",
    "architect": "...",
    ...
  }
}
```

## N8N Workflow Structure

```
Webhook (Entry Point)
  ↓
Init Pipeline (Creates session)
  ↓
Run Planner (Task → Plan)
  ↓
Run Architect (Plan → Architecture)
  ↓
Run Developer (Plan + Architecture → Code Files)
  ↓
Run Debugger (Code → Debug Report)
  ↓
Run Tester (Code → Test Cases)
  ↓
Get Final Session State
  ↓
Format Response
  ↓
Return Response to Webhook
```

## Configuration Examples

### Using Premium Models
In `.env`, replace free models with paid alternatives:

```bash
# Claude 3 Sonnet (Anthropic)
PLANNER_MODEL=anthropic/claude-3-sonnet

# GPT-4 (OpenAI)
DEVELOPER_MODEL=openai/gpt-4-turbo

# Claude 3 Opus (best quality)
ARCHITECT_MODEL=anthropic/claude-3-opus
```

### Using Mistral for Cost Efficiency
```bash
PLANNER_MODEL=mistralai/mistral-large
DEVELOPER_MODEL=mistralai/mistral-medium
DEBUGGER_MODEL=mistralai/mistral-small
```

## Scaling & Production

### Horizontal Scaling
1. Run multiple FastAPI instances behind Nginx
2. Use PostgreSQL instead of SQLite for `sessions.db`
3. Add Redis for caching and session sharing

### Monitoring
- N8N has built-in execution logs
- FastAPI logs output to stdout
- Set `LOG_LEVEL=DEBUG` for verbose logging

### Performance Tuning
- Adjust `retryNumber` in N8N nodes based on model reliability
- Use lighter models (Llama-3-8B) for faster response
- Cache planner results for repeated tasks

## Troubleshooting

### Backend Connection Error
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check logs
docker-compose logs backend
```

### N8N Workflow Not Running
1. Verify webhook URL is correct
2. Check N8N logs: `docker-compose logs n8n`
3. Re-import workflow JSON

### Model Not Found Error
```bash
# Verify OpenRouter API key
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/models
```

### Session Not Found
- Session IDs are valid for the lifetime of the container
- Restart services will clear sessions
- Use PostgreSQL for persistence

## Next Steps

1. ✅ Basic N8N integration working
2. 🔲 Add authentication to agent endpoints
3. 🔲 Implement result webhooks to frontend
4. 🔲 Add support for custom model parameters
5. 🔲 Create advanced workflows (parallel agents, conditional logic)
6. 🔲 Set up monitoring with ELK/Datadog

## Support

For issues or questions:
1. Check N8N logs in the UI
2. Check FastAPI logs: `docker-compose logs backend`
3. Verify `.env` configuration
4. Test endpoints individually with cURL

---

**Version**: 2.0.0 (N8N Integrated)  
**Last Updated**: 2026-04-18
