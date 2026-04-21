"""Tests unitaires des modèles."""
from app.core.security import hash_password, verify_password
from app.models.models import Application, ApplicationStatus, Project, ProjectStatus, User, UserRole


def test_create_user(db):
    user = User(
        email="test@univ.cm",
        full_name="Test User",
        password_hash=hash_password("secret"),
        role=UserRole.STUDENT,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    assert user.id is not None
    assert user.email == "test@univ.cm"
    assert user.role == UserRole.STUDENT
    assert verify_password("secret", user.password_hash)


def test_create_project(db):
    teacher = User(
        email="teacher@univ.cm",
        full_name="Teacher",
        password_hash=hash_password("pass123"),
        role=UserRole.TEACHER,
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    project = Project(
        title="Projet IA",
        description="Description du projet",
        teacher_id=teacher.id,
        max_students=2,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    assert project.id is not None
    assert project.status == ProjectStatus.OPEN
    assert project.teacher_id == teacher.id


def test_student_starts_with_no_projects(db):
    student = User(
        email="student@univ.cm",
        full_name="Student",
        password_hash=hash_password("pass123"),
        role=UserRole.STUDENT,
    )
    db.add(student)
    db.commit()
    assert student.role == UserRole.STUDENT
    assert student.projects == []


def test_application_default_status(db):
    teacher = User(email="t@t.cm", full_name="T", password_hash=hash_password("p123"), role=UserRole.TEACHER)
    student = User(email="s@s.cm", full_name="S", password_hash=hash_password("p123"), role=UserRole.STUDENT)
    db.add_all([teacher, student])
    db.commit()

    project = Project(title="P", description="D", teacher_id=teacher.id)
    db.add(project)
    db.commit()

    application = Application(
        student_id=student.id,
        project_id=project.id,
        motivation="Ma motivation est très forte pour ce projet académique.",
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    assert application.status == ApplicationStatus.PENDING
