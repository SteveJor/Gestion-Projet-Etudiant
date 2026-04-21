"""Endpoints du tableau de bord (statistiques par rôle)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_admin, get_current_student, get_current_teacher
from app.core.database import get_db
from app.models.models import User
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Tableau de bord"])


@router.get(
    "/admin",
    summary="Statistiques globales (admin)",
)
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
) -> dict:
    """Statistiques globales de la plateforme."""
    return dashboard_service.get_admin_stats(db)


@router.get(
    "/teacher",
    summary="Statistiques enseignant",
)
def teacher_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
) -> dict:
    """Statistiques personnalisées pour l'enseignant connecté."""
    return dashboard_service.get_teacher_stats(db, current_user.id)


@router.get(
    "/student",
    summary="Statistiques étudiant",
)
def student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student),
) -> dict:
    """Statistiques personnalisées pour l'étudiant connecté."""
    return dashboard_service.get_student_stats(db, current_user.id)
