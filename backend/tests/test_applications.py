"""Tests d'intégration : candidatures."""


def _register_and_login(client, email, role):
    client.post("/api/v1/auth/register", json={
        "email": email, "full_name": "User", "password": "pass123", "role": role
    })
    token = client.post("/api/v1/auth/login", json={"email": email, "password": "pass123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_project(client, teacher_headers, title="Projet"):
    return client.post("/api/v1/projects", json={
        "title": title, "description": "Description suffisante pour le projet."
    }, headers=teacher_headers).json()["id"]


def test_student_can_apply(client):
    t_h = _register_and_login(client, "t@apply.cm", "teacher")
    s_h = _register_and_login(client, "s@apply.cm", "student")
    pid = _create_project(client, t_h)

    resp = client.post(f"/api/v1/applications/projects/{pid}", json={
        "motivation": "Je suis très motivé par ce projet de recherche académique innovant."
    }, headers=s_h)
    assert resp.status_code == 201
    assert resp.json()["status"] == "pending"


def test_student_cannot_apply_twice(client):
    t_h = _register_and_login(client, "t@twice.cm", "teacher")
    s_h = _register_and_login(client, "s@twice.cm", "student")
    pid = _create_project(client, t_h)
    motivation = {"motivation": "Je suis très motivé pour ce projet académique important."}

    client.post(f"/api/v1/applications/projects/{pid}", json=motivation, headers=s_h)
    resp = client.post(f"/api/v1/applications/projects/{pid}", json=motivation, headers=s_h)
    assert resp.status_code == 409


def test_teacher_cannot_apply(client):
    t_h = _register_and_login(client, "t@noapply.cm", "teacher")
    pid = _create_project(client, t_h)

    resp = client.post(f"/api/v1/applications/projects/{pid}", json={
        "motivation": "Un enseignant ne peut pas postuler à son propre projet."
    }, headers=t_h)
    assert resp.status_code == 403


def test_teacher_can_see_applications(client):
    t_h = _register_and_login(client, "t@see.cm", "teacher")
    s_h = _register_and_login(client, "s@see.cm", "student")
    pid = _create_project(client, t_h)
    client.post(f"/api/v1/applications/projects/{pid}", json={
        "motivation": "Candidature sérieuse et bien argumentée pour ce projet."
    }, headers=s_h)

    resp = client.get(f"/api/v1/applications/projects/{pid}", headers=t_h)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_teacher_can_accept_application(client):
    t_h = _register_and_login(client, "t@accept.cm", "teacher")
    s_h = _register_and_login(client, "s@accept.cm", "student")
    pid = _create_project(client, t_h)
    app_id = client.post(f"/api/v1/applications/projects/{pid}", json={
        "motivation": "Candidature motivée et détaillée pour le projet proposé."
    }, headers=s_h).json()["id"]

    resp = client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "accepted"}, headers=t_h)
    assert resp.status_code == 200
    assert resp.json()["status"] == "accepted"


def test_student_can_see_own_applications(client):
    t_h = _register_and_login(client, "t@mine.cm", "teacher")
    s_h = _register_and_login(client, "s@mine.cm", "student")
    pid = _create_project(client, t_h)
    client.post(f"/api/v1/applications/projects/{pid}", json={
        "motivation": "Je suis très motivé par ce projet de recherche proposé."
    }, headers=s_h)

    resp = client.get("/api/v1/applications/mine", headers=s_h)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
