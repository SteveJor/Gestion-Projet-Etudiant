"""
Endpoints d'authentification : connexion et profil.
NOTE : L'inscription publique est désactivée.
       Seul l'administrateur peut créer des comptes (via /api/v1/admin/users).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.common import Token
from app.schemas.user import UserLogin, UserMe
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post(
    "/login",
    response_model=Token,
    summary="Connexion et obtention du token JWT",
)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    """
    Authentifie l'utilisateur et retourne un token Bearer JWT.
    Les comptes sont créés exclusivement par l'administrateur.
    """
    return auth_service.login(db, payload)


@router.get(
    "/me",
    response_model=UserMe,
    summary="Profil de l'utilisateur connecté",
)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Retourne les informations de l'utilisateur authentifié."""
    return current_user
