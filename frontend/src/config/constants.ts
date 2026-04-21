export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const TOKEN_KEY = "univ_access_token";
export const USER_KEY = "univ_user";

export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
} as const;

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  closed: "Fermé",
  completed: "Terminé",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  rejected: "Refusée",
};
