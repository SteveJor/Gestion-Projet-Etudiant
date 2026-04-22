"""Schémas Pydantic pour l'entité User."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.models.models import UserRole


class UserCreate(BaseModel):
    """Création d'un utilisateur par l'admin."""
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.STUDENT

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Le mot de passe doit contenir au moins 6 caractères.")
        return v

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Le nom complet est requis.")
        return v.strip()


class UserUpdate(BaseModel):
    """Mise à jour d'un utilisateur par l'admin (tous les champs optionnels)."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) < 6:
            raise ValueError("Le mot de passe doit contenir au moins 6 caractères.")
        return v

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Le nom complet ne peut pas être vide.")
        return v.strip() if v else v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


class UserMe(UserOut):
    """Schéma étendu pour le profil de l'utilisateur connecté."""
    pass


class UserListResponse(BaseModel):
    items: list[UserOut]
    total: int
