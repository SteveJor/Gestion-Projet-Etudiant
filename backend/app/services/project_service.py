"""
Service de gestion des projets.
Logique métier : création, mise à jour, suppression, listing.
"""
import logging
import math

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.models import Project, UserRole
from app.repositories.project_repository import project_repository
from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectOut,
    ProjectSummary,
    ProjectUpdate,
)

logger = logging.getLogger(__name__)


class ProjectService:

    def create_project(self, db: Session, payload: ProjectCreate, teacher_id: int) -> Project:
        """Crée un projet. Réservé aux enseignants (vérifié côté dépendances API)."""
        project = project_repository.create(
            db,
            {
                "title": payload.title,
                "description": payload.description,
                "max_students": payload.max_students,
                "domain": payload.domain,
                "teacher_id": teacher_id,
            },
        )
        logger.info("Projet créé : id=%s teacher_id=%s", project.id, teacher_id)
        return project

    def get_project_or_404(self, db: Session, project_id: int) -> Project:
        """Récupère un projet par son ID ou lève HTTP 404."""
        project = project_repository.get_with_teacher(db, project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Projet introuvable.",
            )
        return project

    def update_project(
        self, db: Session, project_id: int, payload: ProjectUpdate, current_user_id: int
    ) -> Project:
        """Met à jour un projet. Seul le créateur peut le modifier."""
        project = self.get_project_or_404(db, project_id)
        self._assert_owner(project, current_user_id)

        update_data = payload.model_dump(exclude_none=True)
        return project_repository.update(db, project, update_data)

    def delete_project(self, db: Session, project_id: int, current_user_id: int) -> None:
        """Supprime un projet. Seul le créateur peut le supprimer."""
        project = self.get_project_or_404(db, project_id)
        self._assert_owner(project, current_user_id)
        project_repository.delete(db, project_id)
        logger.info("Projet supprimé : id=%s par user_id=%s", project_id, current_user_id)

    def list_open_projects(
        self,
        db: Session,
        page: int = 1,
        per_page: int = 10,
        search: str | None = None,
        domain: str | None = None,
    ) -> ProjectListResponse:
        """Liste paginée des projets ouverts avec recherche et filtre."""
        items, total = project_repository.get_open_projects_paginated(
            db, page=page, per_page=per_page, search=search, domain=domain
        )
        total_pages = math.ceil(total / per_page) if total > 0 else 1

        summaries = [
            ProjectSummary(
                id=p.id,
                title=p.title,
                description=p.description,
                max_students=p.max_students,
                status=p.status,
                domain=p.domain,
                created_at=p.created_at,
                teacher_name=p.teacher.full_name,
                applications_count=project_repository.get_applications_count(db, p.id),
            )
            for p in items
        ]

        return ProjectListResponse(
            items=summaries,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        )

    def get_teacher_projects(self, db: Session, teacher_id: int) -> list[Project]:
        """Récupère tous les projets d'un enseignant."""
        return project_repository.get_by_teacher(db, teacher_id)

    def _assert_owner(self, project: Project, user_id: int) -> None:
        """Vérifie que l'utilisateur est le créateur du projet."""
        if project.teacher_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas le propriétaire de ce projet.",
            )


project_service = ProjectService()
