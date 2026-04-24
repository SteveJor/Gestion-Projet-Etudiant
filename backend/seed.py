"""
Script de seed : peuple la base de données avec des données de test.

NOTE : L'inscription publique est désactivée.
       Tous les comptes sont gérés exclusivement par l'administrateur
       via l'interface web ou l'API (POST /api/v1/admin/users).

Lancer avec :
  python seed.py
"""
import sys
import os
from datetime import datetime, timedelta

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

        print("🌱 Début du seeding des données...")

        # ============================================================
        # 1. CRÉATION DES UTILISATEURS (1 admin + 7 enseignants + 8 étudiants = 16)
        # ============================================================

        # Administrateur
        admin = User(
            email="admin@univ.cm",
            full_name="Administrateur Système",
            password_hash=hash_password("admin123"),
            role=UserRole.ADMIN,
        )

        # Enseignants (7)
        teacher1 = User(
            email="teacher@univ.cm",
            full_name="Dr. Jean Mbarga",
            password_hash=hash_password("password123"),
            role=UserRole.TEACHER,
        )
        teacher2 = User(
            email="teacher2@univ.cm",
            full_name="Prof. Awa Ndiaye",
            password_hash=hash_password("password123"),
            role=UserRole.TEACHER,
        )
        teacher3 = User(
            email="paul.tcham@univ.cm",
            full_name="Dr. Paul Tcham",
            password_hash=hash_password("password123"),
            role=UserRole.TEACHER,
        )
        teacher4 = User(
            email="sophie.ekotto@univ.cm",
            full_name="Prof. Sophie Ekotto",
            password_hash=hash_password("password123"),
            role=UserRole.TEACHER,
        )
        teacher5 = User(
            email="marc.essomba@univ.cm",
            full_name="Dr. Marc Essomba",
            password_hash=hash_password("password123"),
            role=UserRole.TEACHER,
        )
        teacher6 = User(
            email="claire.ngo@univ.cm",
            full_name="Prof. Claire Ngo",
            password_hash=hash_password("password123"),
            role=UserRole.TEACHER,
        )
        teacher7 = User(
            email="henri.bikono@univ.cm",
            full_name="Dr. Henri Bikono",
            password_hash=hash_password("password123"),
            role=UserRole.TEACHER,
        )

        # Étudiants (8)
        student1 = User(
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
        student3 = User(
            email="yannick.nzefa@univ.cm",
            full_name="Yannick Nzefa",
            password_hash=hash_password("password123"),
            role=UserRole.STUDENT,
        )
        student4 = User(
            email="lucienne.mbarga@univ.cm",
            full_name="Lucienne Mbarga",
            password_hash=hash_password("password123"),
            role=UserRole.STUDENT,
        )
        student5 = User(
            email="franck.messi@univ.cm",
            full_name="Franck Messi",
            password_hash=hash_password("password123"),
            role=UserRole.STUDENT,
        )
        student6 = User(
            email="rachel.ndom@univ.cm",
            full_name="Rachel Ndom",
            password_hash=hash_password("password123"),
            role=UserRole.STUDENT,
        )
        student7 = User(
            email="stephane.kengne@univ.cm",
            full_name="Stéphane Kengne",
            password_hash=hash_password("password123"),
            role=UserRole.STUDENT,
        )
        student8 = User(
            email="beatrice.tankeu@univ.cm",
            full_name="Béatrice Tankeu",
            password_hash=hash_password("password123"),
            role=UserRole.STUDENT,
        )

        db.add_all([admin, teacher1, teacher2, teacher3, teacher4, teacher5, teacher6, teacher7,
                    student1, student2, student3, student4, student5, student6, student7, student8])
        db.commit()

        # Rafraîchir les références
        for u in [admin, teacher1, teacher2, teacher3, teacher4, teacher5, teacher6, teacher7,
                  student1, student2, student3, student4, student5, student6, student7, student8]:
            db.refresh(u)

        # ============================================================
        # 2. CRÉATION DES PROJETS (15 projets)
        # ============================================================

        p1 = Project(
            title="Système de détection de fraude par IA",
            description="Développement d'un modèle de machine learning pour détecter les transactions frauduleuses dans les systèmes bancaires mobiles en Afrique subsaharienne. Utilisation de Python, scikit-learn et pandas.",
            teacher_id=teacher1.id,
            max_students=2,
            domain="Intelligence Artificielle",
            status=ProjectStatus.OPEN,
        )
        p2 = Project(
            title="Application mobile de suivi agricole",
            description="Conception d'une application mobile (Flutter) permettant aux agriculteurs camerounais de suivre leurs cultures, gérer les intrants et accéder aux prix du marché en temps réel.",
            teacher_id=teacher1.id,
            max_students=3,
            domain="Développement Mobile",
            status=ProjectStatus.OPEN,
        )
        p3 = Project(
            title="Plateforme e-learning pour lycées ruraux",
            description="Création d'une plateforme web de cours en ligne pour les lycéens des zones rurales du Cameroun, avec gestion hors-ligne des contenus.",
            teacher_id=teacher2.id,
            max_students=2,
            domain="Éducation / Web",
            status=ProjectStatus.OPEN,
        )
        p4 = Project(
            title="Analyse Big Data des données de santé",
            description="Étude des tendances épidémiologiques au Cameroun à partir de données publiques de santé. Pipeline de traitement avec Apache Spark.",
            teacher_id=teacher2.id,
            max_students=1,
            domain="Big Data / Santé",
            status=ProjectStatus.CLOSED,
        )
        p5 = Project(
            title="Chatbot intelligent pour services administratifs",
            description="Développement d'un chatbot basé sur GPT pour automatiser les réponses aux questions des étudiants et personnels administratifs.",
            teacher_id=teacher3.id,
            max_students=3,
            domain="Traitement du Langage Naturel",
            status=ProjectStatus.OPEN,
        )
        p6 = Project(
            title="Système de reconnaissance faciale pour contrôle d'accès",
            description="Implémentation d'un système de reconnaissance faciale utilisant des réseaux de neurones profonds pour le contrôle d'accès dans les universités.",
            teacher_id=teacher3.id,
            max_students=2,
            domain="Vision par Ordinateur",
            status=ProjectStatus.OPEN,
        )
        p7 = Project(
            title="Plateforme de crowdfunding pour entrepreneurs locaux",
            description="Création d'une plateforme permettant aux entrepreneurs camerounais de lever des fonds pour leurs projets innovants.",
            teacher_id=teacher4.id,
            max_students=4,
            domain="FinTech / Web",
            status=ProjectStatus.OPEN,
        )
        p8 = Project(
            title="Application IoT pour la gestion intelligente de l'eau",
            description="Développement d'un système IoT avec capteurs pour surveiller et optimiser la consommation d'eau dans les bâtiments publics.",
            teacher_id=teacher4.id,
            max_students=2,
            domain="IoT / Embarqué",
            status=ProjectStatus.OPEN,
        )
        p9 = Project(
            title="Simulateur de marché boursier pour étudiants",
            description="Création d'une application web simulant le trading d'actions pour former les étudiants aux marchés financiers.",
            teacher_id=teacher5.id,
            max_students=3,
            domain="FinTech / Simulation",
            status=ProjectStatus.OPEN,
        )
        p10 = Project(
            title="Système de recommandation de contenu éducatif",
            description="Développement d'un moteur de recommandation personnalisé pour suggérer des ressources pédagogiques adaptées aux étudiants.",
            teacher_id=teacher5.id,
            max_students=2,
            domain="Machine Learning",
            status=ProjectStatus.OPEN,
        )
        p11 = Project(
            title="Portefeuille blockchain pour transactions sécurisées",
            description="Implémentation d'un portefeuille de cryptomonnaies léger avec gestion des clés privées et validation de transactions.",
            teacher_id=teacher6.id,
            max_students=2,
            domain="Blockchain / Sécurité",
            status=ProjectStatus.OPEN,
        )
        p12 = Project(
            title="Application de télémédecine pour zones isolées",
            description="Conception d'une application permettant des consultations médicales à distance avec gestion de dossiers patients sécurisés.",
            teacher_id=teacher6.id,
            max_students=3,
            domain="Santé / Mobile",
            status=ProjectStatus.OPEN,
        )
        p13 = Project(
            title="Système de gestion intelligente des transports scolaires",
            description="Développement d'une plateforme de géolocalisation et d'optimisation des trajets pour les transports scolaires.",
            teacher_id=teacher7.id,
            max_students=2,
            domain="Géolocalisation / Optimisation",
            status=ProjectStatus.OPEN,
        )
        p14 = Project(
            title="Analyse prédictive des résultats académiques",
            description="Utilisation de modèles de machine learning pour prédire les risques d'échec académique et proposer des interventions précoces.",
            teacher_id=teacher7.id,
            max_students=3,
            domain="Data Science / Éducation",
            status=ProjectStatus.OPEN,
        )
        p15 = Project(
            title="Framework de tests automatisés pour applications mobiles",
            description="Création d'un framework open-source pour automatiser les tests d'interfaces utilisateur sur applications Android et iOS.",
            teacher_id=teacher1.id,
            max_students=4,
            domain="Qualité Logicielle / Test",
            status=ProjectStatus.OPEN,
        )

        db.add_all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15])
        db.commit()

        for p in [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15]:
            db.refresh(p)

        # ============================================================
        # 3. CRÉATION DES CANDIDATURES (15 candidatures)
        # ============================================================

        # Candidature 1
        app1 = Application(
            student_id=student1.id,
            project_id=p1.id,
            motivation="Je suis passionné par la cybersécurité et le machine learning. J'ai déjà réalisé un projet de détection d'anomalies réseau dans le cadre de mon cours de sécurité. Ce projet correspond parfaitement à mes ambitions professionnelles dans la fintech africaine.",
            status=ApplicationStatus.PENDING,
        )

        # Candidature 2
        app2 = Application(
            student_id=student2.id,
            project_id=p1.id,
            motivation="Étudiante en master informatique, spécialité data science. Ce projet sur la fraude mobile en Afrique me tient à cœur car il adresse un problème réel que j'ai vu affecter ma famille. Maîtrise de Python et de scikit-learn confirmée.",
            status=ApplicationStatus.ACCEPTED,
        )

        # Candidature 3
        app3 = Application(
            student_id=student1.id,
            project_id=p3.id,
            motivation="Je veux contribuer à l'éducation numérique en Afrique. Ayant grandi en zone rurale, je comprends les défis d'accès à une éducation de qualité. Je maîtrise React, Node.js et les Progressive Web Apps.",
            status=ApplicationStatus.PENDING,
        )

        # Candidature 4
        app4 = Application(
            student_id=student3.id,
            project_id=p2.id,
            motivation="Expérience en développement mobile avec Flutter. J'ai déjà développé une application de gestion de ferme pour mon projet de fin d'année. Ce projet agricole me passionne.",
            status=ApplicationStatus.PENDING,
        )

        # Candidature 5
        app5 = Application(
            student_id=student4.id,
            project_id=p5.id,
            motivation="Spécialiste en NLP avec une expérience en fine-tuning de modèles transformers. Je souhaite appliquer mes compétences aux problématiques administratives locales.",
            status=ApplicationStatus.ACCEPTED,
        )

        # Candidature 6
        app6 = Application(
            student_id=student5.id,
            project_id=p6.id,
            motivation="Je travaille sur un projet de reconnaissance faciale pour mon mémoire. J'utilise PyTorch et les réseaux siamois. Ce projet serait une excellente continuité.",
            status=ApplicationStatus.PENDING,
        )

        # Candidature 7
        app7 = Application(
            student_id=student6.id,
            project_id=p7.id,
            motivation="Passionnée par l'entrepreneuriat africain. J'ai créé une petite entreprise de e-commerce. Je veux aider d'autres entrepreneurs à lever des fonds.",
            status=ApplicationStatus.PENDING,
        )

        # Candidature 8
        app8 = Application(
            student_id=student7.id,
            project_id=p8.id,
            motivation="Compétences en Arduino, Raspberry Pi et capteurs. J'ai déjà déployé un système de surveillance de qualité de l'air dans mon quartier.",
            status=ApplicationStatus.ACCEPTED,
        )

        # Candidature 9
        app9 = Application(
            student_id=student8.id,
            project_id=p9.id,
            motivation="Étudiant en finance et informatique. Je trade personnellement sur les marchés boursiers et veux partager ces connaissances via la simulation.",
            status=ApplicationStatus.PENDING,
        )

        # Candidature 10
        app10 = Application(
            student_id=student2.id,
            project_id=p10.id,
            motivation="Mon stage de fin d'études portait sur les systèmes de recommandation pour Netflix. Je maîtrise SVD, factorization machines et l'évaluation offline/online.",
            status=ApplicationStatus.PENDING,
        )

        # Candidature 11
        app11 = Application(
            student_id=student3.id,
            project_id=p11.id,
            motivation="Je suis certifié en développement blockchain (Hyperledger). Intéressé par la création de wallets sécurisés pour le marché africain.",
            status=ApplicationStatus.PENDING,
        )

        # Candidature 12
        app12 = Application(
            student_id=student4.id,
            project_id=p12.id,
            motivation="Infirmière de formation, maintenant développeuse. Je comprends les besoins des patients en zones isolées et la confidentialité des données médicales.",
            status=ApplicationStatus.ACCEPTED,
        )

        # Candidature 13
        app13 = Application(
            student_id=student5.id,
            project_id=p13.id,
            motivation="Expérience en optimisation d'itinéraires avec algorithmes génétiques. Je veux réduire les coûts et l'empreinte carbone des transports scolaires.",
            status=ApplicationStatus.PENDING,
        )

        # Candidature 14
        app14 = Application(
            student_id=student6.id,
            project_id=p14.id,
            motivation="Mon projet de recherche porte sur l'analyse prédictive en éducation. J'ai publié un article sur la détection précoce des décrocheurs scolaires.",
            status=ApplicationStatus.PENDING,
        )

        # Candidature 15
        app15 = Application(
            student_id=student1.id,
            project_id=p15.id,
            motivation="Je suis contributeur open-source à plusieurs frameworks de test (Jest, XCTest). Je veux créer une solution adaptée aux contraintes des apps mobiles africaines.",
            status=ApplicationStatus.PENDING,
        )

        db.add_all([app1, app2, app3, app4, app5, app6, app7, app8, app9, app10, app11, app12, app13, app14, app15])
        db.commit()

        # ============================================================
        # 4. AFFICHAGE DES RÉSULTATS
        # ============================================================

        print("\n✅ Seed terminé avec succès !")
        print("=" * 60)
        print("  COMPTES CRÉÉS (16 utilisateurs)")
        print("=" * 60)
        print("  👑 ADMINISTRATEUR (1)")
        print("     admin@univ.cm / admin123")
        print("\n  👨‍🏫 ENSEIGNANTS (7)")
        print("     teacher@univ.cm / password123")
        print("     teacher2@univ.cm / password123")
        print("     paul.tcham@univ.cm / password123")
        print("     sophie.ekotto@univ.cm / password123")
        print("     marc.essomba@univ.cm / password123")
        print("     claire.ngo@univ.cm / password123")
        print("     henri.bikono@univ.cm / password123")
        print("\n  👩‍🎓 ÉTUDIANTS (8)")
        print("     student@univ.cm / password123")
        print("     student2@univ.cm / password123")
        print("     yannick.nzefa@univ.cm / password123")
        print("     lucienne.mbarga@univ.cm / password123")
        print("     franck.messi@univ.cm / password123")
        print("     rachel.ndom@univ.cm / password123")
        print("     stephane.kengne@univ.cm / password123")
        print("     beatrice.tankeu@univ.cm / password123")
        print("=" * 60)
        print(f"  📚 PROJETS : 15 projets créés")
        print(f"  📝 CANDIDATURES : 15 candidatures créées")
        print("=" * 60)
        print("\n🔐 Tous les mots de passe par défaut : password123 (sauf admin)")

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors du seed : {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()