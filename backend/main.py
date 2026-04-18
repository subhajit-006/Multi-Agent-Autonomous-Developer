from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from core.config import ALLOWED_ORIGINS
from core.db import init_db
from api.routes import agents, pipeline, session, health

from api.routes import runs

app = FastAPI(title="MAAD Backend")

origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    init_db()

app.include_router(agents.router)
app.include_router(pipeline.router)
app.include_router(session.router)
app.include_router(health.router)
app.include_router(runs.router)