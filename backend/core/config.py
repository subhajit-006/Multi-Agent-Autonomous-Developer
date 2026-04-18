import os
from dotenv import load_dotenv
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
DEVELOPER_GOOGLE_API_KEY = os.getenv("DEVELOPER_GOOGLE_API_KEY", "")
DEBUGGER_GOOGLE_API_KEY = os.getenv("DEBUGGER_GOOGLE_API_KEY", "")
TESTER_GOOGLE_API_KEY = os.getenv("TESTER_GOOGLE_API_KEY", "")
DEVELOPER_GROQ_API_KEY = os.getenv("DEVELOPER_GROQ_API_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")

AGENT_MODELS = {
    "planner": os.getenv("PLANNER_MODEL"),
    "architect": os.getenv("ARCHITECT_MODEL"),
    "developer": os.getenv("DEVELOPER_MODEL"),
    "debugger": os.getenv("DEBUGGER_MODEL"),
    "tester": os.getenv("TESTER_MODEL"),
}
