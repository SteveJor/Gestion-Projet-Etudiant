"""Tests d'intégration : gestion des projets."""
import pytest


def _register_and_login(client, email, role):
    client.post("/api/v1/auth/register", json={
        "email": email, "full_name": "User", "password": "pass123", "role": role
    })
    token = client.post("/api/v1/auth/login", json={"email": email, "password": "pass123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_projects_list_public(client):
    resp = client.get("/api/v1/projects")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data


def test_teacher_can_create_project(client):
    headers = _register_and_login(client, "teacher@test.cm", "teacher")
    resp = client.post("/api/v1/projects", json={
        "title": "Projet Test IA",
        "description": "Description complète du projet de recherche.",
        "max_students": 2,
        "domain": "IA",
    }, headers=headers)
    assert resp.status_code == 201
    assert resp.json()["title"] == "Projet Test IA"


def test_student_cannot_create_project(client):
    headers = _register_and_login(client, "student@test.cm", "student")
    resp = client.post("/api/v1/projects", json={
        "title": "Projet interdit",
        "description": "Un étudiant ne peut pas créer de projet.",
    }, headers=headers)
    assert resp.status_code == 403


def test_teacher_can_update_own_project(client):
    headers = _register_and_login(client, "t2@test.cm", "teacher")
    project_id = client.post("/api/v1/projects", json={
        "title": "Titre initial", "description": "Desc."
    }, headers=headers).json()["id"]

    resp = client.put(f"/api/v1/projects/{project_id}", json={"title": "Titre modifié"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Titre modifié"


def test_teacher_cannot_update_other_project(client):
    h1 = _register_and_login(client, "t3@test.cm", "teacher")
    h2 = _register_and_login(client, "t4@test.cm", "teacher")
    project_id = client.post("/api/v1/projects", json={
        "title": "Projet de T3", "description": "Desc."
    }, headers=h1).json()["id"]

    resp = client.put(f"/api/v1/projects/{project_id}", json={"title": "Piraté"}, headers=h2)
    assert resp.status_code == 403


def test_teacher_can_delete_own_project(client):
    headers = _register_and_login(client, "t5@test.cm", "teacher")
    project_id = client.post("/api/v1/projects", json={
        "title": "À supprimer", "description": "Desc."
    }, headers=headers).json()["id"]

    resp = client.delete(f"/api/v1/projects/{project_id}", headers=headers)
    assert resp.status_code == 200

    resp = client.get(f"/api/v1/projects/{project_id}")
    assert resp.status_code == 404


def test_project_search(client):
    headers = _register_and_login(client, "t6@test.cm", "teacher")
    client.post("/api/v1/projects", json={
        "title": "Projet Blockchain Santé", "description": "Desc."
    }, headers=headers)

    resp = client.get("/api/v1/projects?search=blockchain")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert any("Blockchain" in p["title"] for p in items)


def test_project_pagination(client):
    resp = client.get("/api/v1/projects?page=1&per_page=10")
    data = resp.json()
    assert data["page"] == 1
    assert data["per_page"] == 10
    assert "total_pages" in data
