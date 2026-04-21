"""
Service de gestion des candidatures.
Logique métier : postuler, accepter/refuser, notifications simulées.
"""
import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.models import Application, ApplicationStatus, ProjectStatus
from app.repositories.application_repository import application_repository
from app.repositories.project_repository import project_repository
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate
from app.utils.notifications import notify_application_result

logger = logging.getLogger(__name__)


class ApplicationService:

    def apply_to_project(
        self, db: Session, project_id: int, student_id: int, payload: ApplicationCreate
    ) -> Application:
        """
        Crée une candidature pour un étudiant.
        Règles :
          - Le projet doit être ouvert.
          - L'étudiant ne peut postuler qu'une seule fois.
        """
        project = project_repository.get_with_teacher(db, project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projet introuvable.")

        if project.status != ProjectStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce projet n'accepte plus de candidatures.",
            )

        existing = application_repository.get_by_student_and_project(db, student_id, project_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Vous avez déjà postulé à ce projet.",
            )

        application = application_repository.create(
            db,
            {
                "student_id": student_id,
                "project_id": project_id,
                "motivation": payload.motivation,
            },
        )
        logger.info(
            "Candidature créée : application_id=%s student_id=%s project_id=%s",
            application.id, student_id, project_id
        )
        return application

    def get_project_applications(
        self, db: Session, project_id: int, teacher_id: int
    ) -> list[Application]:
        """
        Récupère les candidatures d'un projet.
        Seul l'enseignant propriétaire peut les consulter.
        """
        project = project_repository.get(db, project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projet introuvable.")

        if project.teacher_id != teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès interdit à ces candidatures.",
            )

        return application_repository.get_by_project(db, project_id)

    def get_student_applications(self, db: Session, student_id: int) -> list[Application]:
        """Récupère toutes les candidatures d'un étudiant."""
        return application_repository.get_by_student(db, student_id)

    def update_application_status(
        self,
        db: Session,
        application_id: int,
        payload: ApplicationStatusUpdate,
        teacher_id: int,
    ) -> Application:
        """
        Accepte ou refuse une candidature.
        Seul l'enseignant propriétaire du projet peut décider.
        """
        application = application_repository.get_with_student(db, application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Candidature introuvable."
            )

        project = project_repository.get(db, application.project_id)
        if project.teacher_id != teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas le propriétaire de ce projet.",
            )

        updated = application_repository.update(
            db, application, {"status": payload.status}
        )

        # Notification simulée (log + console)
        notify_application_result(
            student_email=application.student.email,
            project_title=project.title,
            new_status=payload.status,
        )
        logger.info(
            "Candidature mise à jour : id=%s nouveau_statut=%s par teacher_id=%s",
            application_id, payload.status, teacher_id
        )
        return updated


application_service = ApplicationService()
