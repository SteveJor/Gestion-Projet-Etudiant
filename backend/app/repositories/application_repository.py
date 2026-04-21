"""Repository pour les opérations de base de données sur l'entité Application."""
from sqlalchemy.orm import Session, joinedload

from app.models.models import Application, ApplicationStatus
from app.repositories.base import BaseRepository


class ApplicationRepository(BaseRepository[Application]):

    def get_with_student(self, db: Session, application_id: int) -> Application | None:
        """Charge la candidature avec les infos de l'étudiant."""
        return (
            db.query(Application)
            .options(joinedload(Application.student), joinedload(Application.project))
            .filter(Application.id == application_id)
            .first()
        )

    def get_by_project(self, db: Session, project_id: int) -> list[Application]:
        """Récupère toutes les candidatures pour un projet donné."""
        return (
            db.query(Application)
            .options(joinedload(Application.student))
            .filter(Application.project_id == project_id)
            .order_by(Application.applied_at.desc())
            .all()
        )

    def get_by_student(self, db: Session, student_id: int) -> list[Application]:
        """Récupère toutes les candidatures d'un étudiant."""
        return (
            db.query(Application)
            .options(joinedload(Application.project))
            .filter(Application.student_id == student_id)
            .order_by(Application.applied_at.desc())
            .all()
        )

    def get_by_student_and_project(
        self, db: Session, student_id: int, project_id: int
    ) -> Application | None:
        """Vérifie si un étudiant a déjà postulé à un projet (unicité)."""
        return (
            db.query(Application)
            .filter(
                Application.student_id == student_id,
                Application.project_id == project_id,
            )
            .first()
        )

    def count_accepted_for_project(self, db: Session, project_id: int) -> int:
        """Compte les candidatures acceptées pour un projet."""
        return (
            db.query(Application)
            .filter(
                Application.project_id == project_id,
                Application.status == ApplicationStatus.ACCEPTED,
            )
            .count()
        )


application_repository = ApplicationRepository(Application)
