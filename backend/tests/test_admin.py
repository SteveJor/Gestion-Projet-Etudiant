"""Tests d'intégration : administration des utilisateurs."""
from app.core.security import hash_password
from app.models.models import User, UserRole


def _seed_admin(db, email="admin@test.cm"):
    """Insère un admin dans la session de test partagée."""
    admin = User(email=email, full_name="Admin", password_hash=hash_password("admin123"), role=UserRole.ADMIN)
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


def _auth(client, email, password="admin123"):
    token = client.post("/api/v1/auth/login", json={"email": email, "password": password}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_user(client, h, email, role="student"):
    return client.post("/api/v1/admin/users", json={
        "email": email, "full_name": "Test User", "password": "pass123", "role": role
    }, headers=h)


# ── Création ──────────────────────────────────────────────────

def test_admin_can_create_student(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    resp = _create_user(client, h, "s@test.cm", "student")
    assert resp.status_code == 201
    data = resp.json()
    assert data["role"] == "student"
    assert "password_hash" not in data


def test_admin_can_create_teacher(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    resp = _create_user(client, h, "t@test.cm", "teacher")
    assert resp.status_code == 201
    assert resp.json()["role"] == "teacher"


def test_admin_duplicate_email(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    _create_user(client, h, "dup@test.cm")
    resp = _create_user(client, h, "dup@test.cm")
    assert resp.status_code == 409


def test_non_admin_cannot_create_user(client, db):
    db.add(User(email="teacher@t.cm", full_name="T", password_hash=hash_password("p123"), role=UserRole.TEACHER))
    db.commit()
    h = _auth(client, "teacher@t.cm", "p123")
    resp = client.post("/api/v1/admin/users", json={
        "email": "x@x.cm", "full_name": "X", "password": "pass123", "role": "student"
    }, headers=h)
    assert resp.status_code == 403


# ── Lecture ───────────────────────────────────────────────────

def test_admin_list_users(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    _create_user(client, h, "u1@t.cm", "student")
    _create_user(client, h, "u2@t.cm", "teacher")
    resp = client.get("/api/v1/admin/users", headers=h)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 3  # admin + 2 créés


def test_admin_list_filter_by_role(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    _create_user(client, h, "s1@t.cm", "student")
    _create_user(client, h, "t1@t.cm", "teacher")
    resp = client.get("/api/v1/admin/users?role=student", headers=h)
    assert resp.status_code == 200
    assert all(u["role"] == "student" for u in resp.json()["items"])


def test_admin_search_users(client, db):
    _seed_admin(db)
    # Insérer directement via la session de test pour garantir la visibilité
    from app.core.security import hash_password as hp
    db.add(User(email="kofi@t.cm", full_name="Kofi Asante", password_hash=hp("p123"), role=UserRole.STUDENT))
    db.commit()
    h = _auth(client, "admin@test.cm")
    resp = client.get("/api/v1/admin/users?search=kofi", headers=h)
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


def test_admin_get_user_by_id(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    user_id = _create_user(client, h, "find@t.cm").json()["id"]
    resp = client.get(f"/api/v1/admin/users/{user_id}", headers=h)
    assert resp.status_code == 200
    assert resp.json()["id"] == user_id


def test_admin_get_unknown_user(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    assert client.get("/api/v1/admin/users/99999", headers=h).status_code == 404


# ── Mise à jour ───────────────────────────────────────────────

def test_admin_update_fullname(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    user_id = _create_user(client, h, "upd@t.cm").json()["id"]
    resp = client.put(f"/api/v1/admin/users/{user_id}", json={"full_name": "Nouveau Nom"}, headers=h)
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Nouveau Nom"


def test_admin_update_role(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    user_id = _create_user(client, h, "role@t.cm", "student").json()["id"]
    resp = client.put(f"/api/v1/admin/users/{user_id}", json={"role": "teacher"}, headers=h)
    assert resp.status_code == 200
    assert resp.json()["role"] == "teacher"


def test_admin_update_password(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    _create_user(client, h, "pwd@t.cm")
    # Connexion avec ancien mot de passe
    assert client.post("/api/v1/auth/login", json={"email": "pwd@t.cm", "password": "pass123"}).status_code == 200
    user_id = client.get("/api/v1/admin/users?search=pwd@t.cm", headers=h).json()["items"][0]["id"]
    # Changer le mot de passe
    client.put(f"/api/v1/admin/users/{user_id}", json={"password": "nouveau123"}, headers=h)
    # Connexion avec nouveau mot de passe
    assert client.post("/api/v1/auth/login", json={"email": "pwd@t.cm", "password": "nouveau123"}).status_code == 200
    assert client.post("/api/v1/auth/login", json={"email": "pwd@t.cm", "password": "pass123"}).status_code == 401


# ── Suppression ───────────────────────────────────────────────

def test_admin_delete_user(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    user_id = _create_user(client, h, "del@t.cm").json()["id"]
    assert client.delete(f"/api/v1/admin/users/{user_id}", headers=h).status_code == 200
    assert client.get(f"/api/v1/admin/users/{user_id}", headers=h).status_code == 404


def test_admin_cannot_delete_self(client, db):
    _seed_admin(db)
    h = _auth(client, "admin@test.cm")
    me = client.get("/api/v1/auth/me", headers=h).json()
    resp = client.delete(f"/api/v1/admin/users/{me['id']}", headers=h)
    assert resp.status_code == 400
