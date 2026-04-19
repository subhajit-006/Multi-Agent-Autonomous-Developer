from pydantic import BaseSettings, EmailStr
from typing import Optional
from pathlib import Path

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Self-Contained Landing Page"
    APP_DESCRIPTION: str = "A single-file HTML landing page with embedded CSS and JavaScript, designed for portability, easy deployment, and no external dependencies."
    APP_VERSION: str = "1.0.0"

    # API settings
    API_V1_STR: str = "/api/v1"
    API_TITLE: str = "Self-Contained Landing Page API"
    API_DESCRIPTION: str = "Backend API for the self-contained landing page project"
    API_DOCS_URL: str = "/api/docs"
    API_REDOC_URL: str = "/api/redoc"
    API_OPENAPI_URL: str = "/api/openapi.json"

    # Database settings
    DB_PATH: Path = Path(__file__).parent.parent.parent / "data" / "submissions.db"
    DB_CONNECT_ARGS: dict = {"check_same_thread": False}

    # Security settings
    ALLOWED_ORIGINS: list = ["*"]
    ALLOWED_METHODS: list = ["*"]
    ALLOWED_HEADERS: list = ["*"]

    # Form settings
    FORM_EMAIL_FIELD: str = "email"
    MAX_EMAIL_LENGTH: int = 255

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()