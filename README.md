# MAAD (Multi-Agent Autonomous Developer) v2.0

MAAD is an advanced AI orchestration system featuring **5 specialized agents** (Planner, Architect, Developer, Debugger, Tester) working in a transparent pipeline. **Now with N8N integration and per-agent model optimization**, you can configure different LLMs for each agent to maximize quality while controlling costs.

Transform plain-English product ideas into production-ready full-stack applications.

![MAAD Demo Placeholder](https://via.placeholder.com/1200x600.png?text=MAAD+N8N+Orchestration)

## 🏗 System Architecture (N8N Integrated)

```
                     ┌──────────────────────┐
                     │    USER PROMPT       │
                     │  "Build a todo app"  │
                     └──────────┬───────────┘
                                │
                     [ Next.js Frontend ]
                                │
         ┌──────────────────────▼──────────────────────┐
         │          N8N ORCHESTRATOR                   │
         │     (Webhook → Sequential Agent Calls)      │
         └──────────────────────┬──────────────────────┘
                                │
    ┌────────────┬──────────────┼──────────────┬───────────────┐
    │            │              │              │               │
    ▼            ▼              ▼              ▼               ▼
  ┌───────┐   ┌──────────┐  ┌────────────┐  ┌────────┐   ┌────────┐
  │Planner│   │Architect │  │ Developer  │  │Debugger│   │ Tester │
  │       │   │          │  │            │  │        │   │        │
  │Gemma4 │   │Llama-70B │  │ Gemma-4    │  │Llama-8B│   │Gemma-4 │
  └───────┘   └──────────┘  └────────────┘  └────────┘   └────────┘
                                │
         ┌──────────────────────▼──────────────────────┐
         │      FASTAPI BACKEND + SESSION DB           │
         │  (SQLite state persistence, model routing)  │
         └───────────────────────────────────────────────┘
```

## ✨ Key Features (v2.0)

### 🎯 Per-Agent Model Configuration
Each agent uses an optimized model for its specific task:

| Agent | Model | Task | Quality | Speed |
|-------|-------|------|---------|-------|
| Planner | Gemma-4 | Create dev plan | ⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ |
| Architect | Llama-3-70B | Design system | ⭐⭐⭐⭐⭐ | ⚡⚡ |
| Developer | Gemma-4 | Write code | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡ |
| Debugger | Llama-3-8B | Review & fix | ⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ |
| Tester | Gemma-4 | Generate tests | ⭐⭐⭐⭐ | ⚡⚡⚡⚡ |

### 🔄 N8N Orchestration
- **Visual Workflow Designer** - See and modify the pipeline in the UI
- **Error Handling & Retries** - Built-in resilience for each agent
- **Easy Extensibility** - Add agents or modify flow without code changes
- **Real-time Monitoring** - Watch execution progress with N8N's dashboard
- **Webhook Triggers** - Integrate with external systems

### 💾 Session-Based State Management
- **Persistent Storage** - All agent outputs saved in SQLite
- **Resumable Pipelines** - Query any session to retrieve outputs
- **Scalable** - Drop-in PostgreSQL support for production

### 🚀 Model Flexibility
- **Free Tier Ready** - All default models available on OpenRouter free tier
- **Custom Models** - Switch to Claude, GPT-4, or any OpenRouter model
- **Cost Optimization** - Mix free and paid models strategically

## 🚀 Quickstart

### 1️⃣ **Prerequisites**
- Docker & Docker Compose
- OpenRouter API key (free tier: https://openrouter.ai)

### 2️⃣ **Clone & Configure**
```bash
git clone https://github.com/maad-dev/maad.git
cd maad
cp .env.example .env
```

Update `.env` with your OpenRouter API key:
```bash
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxx
```

### 3️⃣ **Start All Services**
```bash
docker-compose up -d
```

Services will be available at:
- 🖥️ **Frontend**: http://localhost:3000
- 🔧 **FastAPI Backend**: http://localhost:8000
- ⚙️ **N8N**: http://localhost:5678

### 4️⃣ **Import N8N Workflow**
1. Open http://localhost:5678 (N8N)
2. Click **"+" → "Import from File"**
3. Select `maad_n8n_workflow_v2.json`
4. Click **"Activate"** to enable workflow

### 5️⃣ **Test the Pipeline**
```bash
# Using cURL
curl -X POST http://localhost:5678/webhook/maad-pipeline-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Build a todo app with Next.js",
    "scope": "minimal"
  }'

# Or use the frontend at http://localhost:3000
```

## 📖 Documentation

- **[N8N Setup Guide](./N8N_SETUP_GUIDE.md)** - Detailed setup & configuration
- **[Architecture Reference](./N8N_ARCHITECTURE_REFERENCE.md)** - Data flow & API reference
- **[Backend Details](./BACKEND_STRUCTURE.md)** - Python code structure

## ⚙️ Configuration

### Custom Models Per Agent
Edit `.env` to use different models:

```bash
# Free tier (default)
PLANNER_MODEL=google/gemma-4-26b-a4b-it:free
ARCHITECT_MODEL=meta-llama/llama-3-70b-instruct:free
DEVELOPER_MODEL=google/gemma-4-26b-a4b-it:free
DEBUGGER_MODEL=meta-llama/llama-3-8b-instruct:free
TESTER_MODEL=google/gemma-4-26b-a4b-it:free

# Premium models (update OpenRouter account)
# ARCHITECT_MODEL=anthropic/claude-3-opus
# DEVELOPER_MODEL=openai/gpt-4-turbo
```

### Deployment Options

**Docker Compose** (Development)
```bash
docker-compose up
```

**Production Scaling**
```bash
# Use PostgreSQL instead of SQLite
# Deploy multiple FastAPI instances behind nginx/k8s
# Add Redis for caching
# See N8N_SETUP_GUIDE.md for details
```

## 🏃 Manual Development Setup

**Frontend (Next.js)**
```bash
cd frontend && npm install && npm run dev
```

**Backend (FastAPI)**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📊 Performance

Typical execution timeline:
- Planner: 10-15s
- Architect: 15-20s  
- Developer: 30-45s
- Debugger: 10-15s
- Tester: 15-25s

**Total**: ~80-120 seconds (1.5-2 minutes) for complete pipeline

## 🛠 Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, TypeScript
- **Backend**: Python 3.11+, FastAPI, Pydantic, SQLite/PostgreSQL
- **Orchestration**: N8N (self-hosted)
- **AI Models**: OpenRouter API (Gemma-4, Llama-3, Claude, GPT-4, etc.)
- **Deployment**: Docker, Docker Compose

## 📝 API Overview

### Initialize Pipeline
```bash
POST /pipeline/init
{
  "task": "Build a todo app",
  "scope": "minimal|standard|full"
}
```

### Get Session Results
```bash
GET /session/{session_id}
```

### Individual Agent Endpoints (called by N8N)
```bash
POST /agent/planner
POST /agent/architect
POST /agent/developer
POST /agent/debugger
POST /agent/tester
```

See [API Reference](./N8N_ARCHITECTURE_REFERENCE.md) for details.

## 🐛 Troubleshooting

**Backend not responding?**
```bash
docker-compose logs backend
curl http://localhost:8000/health
```

**N8N workflow not running?**
```bash
docker-compose logs n8n
# Re-import maad_n8n_workflow_v2.json
```

**Model not found?**
```bash
# Verify OpenRouter API key and account
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/models | grep -i gemma
```

## 📈 Scaling Strategy

1. **Single Instance** - Perfect for development (10 concurrent requests)
2. **Horizontal Scaling** - Run multiple backends with load balancer + PostgreSQL
3. **Advanced Workflows** - Use N8N's parallel execution for multiple agents
4. **Caching** - Redis for planner output reuse
5. **Monitoring** - ELK stack or Datadog integration

## 🗓️ Roadmap

- [x] Per-agent model configuration
- [x] N8N integration (v2.0)
- [x] Session-based state management
- [ ] Parallel agent execution
- [ ] Custom workflow templates
- [ ] Result webhooks to external systems
- [ ] Advanced model parameter tuning
- [ ] Multi-language code generation
- [ ] Kubernetes deployment

## 📄 License
MIT License - See LICENSE file

## 👥 Contributing
Contributions welcome! See CONTRIBUTING.md

---

**Version**: 2.0.0 (N8N Integrated - 2026-04-18)  
**Status**: 🟢 Production Ready

