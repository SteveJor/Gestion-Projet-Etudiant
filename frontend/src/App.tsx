import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import Layout from "@/components/shared/Layout";

// Pages publiques
import LoginPage from "@/pages/LoginPage";

// Pages protégées
import DashboardPage           from "@/pages/DashboardPage";
import ProjectsPage            from "@/pages/ProjectsPage";
import ProjectDetailPage       from "@/pages/ProjectDetailPage";
import MyProjectsPage          from "@/pages/MyProjectsPage";
import ApplicationsPage        from "@/pages/ApplicationsPage";
import ProjectApplicationsPage from "@/pages/ProjectApplicationsPage";
import UsersPage               from "@/pages/UsersPage";

export default function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <Toaster
              position="top-right"
              richColors
              toastOptions={{
                style: {
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontSize: "13px",
                },
              }}
          />

          <Routes>
            {/* ── Publiques ─────────────────────────── */}
            <Route path="/login" element={<LoginPage />} />

            {/* ── Protégées (toute personne authentifiée) ── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>

                {/* Commun */}
                <Route path="/dashboard"    element={<DashboardPage />} />
                <Route path="/projects"     element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />

                {/* Enseignant */}
                <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
                  <Route path="/my-projects"               element={<MyProjectsPage />} />
                  <Route path="/projects/:id/applications" element={<ProjectApplicationsPage />} />
                </Route>

                {/* Étudiant */}
                <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                  <Route path="/applications" element={<ApplicationsPage />} />
                </Route>

                {/* Admin */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                  <Route path="/admin/users" element={<UsersPage />} />
                </Route>

              </Route>
            </Route>

            {/* ── Redirections ──────────────────────── */}
            <Route path="/"        element={<Navigate to="/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="*"        element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
  );
}

function NotFound() {
  return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-brand-platinum">
        <p className="text-6xl font-bold text-primary/30">404</p>
        <p className="text-lg font-semibold text-foreground">Page introuvable</p>
        <a href="/dashboard" className="text-sm text-primary hover:underline">
          Retour au tableau de bord
        </a>
      </div>
  );
}
