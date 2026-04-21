"""Repository pour les opérations de base de données sur l'entité Project."""
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.models import Application, Project, ProjectStatus
from app.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):

    def get_with_teacher(self, db: Session, project_id: int) -> Project | None:
        """Charge le projet avec l'enseignant en une seule requête (eager loading)."""
        return (
            db.query(Project)
            .options(joinedload(Project.teacher))
            .filter(Project.id == project_id)
            .first()
        )

    def get_open_projects_paginated(
        self,
        db: Session,
        page: int = 1,
        per_page: int = 10,
        search: str | None = None,
        domain: str | None = None,
    ) -> tuple[list[Project], int]:
        """
        Récupère les projets ouverts avec pagination, recherche et filtre par domaine.
        Retourne (items, total).
        """
        query = (
            db.query(Project)
            .options(joinedload(Project.teacher))
            .filter(Project.status == ProjectStatus.OPEN)
        )

        if search:
            query = query.filter(Project.title.ilike(f"%{search}%"))

        if domain:
            query = query.filter(Project.domain.ilike(f"%{domain}%"))

        total = query.count()
        offset = (page - 1) * per_page
        items = query.order_by(Project.created_at.desc()).offset(offset).limit(per_page).all()
        return items, total

    def get_by_teacher(self, db: Session, teacher_id: int) -> list[Project]:
        """Récupère tous les projets d'un enseignant."""
        return (
            db.query(Project)
            .options(joinedload(Project.teacher))
            .filter(Project.teacher_id == teacher_id)
            .order_by(Project.created_at.desc())
            .all()
        )

    def get_applications_count(self, db: Session, project_id: int) -> int:
        """Compte le nombre de candidatures pour un projet."""
        return (
            db.query(Application)
            .filter(Application.project_id == project_id)
            .count()
        )

    def count_by_status(self, db: Session, status: ProjectStatus) -> int:
        return db.query(Project).filter(Project.status == status).count()


project_repository = ProjectRepository(Project)
