"""
Simulation des notifications par email.
En production, remplacer par un vrai service SMTP (ex: SendGrid, Mailgun).
"""
import logging

logger = logging.getLogger(__name__)


def notify_application_result(
    student_email: str, project_title: str, new_status: str
) -> None:
    """
    Simule l'envoi d'un email de notification à l'étudiant.
    Log la notification dans la console (simulation).
    """
    status_label = {
        "accepted": "✅ ACCEPTÉE",
        "rejected": "❌ REFUSÉE",
    }.get(new_status, new_status.upper())

    message = (
        f"[NOTIFICATION SIMULÉE]\n"
        f"  À       : {student_email}\n"
        f"  Objet   : Votre candidature a été {status_label}\n"
        f"  Projet  : {project_title}\n"
        f"  Statut  : {status_label}\n"
        f"  Message : Connectez-vous à la plateforme pour voir les détails."
    )
    logger.info(message)
    print(message)  # Visible directement dans la console du serveur


def notify_new_application(
    teacher_email: str, student_name: str, project_title: str
) -> None:
    """
    Simule une notification à l'enseignant quand un étudiant postule.
    """
    message = (
        f"[NOTIFICATION SIMULÉE]\n"
        f"  À       : {teacher_email}\n"
        f"  Objet   : Nouvelle candidature sur '{project_title}'\n"
        f"  De      : {student_name}\n"
        f"  Message : Connectez-vous pour examiner la candidature."
    )
    logger.info(message)
    print(message)
