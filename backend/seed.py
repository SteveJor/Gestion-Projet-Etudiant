"""
Script de seed : peuple la base de données avec des données de test.

NOTE : L'inscription publique est désactivée.
       Tous les comptes sont gérés exclusivement par l'administrateur
       via l'interface web ou l'API (POST /api/v1/admin/users).

Comptes créés par ce script :
  admin@univ.cm     / admin123      → Administrateur
  teacher@univ.cm   / password123   → Enseignant
  teacher2@univ.cm  / password123   → Enseignant
  student@univ.cm   / password123   → Étudiant
  student2@univ.cm  / password123   → Étudiant

Lancer avec :
  python seed.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, create_tables
from app.core.security import hash_password
from app.models.models import (
    Application, ApplicationStatus,
    Project, ProjectStatus,
    User, UserRole,
)


def seed() -> None:
    create_tables()
    db = SessionLocal()

    try:
        # Éviter les doublons
        if db.query(User).count() > 0:
            print("⚠️  La base de données contient déjà des données. Seed ignoré.")
            print("   Supprimez le fichier projet_univ.db pour recommencer.")
            return

        # ── Utilisateurs ──────────────────────────────────────────
        admin = User(
            email="admin@univ.cm",
            full_name="Administrateur Système",
            password_hash=hash_password("admin123"),
            role=UserRole.ADMIN,
        )
        teacher = User(
            email="teacher@univ.cm",
            full_name="Dr. Jean Mbarga",
            password_hash=hash_password("password123"),
            role=UserRole.TEACHER,
        )
        teacher2 = User(
            email="teacher2@univ.cm",
            full_name="Prof. Awa Ndi",
            password_hash=hash_password("password123"),
            role=UserRole.TEACHER,
        )
        student = User(
            email="student@univ.cm",
            full_name="Kofi Asante",
            password_hash=hash_password("password123"),
            role=UserRole.STUDENT,
        )
        student2 = User(
            email="student2@univ.cm",
            full_name="Amina Oumarou",
            password_hash=hash_password("password123"),
            role=UserRole.STUDENT,
        )

        db.add_all([admin, teacher, teacher2, student, student2])
        db.commit()
        for u in [admin, teacher, teacher2, student, student2]:
            db.refresh(u)

        # ── Projets ───────────────────────────────────────────────
        p1 = Project(
            title="Système de détection de fraude par IA",
            description=(
                "Développement d'un modèle de machine learning pour détecter "
                "les transactions frauduleuses dans les systèmes bancaires mobiles "
                "en Afrique subsaharienne. Utilisation de Python, scikit-learn et pandas."
            ),
            teacher_id=teacher.id,
            max_students=2,
            domain="Intelligence Artificielle",
            status=ProjectStatus.OPEN,
        )
        p2 = Project(
            title="Application mobile de suivi agricole",
            description=(
                "Conception d'une application mobile (Flutter) permettant aux "
                "agriculteurs camerounais de suivre leurs cultures, gérer les intrants "
                "et accéder aux prix du marché en temps réel."
            ),
            teacher_id=teacher.id,
            max_students=3,
            domain="Développement Mobile",
            status=ProjectStatus.OPEN,
        )
        p3 = Project(
            title="Plateforme e-learning pour lycées ruraux",
            description=(
                "Création d'une plateforme web de cours en ligne pour les lycéens "
                "des zones rurales du Cameroun, avec gestion hors-ligne des contenus."
            ),
            teacher_id=teacher2.id,
            max_students=2,
            domain="Éducation / Web",
            status=ProjectStatus.OPEN,
        )
        p4 = Project(
            title="Analyse Big Data des données de santé",
            description=(
                "Étude des tendances épidémiologiques au Cameroun à partir de "
                "données publiques de santé. Pipeline de traitement avec Apache Spark."
            ),
            teacher_id=teacher2.id,
            max_students=1,
            domain="Big Data / Santé",
            status=ProjectStatus.CLOSED,
        )

        db.add_all([p1, p2, p3, p4])
        db.commit()
        for p in [p1, p2, p3, p4]:
            db.refresh(p)

        # ── Candidatures ──────────────────────────────────────────
        app1 = Application(
            student_id=student.id,
            project_id=p1.id,
            motivation=(
                "Je suis passionné par la cybersécurité et le machine learning. "
                "J'ai déjà réalisé un projet de détection d'anomalies réseau dans "
                "le cadre de mon cours de sécurité. Ce projet correspond parfaitement "
                "à mes ambitions professionnelles dans la fintech africaine."
            ),
            status=ApplicationStatus.PENDING,
        )
        app2 = Application(
            student_id=student2.id,
            project_id=p1.id,
            motivation=(
                "Étudiante en master informatique, spécialité data science. "
                "Ce projet sur la fraude mobile en Afrique me tient à cœur car il "
                "adresse un problème réel que j'ai vu affecter ma famille. "
                "Maîtrise de Python et de scikit-learn confirmée."
            ),
            status=ApplicationStatus.ACCEPTED,
        )
        app3 = Application(
            student_id=student.id,
            project_id=p3.id,
            motivation=(
                "Je veux contribuer à l'éducation numérique en Afrique. Ayant grandi "
                "en zone rurale, je comprends les défis d'accès à une éducation de qualité. "
                "Je maîtrise React, Node.js et les Progressive Web Apps."
            ),
            status=ApplicationStatus.PENDING,
        )

        db.add_all([app1, app2, app3])
        db.commit()

        print("\n✅  Seed terminé avec succès !")
        print("─" * 50)
        print("  COMPTES CRÉÉS (par l'administrateur)")
        print("─" * 50)
        print("  admin@univ.cm     / admin123      → Administrateur")
        print("  teacher@univ.cm   / password123   → Enseignant")
        print("  teacher2@univ.cm  / password123   → Enseignant")
        print("  student@univ.cm   / password123   → Étudiant")
        print("  student2@univ.cm  / password123   → Étudiant")
        print("─" * 50)
        print("  4 projets · 3 candidatures créés")
        print()

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors du seed : {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
