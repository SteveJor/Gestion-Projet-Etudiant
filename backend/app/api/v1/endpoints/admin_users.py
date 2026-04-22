"""
Endpoints d'administration des utilisateurs.
Accès exclusif à l'administrateur.
CRUD complet : créer, lister, modifier, supprimer des comptes.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_admin
from app.core.database import get_db
from app.models.models import User
from app.schemas.common import Message
from app.schemas.user import UserCreate, UserListResponse, UserOut, UserUpdate
from app.services.admin_service import admin_service

router = APIRouter(prefix="/admin/users", tags=["Administration — Utilisateurs"])


@router.get(
    "",
    response_model=UserListResponse,
    summary="Lister tous les utilisateurs",
)
def list_users(
    role: str | None = Query(default=None, description="Filtrer par rôle : student | teacher | admin"),
    search: str | None = Query(default=None, description="Recherche par nom ou email"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> UserListResponse:
    """Retourne la liste paginée des utilisateurs avec filtres optionnels."""
    items, total = admin_service.list_users(db, role=role, search=search, skip=skip, limit=limit)
    return UserListResponse(items=items, total=total)


@router.post(
    "",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un utilisateur",
)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> User:
    """
    Crée un nouveau compte utilisateur.
    Seul l'administrateur peut effectuer cette action.
    """
    return admin_service.create_user(db, payload)


@router.get(
    "/{user_id}",
    response_model=UserOut,
    summary="Détail d'un utilisateur",
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> User:
    """Retourne les informations d'un utilisateur spécifique."""
    return admin_service.get_user_or_404(db, user_id)


@router.put(
    "/{user_id}",
    response_model=UserOut,
    summary="Modifier un utilisateur",
)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> User:
    """
    Met à jour les informations d'un utilisateur.
    Tous les champs sont optionnels.
    Si `password` est fourni, il sera haché et remplacé.
    """
    return admin_service.update_user(db, user_id, payload)


@router.delete(
    "/{user_id}",
    response_model=Message,
    summary="Supprimer un utilisateur",
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
) -> Message:
    """
    Supprime définitivement un compte utilisateur.
    L'administrateur ne peut pas supprimer son propre compte.
    """
    admin_service.delete_user(db, user_id, admin_id=current_admin.id)
    return Message(message="Utilisateur supprimé avec succès.")
