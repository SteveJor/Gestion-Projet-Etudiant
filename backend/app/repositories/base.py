"""
Repository de base générique.
Fournit les opérations CRUD communes à tous les repositories.
Pattern Repository : isole la couche base de données de la couche service.
"""
from typing import Any, Generic, TypeVar

from sqlalchemy.orm import Session

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Repository générique pour les opérations CRUD de base."""

    def __init__(self, model: type[ModelType]) -> None:
        self.model = model

    def get(self, db: Session, id: int) -> ModelType | None:
        """Récupère un enregistrement par son identifiant."""
        return db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> list[ModelType]:
        """Récupère tous les enregistrements avec pagination optionnelle."""
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_data: dict[str, Any]) -> ModelType:
        """Crée un nouvel enregistrement."""
        db_obj = self.model(**obj_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: ModelType, update_data: dict[str, Any]) -> ModelType:
        """Met à jour un enregistrement existant."""
        for field, value in update_data.items():
            if value is not None:
                setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> bool:
        """Supprime un enregistrement. Retourne True si supprimé, False sinon."""
        obj = self.get(db, id)
        if not obj:
            return False
        db.delete(obj)
        db.commit()
        return True

    def count(self, db: Session) -> int:
        """Compte le nombre total d'enregistrements."""
        return db.query(self.model).count()
