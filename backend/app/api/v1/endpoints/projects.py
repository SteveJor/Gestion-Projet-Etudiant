"""
Endpoints de gestion des projets.
- Lecture publique (liste + détail)
- CRUD réservé aux enseignants
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_teacher, get_current_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.common import Message
from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectOut,
    ProjectUpdate,
)
from app.services.project_service import project_service

router = APIRouter(prefix="/projects", tags=["Projets"])


# ──────────────────────────────────────────────
# Routes publiques (lecture)
# ──────────────────────────────────────────────

@router.get(
    "",
    response_model=ProjectListResponse,
    summary="Liste paginée des projets ouverts",
)
def list_projects(
    page: int = Query(default=1, ge=1, description="Numéro de page"),
    per_page: int = Query(default=10, ge=1, le=50, description="Éléments par page"),
    search: str | None = Query(default=None, description="Recherche par titre"),
    domain: str | None = Query(default=None, description="Filtre par domaine"),
    db: Session = Depends(get_db),
) -> ProjectListResponse:
    """Retourne les projets ouverts avec pagination, recherche et filtre par domaine."""
    return project_service.list_open_projects(
        db, page=page, per_page=per_page, search=search, domain=domain
    )


@router.get(
    "/{project_id}",
    response_model=ProjectOut,
    summary="Détail d'un projet",
)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Retourne le détail complet d'un projet (accès public)."""
    return project_service.get_project_or_404(db, project_id)


# ──────────────────────────────────────────────
# Routes enseignant (écriture)
# ──────────────────────────────────────────────

@router.post(
    "",
    response_model=ProjectOut,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un projet (enseignant)",
)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """
    Crée un nouveau projet académique.
    Réservé aux enseignants.
    """
    project = project_service.create_project(db, payload, teacher_id=current_user.id)
    return project_service.get_project_or_404(db, project.id)


@router.put(
    "/{project_id}",
    response_model=ProjectOut,
    summary="Modifier un projet (enseignant propriétaire)",
)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Met à jour un projet. Seul l'enseignant créateur peut modifier."""
    project = project_service.update_project(
        db, project_id, payload, current_user_id=current_user.id
    )
    return project_service.get_project_or_404(db, project.id)


@router.delete(
    "/{project_id}",
    response_model=Message,
    summary="Supprimer un projet (enseignant propriétaire)",
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
) -> Message:
    """Supprime un projet et toutes ses candidatures associées."""
    project_service.delete_project(db, project_id, current_user_id=current_user.id)
    return Message(message="Projet supprimé avec succès.")


@router.get(
    "/teacher/mine",
    response_model=list[ProjectOut],
    summary="Mes projets (enseignant)",
)
def my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Retourne tous les projets créés par l'enseignant connecté."""
    projects = project_service.get_teacher_projects(db, current_user.id)
    # Recharger avec les relations
    return [project_service.get_project_or_404(db, p.id) for p in projects]
