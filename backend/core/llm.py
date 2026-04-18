from importlib import import_module

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

try:
    ChatMistralAI = import_module("langchain_mistralai").ChatMistralAI
except Exception:
    ChatMistralAI = None

from core.config import (
    AGENT_MODELS,
    GOOGLE_API_KEY,
    DEVELOPER_GOOGLE_API_KEY,
    DEBUGGER_GOOGLE_API_KEY,
    TESTER_GOOGLE_API_KEY,
    DEVELOPER_GROQ_API_KEY,
    MISTRAL_API_KEY
)


def get_llm(agent_name: str, streaming=False):

    # ===============================
    # 🧭 PLANNER + ARCHITECT → MISTRAL
    # ===============================
    if agent_name in {"planner", "architect"} and ChatMistralAI and MISTRAL_API_KEY:
        print(f"[LLM DEBUG] Agent: {agent_name} | Provider: MISTRAL | Model: {AGENT_MODELS.get(agent_name)}")

        return ChatMistralAI(
            model=AGENT_MODELS.get(agent_name) or "mistral-large-latest",
            temperature=0.3,
            streaming=streaming,
            api_key=MISTRAL_API_KEY
        )

    # ===============================
    # 🔥 DEVELOPER → MISTRAL (fallback GROQ)
    # ===============================
    if agent_name == "developer":
        if ChatMistralAI and MISTRAL_API_KEY:
            model_name = AGENT_MODELS.get(agent_name) or "devstral-2512"
            print(f"[LLM DEBUG] Agent: developer | Provider: MISTRAL | Model: {model_name}")

            return ChatMistralAI(
                model=model_name,
                temperature=0.3,
                streaming=streaming,
                api_key=MISTRAL_API_KEY
            )

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