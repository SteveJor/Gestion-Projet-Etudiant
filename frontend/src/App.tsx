import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import Layout from "@/components/shared/Layout";

// Pages publiques
import LoginPage    from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

// Pages protégées
import DashboardPage              from "@/pages/DashboardPage";
import ProjectsPage               from "@/pages/ProjectsPage";
import ProjectDetailPage          from "@/pages/ProjectDetailPage";
import ProjectFormPage            from "@/pages/ProjectFormPage";
import MyProjectsPage             from "@/pages/MyProjectsPage";
import ApplicationsPage           from "@/pages/ApplicationsPage";
import ProjectApplicationsPage    from "@/pages/ProjectApplicationsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications (sonner) */}
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
          {/* ── Publiques ──────────────────────────── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Protégées (auth requise) ────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>

              {/* Commun à tous */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects"  element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />

              {/* Enseignant uniquement */}
              <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
                <Route path="/projects/create"             element={<ProjectFormPage />} />
                <Route path="/projects/:id/edit"           element={<ProjectFormPage />} />
                <Route path="/my-projects"                 element={<MyProjectsPage />} />
                <Route path="/projects/:id/applications"   element={<ProjectApplicationsPage />} />
              </Route>

              {/* Étudiant uniquement */}
              <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                <Route path="/applications" element={<ApplicationsPage />} />
              </Route>

              {/* Admin uniquement */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                {/* Dashboard admin déjà dans DashboardPage */}
              </Route>

            </Route>
          </Route>

          {/* ── Redirections ───────────────────────── */}
          <Route path="/"   element={<Navigate to="/dashboard" replace />} />
          <Route path="*"   element={<NotFound />} />
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
