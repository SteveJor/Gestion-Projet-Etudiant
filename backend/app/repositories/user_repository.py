"""Repository pour les opérations de base de données sur l'entité User."""
from typing import Optional

from sqlalchemy.orm import Session

from app.models.models import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """Récupère un utilisateur par son email."""
        return db.query(User).filter(User.email == email).first()

    def email_exists(self, db: Session, email: str) -> bool:
        """Vérifie si un email est déjà utilisé."""
        return db.query(User).filter(User.email == email).count() > 0

    def count_by_role(self, db: Session, role: str) -> int:
        """Compte les utilisateurs par rôle."""
        return db.query(User).filter(User.role == role).count()

    def list_with_filters(
        self,
        db: Session,
        role: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[User], int]:
        """Liste paginée avec filtre rôle et recherche par nom/email."""
        query = db.query(User)

        if role:
            query = query.filter(User.role == role)

        if search:
            pattern = f"%{search}%"
            query = query.filter(
                User.full_name.ilike(pattern) | User.email.ilike(pattern)
            )

        total = query.count()
        items = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
        return items, total


user_repository = UserRepository(User)
