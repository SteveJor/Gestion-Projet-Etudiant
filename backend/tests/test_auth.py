"""
Tests d'intégration : authentification.
L'inscription publique est désactivée — les comptes sont créés par l'admin.
"""
from app.core.security import hash_password
from app.models.models import User, UserRole


def _seed_user(db, email, role, password="pass123"):
    """Insère un utilisateur directement via la session de test."""
    user = User(
        email=email,
        full_name="Test User",
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_login_success(client, db):
    """Un utilisateur créé par l'admin peut se connecter."""
    _seed_user(db, "teacher@test.cm", UserRole.TEACHER, "pass123")
    resp = client.post("/api/v1/auth/login", json={
        "email": "teacher@test.cm",
        "password": "pass123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, db):
    """Mot de passe incorrect → 401."""
    _seed_user(db, "u@test.cm", UserRole.STUDENT, "correct")
    resp = client.post("/api/v1/auth/login", json={
        "email": "u@test.cm",
        "password": "wrong",
    })
    assert resp.status_code == 401


def test_login_unknown_email(client, db):
    """Email inexistant → 401."""
    resp = client.post("/api/v1/auth/login", json={
        "email": "nobody@x.cm",
        "password": "pass123",
    })
    assert resp.status_code == 401


def test_get_me_valid_token(client, db):
    """Token valide → retourne le profil."""
    _seed_user(db, "me@test.cm", UserRole.TEACHER, "pass123")
    token = client.post("/api/v1/auth/login", json={
        "email": "me@test.cm", "password": "pass123"
    }).json()["access_token"]

    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "me@test.cm"
    assert data["role"] == "teacher"
    assert "password_hash" not in data


def test_get_me_no_token(client, db):
    """Sans token → 403 (HTTPBearer rejecte la requête)."""
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 403


def test_get_me_invalid_token(client, db):
    """Token malformé → 403."""
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalide.token.ici"})
    assert resp.status_code == 401


def test_no_public_register_endpoint(client, db):
    """/auth/register ne doit plus exister (404 ou 405)."""
    resp = client.post("/api/v1/auth/register", json={
        "email": "x@x.cm",
        "full_name": "X",
        "password": "pass123",
        "role": "student",
    })
    assert resp.status_code in (404, 405), (
        f"L'endpoint /auth/register ne devrait plus être accessible, "
        f"reçu {resp.status_code}"
    )


def test_student_role_preserved(client, db):
    """Le rôle est bien conservé après connexion."""
    _seed_user(db, "student@test.cm", UserRole.STUDENT)
    token = client.post("/api/v1/auth/login", json={
        "email": "student@test.cm", "password": "pass123"
    }).json()["access_token"]

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    assert me["role"] == "student"


def test_admin_role_preserved(client, db):
    """Le rôle admin est bien conservé après connexion."""
    _seed_user(db, "admin@test.cm", UserRole.ADMIN, "admin123")
    token = client.post("/api/v1/auth/login", json={
        "email": "admin@test.cm", "password": "admin123"
    }).json()["access_token"]

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    assert me["role"] == "admin"
