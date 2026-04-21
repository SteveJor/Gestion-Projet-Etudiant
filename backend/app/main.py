"""
Point d'entrée de l'application FastAPI.
Configure l'application, le CORS, les routes et les middlewares.
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.database import create_tables

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Application
# ──────────────────────────────────────────────
app = FastAPI(
    title="Plateforme Projets Étudiants — Université de Douala",
    description=(
        "API REST pour la gestion des projets académiques.\n\n"
        "**Rôles** : `student`, `teacher`, `admin`\n\n"
        "**Auth** : Bearer JWT — obtenir via `POST /api/v1/auth/login`"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ──────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────
app.include_router(v1_router)


# ──────────────────────────────────────────────
# Events
# ──────────────────────────────────────────────
@app.on_event("startup")
def on_startup() -> None:
    """Crée les tables à la première exécution."""
    create_tables()
    logger.info("Base de données initialisée.")


@app.get("/", tags=["Health"])
def root() -> dict:
    return {"status": "ok", "message": "Plateforme Projets Étudiants — API v1"}


@app.get("/health", tags=["Health"])
def health() -> dict:
    return {"status": "healthy"}
