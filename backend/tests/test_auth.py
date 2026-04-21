"""Tests d'intégration : authentification."""


def test_register_student(client):
    resp = client.post("/api/v1/auth/register", json={
        "email": "student@test.cm",
        "full_name": "Étudiant Test",
        "password": "pass123",
        "role": "student",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "student@test.cm"
    assert data["role"] == "student"
    assert "password_hash" not in data


def test_register_duplicate_email(client):
    payload = {"email": "dup@test.cm", "full_name": "A", "password": "pass123", "role": "student"}
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 409


def test_login_success(client):
    client.post("/api/v1/auth/register", json={
        "email": "login@test.cm", "full_name": "Login", "password": "pass123", "role": "student"
    })
    resp = client.post("/api/v1/auth/login", json={"email": "login@test.cm", "password": "pass123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={
        "email": "wp@test.cm", "full_name": "WP", "password": "pass123", "role": "student"
    })
    resp = client.post("/api/v1/auth/login", json={"email": "wp@test.cm", "password": "wrong"})
    assert resp.status_code == 401


def test_get_me(client):
    client.post("/api/v1/auth/register", json={
        "email": "me@test.cm", "full_name": "Me", "password": "pass123", "role": "teacher"
    })
    token = client.post("/api/v1/auth/login", json={"email": "me@test.cm", "password": "pass123"}).json()["access_token"]
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@test.cm"


def test_get_me_no_token(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 403  # HTTPBearer retourne 403 quand absent
