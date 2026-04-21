"""Service pour les statistiques du tableau de bord."""
from sqlalchemy.orm import Session

from app.models.models import ApplicationStatus, ProjectStatus, UserRole
from app.repositories.application_repository import application_repository
from app.repositories.project_repository import project_repository
from app.repositories.user_repository import user_repository


class DashboardService:

    def get_admin_stats(self, db: Session) -> dict:
        """Statistiques globales pour l'admin."""
        return {
            "total_users": user_repository.count(db),
            "total_students": user_repository.count_by_role(db, UserRole.STUDENT),
            "total_teachers": user_repository.count_by_role(db, UserRole.TEACHER),
            "total_projects": project_repository.count(db),
            "open_projects": project_repository.count_by_status(db, ProjectStatus.OPEN),
            "closed_projects": project_repository.count_by_status(db, ProjectStatus.CLOSED),
            "completed_projects": project_repository.count_by_status(db, ProjectStatus.COMPLETED),
            "total_applications": application_repository.count(db),
        }

    def get_teacher_stats(self, db: Session, teacher_id: int) -> dict:
        """Statistiques pour un enseignant."""
        projects = project_repository.get_by_teacher(db, teacher_id)
        project_ids = [p.id for p in projects]

        total_applications = sum(
            application_repository.get_by_project(db, pid).__len__()
            for pid in project_ids
        )
        open_count = sum(1 for p in projects if p.status == ProjectStatus.OPEN)

        return {
            "total_projects": len(projects),
            "open_projects": open_count,
            "total_applications_received": total_applications,
        }

    def get_student_stats(self, db: Session, student_id: int) -> dict:
        """Statistiques pour un étudiant."""
        applications = application_repository.get_by_student(db, student_id)
        return {
            "total_applications": len(applications),
            "pending": sum(1 for a in applications if a.status == ApplicationStatus.PENDING),
            "accepted": sum(1 for a in applications if a.status == ApplicationStatus.ACCEPTED),
            "rejected": sum(1 for a in applications if a.status == ApplicationStatus.REJECTED),
        }


dashboard_service = DashboardService()
