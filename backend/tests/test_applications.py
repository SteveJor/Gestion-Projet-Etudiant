"""Tests d'intégration : candidatures."""
from app.core.security import hash_password
from app.models.models import User, UserRole
from tests.conftest import TestingSessionLocal


def _make_user(email, role):
    db = TestingSessionLocal()
    db.add(User(email=email, full_name="User", password_hash=hash_password("pass123"), role=role))
    db.commit()
    db.close()


def _login(client, email):
    token = client.post("/api/v1/auth/login", json={"email": email, "password": "pass123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_project(client, teacher_email):
    h = _login(client, teacher_email)
    return client.post("/api/v1/projects", json={"title": "Projet", "description": "Description du projet."}, headers=h).json()["id"]


MOTIVATION = "Je suis très motivé par ce projet de recherche académique innovant."


def test_student_can_apply(client):
    _make_user("t@apply.cm", UserRole.TEACHER)
    _make_user("s@apply.cm", UserRole.STUDENT)
    pid = _create_project(client, "t@apply.cm")
    resp = client.post(f"/api/v1/applications/projects/{pid}", json={"motivation": MOTIVATION}, headers=_login(client, "s@apply.cm"))
    assert resp.status_code == 201
    assert resp.json()["status"] == "pending"


def test_student_cannot_apply_twice(client):
    _make_user("t@twice.cm", UserRole.TEACHER)
    _make_user("s@twice.cm", UserRole.STUDENT)
    pid = _create_project(client, "t@twice.cm")
    h = _login(client, "s@twice.cm")
    client.post(f"/api/v1/applications/projects/{pid}", json={"motivation": MOTIVATION}, headers=h)
    resp = client.post(f"/api/v1/applications/projects/{pid}", json={"motivation": MOTIVATION}, headers=h)
    assert resp.status_code == 409


def test_teacher_cannot_apply(client):
    _make_user("t@noapply.cm", UserRole.TEACHER)
    pid = _create_project(client, "t@noapply.cm")
    resp = client.post(f"/api/v1/applications/projects/{pid}", json={"motivation": MOTIVATION}, headers=_login(client, "t@noapply.cm"))
    assert resp.status_code == 403


def test_teacher_can_see_applications(client):
    _make_user("t@see.cm", UserRole.TEACHER)
    _make_user("s@see.cm", UserRole.STUDENT)
    pid = _create_project(client, "t@see.cm")
    client.post(f"/api/v1/applications/projects/{pid}", json={"motivation": MOTIVATION}, headers=_login(client, "s@see.cm"))
    resp = client.get(f"/api/v1/applications/projects/{pid}", headers=_login(client, "t@see.cm"))
    assert resp.status_code == 200 and len(resp.json()) == 1


def test_teacher_can_accept_application(client):
    _make_user("t@accept.cm", UserRole.TEACHER)
    _make_user("s@accept.cm", UserRole.STUDENT)
    pid = _create_project(client, "t@accept.cm")
    app_id = client.post(f"/api/v1/applications/projects/{pid}", json={"motivation": MOTIVATION}, headers=_login(client, "s@accept.cm")).json()["id"]
    resp = client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "accepted"}, headers=_login(client, "t@accept.cm"))
    assert resp.status_code == 200 and resp.json()["status"] == "accepted"


def test_student_can_see_own_applications(client):
    _make_user("t@mine.cm", UserRole.TEACHER)
    _make_user("s@mine.cm", UserRole.STUDENT)
    pid = _create_project(client, "t@mine.cm")
    client.post(f"/api/v1/applications/projects/{pid}", json={"motivation": MOTIVATION}, headers=_login(client, "s@mine.cm"))
    resp = client.get("/api/v1/applications/mine", headers=_login(client, "s@mine.cm"))
    assert resp.status_code == 200 and len(resp.json()) == 1
