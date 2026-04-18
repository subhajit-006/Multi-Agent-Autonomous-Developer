import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")

AGENT_MODELS = {
    "planner": os.getenv("PLANNER_MODEL"),
    "architect": os.getenv("ARCHITECT_MODEL"),
    "developer": os.getenv("DEVELOPER_MODEL"),
    "debugger": os.getenv("DEBUGGER_MODEL"),
    "tester": os.getenv("TESTER_MODEL"),
}