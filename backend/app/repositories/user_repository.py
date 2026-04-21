"""Repository pour les opérations de base de données sur l'entité User."""
from sqlalchemy.orm import Session

from app.models.models import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):

    def get_by_email(self, db: Session, email: str) -> User | None:
        """Récupère un utilisateur par son email."""
        return db.query(User).filter(User.email == email).first()

    def email_exists(self, db: Session, email: str) -> bool:
        """Vérifie si un email est déjà utilisé."""
        return db.query(User).filter(User.email == email).count() > 0

    def count_by_role(self, db: Session, role: str) -> int:
        """Compte les utilisateurs par rôle."""
        return db.query(User).filter(User.role == role).count()


user_repository = UserRepository(User)
