"""Routeur principal v1 — agrège tous les sous-routeurs."""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, admin_users, applications, dashboard, projects

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(projects.router)
router.include_router(applications.router)
router.include_router(dashboard.router)
router.include_router(admin_users.router)
