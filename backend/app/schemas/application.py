"""Schémas Pydantic pour l'entité Application (candidature)."""
from datetime import datetime

from pydantic import BaseModel, field_validator

from app.models.models import ApplicationStatus
from app.schemas.user import UserOut


class ApplicationCreate(BaseModel):
    motivation: str

    @field_validator("motivation")
    @classmethod
    def motivation_min_length(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 20:
            raise ValueError("La lettre de motivation doit contenir au moins 20 caractères.")
        return v


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus

    @field_validator("status")
    @classmethod
    def cannot_set_pending(cls, v: ApplicationStatus) -> ApplicationStatus:
        if v == ApplicationStatus.PENDING:
            raise ValueError("Vous ne pouvez pas remettre une candidature en attente.")
        return v


class ApplicationOut(BaseModel):
    id: int
    student_id: int
    project_id: int
    motivation: str
    status: ApplicationStatus
    applied_at: datetime
    student: UserOut

    model_config = {"from_attributes": True}


class ApplicationStudentOut(BaseModel):
    """Vue étudiant : sans les détails du projet pour éviter la récursion."""
    id: int
    project_id: int
    motivation: str
    status: ApplicationStatus
    applied_at: datetime
    project_title: str

    model_config = {"from_attributes": True}
