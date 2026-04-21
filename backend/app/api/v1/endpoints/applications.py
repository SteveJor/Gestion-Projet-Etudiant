"""
Endpoints de gestion des candidatures.
- Étudiants : postuler, voir ses candidatures
- Enseignants : voir et traiter les candidatures de leurs projets
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_student, get_current_teacher, get_current_user
from app.core.database import get_db
from app.models.models import Application, User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationOut,
    ApplicationStatusUpdate,
    ApplicationStudentOut,
)
from app.services.application_service import application_service

router = APIRouter(prefix="/applications", tags=["Candidatures"])


# ──────────────────────────────────────────────
# Routes étudiant
# ──────────────────────────────────────────────

@router.post(
    "/projects/{project_id}",
    response_model=ApplicationOut,
    status_code=status.HTTP_201_CREATED,
    summary="Postuler à un projet (étudiant)",
)
def apply_to_project(
    project_id: int,
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student),
):
    """
    Soumet une candidature pour un projet ouvert.
    Un étudiant ne peut postuler qu'une seule fois au même projet.
    """
    application = application_service.apply_to_project(
        db, project_id=project_id, student_id=current_user.id, payload=payload
    )
    # Recharger avec les relations pour la réponse
    from app.repositories.application_repository import application_repository
    return application_repository.get_with_student(db, application.id)


@router.get(
    "/mine",
    response_model=list[ApplicationOut],
    summary="Mes candidatures (étudiant)",
)
def my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student),
):
    """Retourne toutes les candidatures de l'étudiant connecté."""
    return application_service.get_student_applications(db, current_user.id)


# ──────────────────────────────────────────────
# Routes enseignant
# ──────────────────────────────────────────────

@router.get(
    "/projects/{project_id}",
    response_model=list[ApplicationOut],
    summary="Candidatures d'un projet (enseignant propriétaire)",
)
def get_project_applications(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Retourne toutes les candidatures reçues pour un projet donné."""
    return application_service.get_project_applications(
        db, project_id=project_id, teacher_id=current_user.id
    )


@router.patch(
    "/{application_id}/status",
    response_model=ApplicationOut,
    summary="Accepter ou refuser une candidature (enseignant)",
)
def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """
    Met à jour le statut d'une candidature : `accepted` ou `rejected`.
    Une notification simulée est envoyée à l'étudiant.
    """
    application = application_service.update_application_status(
        db,
        application_id=application_id,
        payload=payload,
        teacher_id=current_user.id,
    )
    from app.repositories.application_repository import application_repository
    return application_repository.get_with_student(db, application.id)
