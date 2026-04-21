"""Schémas Pydantic pour l'entité Project."""
from datetime import datetime

from pydantic import BaseModel, field_validator

from app.models.models import ProjectStatus
from app.schemas.user import UserOut


class ProjectCreate(BaseModel):
    title: str
    description: str
    max_students: int = 1
    domain: str | None = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Le titre est requis.")
        return v.strip()

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("La description est requise.")
        return v.strip()

    @field_validator("max_students")
    @classmethod
    def max_students_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("max_students doit être >= 1.")
        return v


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    max_students: int | None = None
    domain: str | None = None
    status: ProjectStatus | None = None


class ProjectOut(BaseModel):
    id: int
    title: str
    description: str
    teacher_id: int
    max_students: int
    status: ProjectStatus
    domain: str | None
    created_at: datetime
    teacher: UserOut

    model_config = {"from_attributes": True}


class ProjectSummary(BaseModel):
    """Version allégée pour les listes paginées."""
    id: int
    title: str
    description: str
    max_students: int
    status: ProjectStatus
    domain: str | None
    created_at: datetime
    teacher_name: str
    applications_count: int = 0

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    items: list[ProjectSummary]
    total: int
    page: int
    per_page: int
    total_pages: int
