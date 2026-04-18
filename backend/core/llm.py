from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

from core.config import (
    AGENT_MODELS,
    GOOGLE_API_KEY,
    DEVELOPER_GOOGLE_API_KEY,
    DEBUGGER_GOOGLE_API_KEY,
    TESTER_GOOGLE_API_KEY,
    DEVELOPER_GROQ_API_KEY
)


def get_llm(agent_name: str, streaming=False):

    # ===============================
    # 🔥 DEVELOPER → GROQ
    # ===============================
    if agent_name == "developer":
        api_key = DEVELOPER_GROQ_API_KEY 

        print(f"[LLM DEBUG] Agent: developer | Provider: GROQ | Model: {AGENT_MODELS.get(agent_name)}")

        return ChatGroq(
            model=AGENT_MODELS.get(agent_name) or "llama3-70b-8192",
            temperature=0.3,
            streaming=streaming,
            api_key=api_key
        )

    # ===============================
    # 🧠 OTHERS → GOOGLE (UNCHANGED)
    # ===============================
    key_map = {
        "developer": DEVELOPER_GOOGLE_API_KEY,
        "debugger": DEBUGGER_GOOGLE_API_KEY,
        "tester": TESTER_GOOGLE_API_KEY
    }

    api_key = key_map.get(agent_name) or GOOGLE_API_KEY

    key_type = "CUSTOM" if agent_name in key_map and key_map[agent_name] else "MAIN"
    print(f"[LLM DEBUG] Agent: {agent_name} | Provider: GOOGLE | Key: {key_type} | Model: {AGENT_MODELS.get(agent_name)}")

    return ChatGoogleGenerativeAI(
        model=AGENT_MODELS.get(agent_name),
        temperature=0.3,
        streaming=streaming,
        google_api_key=api_key
    )