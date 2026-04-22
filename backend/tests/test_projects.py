"""Tests d'intégration : gestion des projets."""
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


def test_projects_list_public(client):
    resp = client.get("/api/v1/projects")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data and "total" in data


def test_teacher_can_create_project(client):
    _make_user("teacher@test.cm", UserRole.TEACHER)
    h = _login(client, "teacher@test.cm")
    resp = client.post("/api/v1/projects", json={"title": "Projet IA", "description": "Description complète du projet."}, headers=h)
    assert resp.status_code == 201
    assert resp.json()["title"] == "Projet IA"


def test_student_cannot_create_project(client):
    _make_user("student@test.cm", UserRole.STUDENT)
    h = _login(client, "student@test.cm")
    resp = client.post("/api/v1/projects", json={"title": "Interdit", "description": "Non."}, headers=h)
    assert resp.status_code == 403


def test_teacher_can_update_own_project(client):
    _make_user("t2@test.cm", UserRole.TEACHER)
    h = _login(client, "t2@test.cm")
    pid = client.post("/api/v1/projects", json={"title": "Initial", "description": "Desc."}, headers=h).json()["id"]
    resp = client.put(f"/api/v1/projects/{pid}", json={"title": "Modifié"}, headers=h)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Modifié"


def test_teacher_cannot_update_other_project(client):
    _make_user("t3@test.cm", UserRole.TEACHER)
    _make_user("t4@test.cm", UserRole.TEACHER)
    h1, h2 = _login(client, "t3@test.cm"), _login(client, "t4@test.cm")
    pid = client.post("/api/v1/projects", json={"title": "Projet T3", "description": "D."}, headers=h1).json()["id"]
    resp = client.put(f"/api/v1/projects/{pid}", json={"title": "Piraté"}, headers=h2)
    assert resp.status_code == 403


def test_teacher_can_delete_own_project(client):
    _make_user("t5@test.cm", UserRole.TEACHER)
    h = _login(client, "t5@test.cm")
    pid = client.post("/api/v1/projects", json={"title": "Suppr", "description": "D."}, headers=h).json()["id"]
    assert client.delete(f"/api/v1/projects/{pid}", headers=h).status_code == 200
    assert client.get(f"/api/v1/projects/{pid}").status_code == 404


def test_project_search(client):
    _make_user("t6@test.cm", UserRole.TEACHER)
    h = _login(client, "t6@test.cm")
    client.post("/api/v1/projects", json={"title": "Projet Blockchain Santé", "description": "D."}, headers=h)
    items = client.get("/api/v1/projects?search=blockchain").json()["items"]
    assert any("Blockchain" in p["title"] for p in items)


def test_project_pagination(client):
    data = client.get("/api/v1/projects?page=1&per_page=10").json()
    assert data["page"] == 1 and "total_pages" in data
