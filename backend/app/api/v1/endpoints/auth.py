"""Endpoints d'authentification : inscription, connexion, profil."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.common import Token
from app.schemas.user import UserCreate, UserLogin, UserMe, UserOut
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Inscription d'un nouvel utilisateur",
)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    """
    Crée un compte utilisateur.
    - **email** : doit être unique
    - **password** : minimum 6 caractères
    - **role** : `student` ou `teacher`
    """
    return auth_service.register(db, payload)


@router.post(
    "/login",
    response_model=Token,
    summary="Connexion et obtention du token JWT",
)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    """
    Authentifie l'utilisateur et retourne un token Bearer JWT.
    Inclure ce token dans l'en-tête `Authorization: Bearer <token>`.
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
