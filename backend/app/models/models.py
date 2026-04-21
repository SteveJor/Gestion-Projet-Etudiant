"""
Modèles SQLAlchemy : User, Project, Application.
Ces modèles représentent exactement le schéma défini dans le cahier des charges.
"""
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ──────────────────────────────────────────────
# Enums (valeurs contrôlées pour les statuts)
# ──────────────────────────────────────────────

class UserRole(str, PyEnum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class ProjectStatus(str, PyEnum):
    OPEN = "open"
    CLOSED = "closed"
    COMPLETED = "completed"


class ApplicationStatus(str, PyEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


# ──────────────────────────────────────────────
# Modèles
# ──────────────────────────────────────────────

class User(Base):
    """Utilisateur de la plateforme : étudiant, enseignant ou admin."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(200), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default=UserRole.STUDENT)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Relations
    projects: Mapped[list["Project"]] = relationship(
        "Project", back_populates="teacher", cascade="all, delete-orphan"
    )
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="student", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"


class Project(Base):
    """Projet académique proposé par un enseignant."""

    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    teacher_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    max_students: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=ProjectStatus.OPEN
    )
    domain: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Relations
    teacher: Mapped["User"] = relationship("User", back_populates="projects")
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="project", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Project id={self.id} title={self.title} status={self.status}>"


class Application(Base):
    """Candidature d'un étudiant à un projet."""

    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id"), nullable=False
    )
    motivation: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=ApplicationStatus.PENDING
    )
    applied_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Relations
    student: Mapped["User"] = relationship("User", back_populates="applications")
    project: Mapped["Project"] = relationship("Project", back_populates="applications")

    def __repr__(self) -> str:
        return f"<Application id={self.id} student_id={self.student_id} project_id={self.project_id} status={self.status}>"
