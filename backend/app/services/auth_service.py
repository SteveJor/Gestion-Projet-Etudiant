"""
Service d'authentification.
Contient la logique métier : inscription, connexion, validation.
"""
import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.models import User
from app.repositories.user_repository import user_repository
from app.schemas.common import Token
from app.schemas.user import UserCreate, UserLogin

logger = logging.getLogger(__name__)


class AuthService:

    def register(self, db: Session, payload: UserCreate) -> User:
        """
        Inscrit un nouvel utilisateur.
        Lève HTTP 409 si l'email est déjà utilisé.
        """
        if user_repository.email_exists(db, payload.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Un compte avec cet email existe déjà.",
            )

        user = user_repository.create(
            db,
            {
                "email": payload.email,
                "full_name": payload.full_name,
                "password_hash": hash_password(payload.password),
                "role": payload.role,
            },
        )
        logger.info("Nouvel utilisateur inscrit : id=%s email=%s role=%s", user.id, user.email, user.role)
        return user

    def login(self, db: Session, payload: UserLogin) -> Token:
        """
        Authentifie un utilisateur et retourne un token JWT.
        Lève HTTP 401 si les identifiants sont invalides.
        """
        user = user_repository.get_by_email(db, payload.email)
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token(subject=user.id)
        logger.info("Connexion réussie : user_id=%s", user.id)
        return Token(access_token=token)


auth_service = AuthService()
