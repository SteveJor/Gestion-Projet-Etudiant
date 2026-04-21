// ─────────────────────────────────────────────
// Enums (mirroir exact des enums Python backend)
// ─────────────────────────────────────────────

export type UserRole = "student" | "teacher" | "admin";
export type ProjectStatus = "open" | "closed" | "completed";
export type ApplicationStatus = "pending" | "accepted" | "rejected";

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

// ─────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────

export interface ProjectSummary {
  id: number;
  title: string;
  description: string;
  max_students: number;
  status: ProjectStatus;
  domain: string | null;
  created_at: string;
  teacher_name: string;
  applications_count: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  teacher_id: number;
  max_students: number;
  status: ProjectStatus;
  domain: string | null;
  created_at: string;
  teacher: User;
}

export interface ProjectListResponse {
  items: ProjectSummary[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ProjectCreatePayload {
  title: string;
  description: string;
  max_students: number;
  domain?: string;
}

export interface ProjectUpdatePayload {
  title?: string;
  description?: string;
  max_students?: number;
  domain?: string;
  status?: ProjectStatus;
}

// ─────────────────────────────────────────────
// Applications
// ─────────────────────────────────────────────

export interface Application {
  id: number;
  student_id: number;
  project_id: number;
  motivation: string;
  status: ApplicationStatus;
  applied_at: string;
  student: User;
}

export interface ApplicationCreatePayload {
  motivation: string;
}

export interface ApplicationStatusUpdatePayload {
  status: "accepted" | "rejected";
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_projects: number;
  open_projects: number;
  closed_projects: number;
  completed_projects: number;
  total_applications: number;
}

export interface TeacherStats {
  total_projects: number;
  open_projects: number;
  total_applications_received: number;
}

export interface StudentStats {
  total_applications: number;
  pending: number;
  accepted: number;
  rejected: number;
}

// ─────────────────────────────────────────────
// API generic
// ─────────────────────────────────────────────

export interface ApiError {
  detail: string;
}
