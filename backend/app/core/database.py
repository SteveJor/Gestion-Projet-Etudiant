"""
Configuration SQLAlchemy avec SQLite.
Fournit le moteur, la session et la base déclarative.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# Pour SQLite : check_same_thread=False requis en mode multithread
connect_args = (
    {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Classe de base pour tous les modèles SQLAlchemy."""
    pass


def get_db():
    """
    Générateur de session de base de données.
    Utilisé comme dépendance FastAPI via Depends(get_db).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """Crée toutes les tables définies dans les modèles."""
    from app.models import models  # noqa: F401 — import pour enregistrer les modèles
    Base.metadata.create_all(bind=engine)
