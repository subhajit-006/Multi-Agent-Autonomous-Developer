# MAAD v2.0 Quick Reference Card

## 🚀 Getting Started (5 Minutes)

### 1. Start Services
```bash
cp .env.example .env
# Edit .env: Add OPENROUTER_API_KEY
docker-compose up -d
```

### 2. Import N8N Workflow
- Open http://localhost:5678
- Click "+" → "Import from File"
- Select `maad_n8n_workflow_v2.json`
- Click "Activate"

### 3. Test Immediately
```bash
curl -X POST http://localhost:5678/webhook/maad-pipeline-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Build a todo app",
    "scope": "minimal"
  }'
```

---

## 📡 API Endpoints

### Initialize Pipeline
```bash
POST http://localhost:8000/pipeline/init
{
  "task": "Build a todo app",
  "scope": "minimal|standard|full"
}

→ Returns: { "session_id": "uuid" }
```

### Trigger via Webhook (Recommended)
```bash
POST http://localhost:5678/webhook/maad-pipeline-webhook
{
  "task": "Build a todo app",
  "scope": "minimal"
}

→ Returns: Complete results after all agents finish
```

### Get Session Results
```bash
GET http://localhost:8000/session/{session_id}

→ Returns: All agent outputs + timestamps
```

### Health Check
```bash
GET http://localhost:8000/health

→ Returns: Status, version, configured models
```

---

## 🤖 Agent Models

| Agent | Default Model | Speed | Quality |
|-------|---------------|-------|---------|
| Planner | Gemma-4 | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ |
| Architect | Llama-3-70B | ⚡⚡ | ⭐⭐⭐⭐⭐ |
| Developer | Gemma-4 | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| Debugger | Llama-3-8B | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ |
| Tester | Gemma-4 | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ |

### Change Models in .env
```bash
PLANNER_MODEL=anthropic/claude-3-sonnet
ARCHITECT_MODEL=openai/gpt-4-turbo-preview
DEVELOPER_MODEL=anthropic/claude-3-opus
```

---

## 📁 Project Structure

```
backend/
├── main.py              ← Modified (agent endpoints, SessionStore)
├── orchestrator.py      ← Legacy (no longer used by default)
├── agents/
│   ├── planner.py       ← Uses PLANNER_MODEL
│   ├── architect.py     ← Uses ARCHITECT_MODEL
│   ├── developer.py     ← Uses DEVELOPER_MODEL
│   ├── debugger.py      ← Uses DEBUGGER_MODEL
│   └── tester.py        ← Uses TESTER_MODEL
└── requirements.txt     ← Updated

sessions.db             ← SQLite state store (auto-created)
```

---

## 🔧 Configuration Presets

### Cost-Optimized (Free Tier)
```bash
PLANNER_MODEL=google/gemma-4-26b-a4b-it:free
ARCHITECT_MODEL=meta-llama/llama-3-70b-instruct:free
DEVELOPER_MODEL=google/gemma-4-26b-a4b-it:free
DEBUGGER_MODEL=meta-llama/llama-3-8b-instruct:free
TESTER_MODEL=google/gemma-4-26b-a4b-it:free
```

### Premium Quality
```bash
PLANNER_MODEL=anthropic/claude-3-sonnet
ARCHITECT_MODEL=anthropic/claude-3-opus
DEVELOPER_MODEL=anthropic/claude-3-opus
DEBUGGER_MODEL=openai/gpt-4-turbo-preview
TESTER_MODEL=anthropic/claude-3-sonnet
```

### Balanced (Cost + Quality)
```bash
PLANNER_MODEL=google/gemma-4-26b-a4b-it:free        # Fast
ARCHITECT_MODEL=anthropic/claude-3-sonnet           # Best reasoning
DEVELOPER_MODEL=google/gemma-4-26b-a4b-it:free      # Fast coding
DEBUGGER_MODEL=meta-llama/llama-3-8b-instruct:free # Quick
TESTER_MODEL=google/gemma-4-26b-a4b-it:free        # Adequate
```

---

## 🐳 Docker Commands

### View Logs
```bash
docker-compose logs -f backend     # FastAPI logs
docker-compose logs -f n8n         # N8N logs
docker-compose logs -f frontend    # Next.js logs
```

### Restart Service
```bash
docker-compose restart backend     # Restart backend only
docker-compose restart              # Restart all services
```

### Clean Up
```bash
docker-compose down                 # Stop all services
rm sessions.db                       # Clear sessions
docker system prune -a              # Free disk space
```

---

## 🧪 Testing Examples

### Test Planner Agent Only
```bash
curl -X POST http://localhost:8000/agent/planner \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-123",
    "task": "Build a todo app",
    "scope": "minimal"
  }'
```

### Test Full Pipeline via N8N
Open N8N UI → Select Workflow → Click "Execute"

### Test via Frontend
http://localhost:3000

---

## 📊 Expected Output

### Session Response Format
```json
{
  "session_id": "abc-123-def-456",
  "task": "Build a todo app",
  "scope": "minimal",
  "started_at": "2026-04-18T10:00:00Z",
  "plan": {
    "project_name": "Todo App",
    "features": ["Add items", "Delete items"]
  },
  "architecture": {
    "tech_stack": {"frontend": "Next.js", ...},
    "file_structure": [...]
  },
  "files": {
    "app/page.tsx": "export default...",
    "app/api/todos/route.ts": "..."
  },
  "debug_report": {
    "issues_found": 0
  },
  "test_cases": {
    "test_file_path": "..."
  }
}
```

---

## 🚨 Common Issues

### "N8N connection refused"
```bash
# Check N8N is running
curl http://localhost:5678/health

# View N8N logs
docker-compose logs n8n

# Restart N8N
docker-compose restart n8n
```

### "OpenRouter API error"
```bash
# Verify API key
echo $OPENROUTER_API_KEY

# Check .env file exists with key
cat .env | grep OPENROUTER

# Test API directly
curl -H "Authorization: Bearer YOUR_KEY" \
  https://openrouter.ai/api/v1/models
```

### "Session not found"
```bash
# Sessions stored in SQLite
# Check if database exists
ls -la sessions.db

# List all sessions
sqlite3 sessions.db "SELECT session_id FROM sessions;"

# Clear old sessions (if corrupted)
rm sessions.db  # Will recreate on next run
```

---

## ⚡ Performance Tips

1. **Use free models for fastest response** (Gemma-4, Llama-3-8B)
2. **Use Claude for best architecture** (slower but best reasoning)
3. **Cache planner results** (same task → same plan)
4. **Monitor N8N dashboard** to see bottlenecks
5. **Increase resources** if consistently > 2 minutes

---

## 📚 Additional Resources

- **Setup Guide**: [N8N_SETUP_GUIDE.md](./N8N_SETUP_GUIDE.md)
- **Architecture**: [N8N_ARCHITECTURE_REFERENCE.md](./N8N_ARCHITECTURE_REFERENCE.md)
- **Migration**: [MIGRATION_GUIDE_V2.md](./MIGRATION_GUIDE_V2.md)
- **Main Docs**: [README.md](./README.md)

---

## 💡 Pro Tips

1. **Monitor execution in real-time**: Open N8N UI while workflow runs
2. **Customize prompts**: Edit agent.py files to customize behavior
3. **Add webhooks**: N8N can send results to Slack, Discord, etc.
4. **Use expressions**: N8N supports dynamic expressions in HTTP nodes
5. **Version workflows**: Export/import workflows for version control

---

**Version**: 2.0.0 Quick Reference  
**Last Updated**: 2026-04-18
