"""
Service d'administration des utilisateurs.
Seul l'admin peut créer, modifier, supprimer des comptes.
"""
import logging
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.models import User, UserRole
from app.repositories.user_repository import user_repository
from app.schemas.user import UserCreate, UserUpdate

logger = logging.getLogger(__name__)


class AdminService:

    def list_users(
        self,
        db: Session,
        role: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[User], int]:
        """Retourne la liste paginée des utilisateurs avec filtres optionnels."""
        return user_repository.list_with_filters(
            db, role=role, search=search, skip=skip, limit=limit
        )

    def get_user_or_404(self, db: Session, user_id: int) -> User:
        user = user_repository.get(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur introuvable.",
            )
        return user

    def create_user(self, db: Session, payload: UserCreate) -> User:
        """Crée un compte utilisateur (réservé à l'admin)."""
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
        logger.info("Admin : utilisateur créé id=%s email=%s role=%s", user.id, user.email, user.role)
        return user

    def update_user(self, db: Session, user_id: int, payload: UserUpdate) -> User:
        """Met à jour un utilisateur. L'email doit rester unique."""
        user = self.get_user_or_404(db, user_id)

        # Vérifier unicité email si changé
        if payload.email and payload.email != user.email:
            if user_repository.email_exists(db, payload.email):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Cet email est déjà utilisé par un autre compte.",
                )

        update_data: dict = {}
        if payload.full_name is not None:
            update_data["full_name"] = payload.full_name
        if payload.email is not None:
            update_data["email"] = payload.email
        if payload.role is not None:
            update_data["role"] = payload.role
        if payload.password is not None:
            update_data["password_hash"] = hash_password(payload.password)

        updated = user_repository.update(db, user, update_data)
        logger.info("Admin : utilisateur mis à jour id=%s", user_id)
        return updated

    def delete_user(self, db: Session, user_id: int, admin_id: int) -> None:
        """Supprime un utilisateur. L'admin ne peut pas se supprimer lui-même."""
        if user_id == admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous ne pouvez pas supprimer votre propre compte.",
            )
        self.get_user_or_404(db, user_id)
        user_repository.delete(db, user_id)
        logger.info("Admin : utilisateur supprimé id=%s par admin_id=%s", user_id, admin_id)


admin_service = AdminService()
