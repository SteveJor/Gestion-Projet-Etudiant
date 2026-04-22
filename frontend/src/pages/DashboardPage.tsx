import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderOpen, Users, FileText, CheckCircle2,
  Clock, XCircle, GraduationCap, PlusCircle, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dashboardService } from "@/services/dashboard.service";
import { projectService } from "@/services/project.service";
import { applicationService } from "@/services/application.service";
import StatCard from "@/components/shared/StatCard";
import { PageLoader } from "@/components/shared/EmptyState";
import { ApplicationStatusBadge, ProjectStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminStats, Application, Project, StudentStats, TeacherStats } from "@/types";

// ─────────────────────────────────────────────
// Admin Dashboard
// ─────────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getAdminStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Vue d'ensemble</h2>
        <p className="text-md text-muted-foreground mt-0.5">Statistiques globales de la plateforme</p>
      </div>

      <center><img src="/images/dashboard.png" style={{"height":280}}/></center>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={stats.total_users} icon={Users} color="lavender" />
        <StatCard label="Étudiants" value={stats.total_students} icon={GraduationCap} color="green" />
        <StatCard label="Enseignants" value={stats.total_teachers} icon={FileText} color="bronze" />
        <StatCard label="Candidatures" value={stats.total_applications} icon={CheckCircle2} color="sky" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Projets ouverts"    value={stats.open_projects}      icon={FolderOpen}    color="green" />
        <StatCard label="Projets fermés"     value={stats.closed_projects}    icon={XCircle}       color="amber" />
        <StatCard label="Projets terminés"   value={stats.completed_projects} icon={CheckCircle2}  color="sky"   />
      </div>

      <Card className={"bg-transparent"}>
        <CardHeader>
          <CardTitle className="text-xl">Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ["Total projets",       stats.total_projects],
              ["Total utilisateurs",  stats.total_users],
              ["Ratio candidatures",  stats.total_projects > 0
                ? (stats.total_applications / stats.total_projects).toFixed(1) + " / projet"
                : "—"],
            ].map(([label, val]) => (
              <div key={String(label)} className="flex justify-between border-b border-border m-3 pb-2 last:border-0">
                <span className="text-muted-foreground text-lg">{label}</span>
                <span className="font-semibold text-lg">{val}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Teacher Dashboard
// ─────────────────────────────────────────────
function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getTeacherStats(),
      projectService.getMyProjects(),
    ]).then(([s, p]) => {
      setStats(s);
      setProjects(p.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Mes projets</h2>
          <p className="text-md text-muted-foreground mt-0.5">Gérez vos sujets de recherche</p>
        </div>
        <Button asChild size="lg">
          <Link to="/projects/create">
            <PlusCircle className="size-4" /> Nouveau projet
          </Link>
        </Button>
      </div>
      <center><img src="/images/dashboard.png" style={{"height":280}}/></center>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Mes projets"        value={stats.total_projects}              icon={FolderOpen}   color="lavender" />
          <StatCard label="Projets ouverts"    value={stats.open_projects}               icon={CheckCircle2} color="green"    />
          <StatCard label="Candidatures reçues" value={stats.total_applications_received} icon={FileText}    color="bronze"   />
        </div>
      )}

      {/* Recent projects */}
      <Card className={"bg-transparent border-0"}>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-0">
          <CardTitle className="text-xl">Projets récents</CardTitle>
          <Link to="/my-projects" className="text-lg text-primary hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="size-5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0 bg-white shadow rounded-2xl">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 pb-5">Aucun projet créé.</p>
          ) : (
            <div className="divide-y divide-border">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium truncate">{p.title}</p>
                    <p className="text-md text-muted-foreground">{p.max_students} étudiant{p.max_students > 1 ? "s" : ""} max</p>
                  </div>
                  <div className="flex items-center gap-3 ml-5">
                    <ProjectStatusBadge status={p.status} />
                    <Link to={`/projects/${p.id}`} className="text-md text-primary hover:underline">
                      <ArrowRight className="size-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Student Dashboard
// ─────────────────────────────────────────────
function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getStudentStats(),
      applicationService.getMyApplications(),
    ]).then(([s, apps]) => {
      setStats(s);
      setApplications(apps.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Mes candidatures</h2>
          <p className="text-md text-muted-foreground mt-0.5">Suivez l'état de vos dossiers</p>
        </div>
        <Button asChild size="lg" variant="outline">
          <Link to="/projects">
            <FolderOpen className="size-4" /> Parcourir les projets
          </Link>
        </Button>
      </div>
      <center><img src="/images/dashboard.png" style={{"height":280}}/></center>

      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total"      value={stats.total_applications} icon={FileText}    color="lavender" />
          <StatCard label="En attente" value={stats.pending}            icon={Clock}       color="amber"    />
          <StatCard label="Acceptées"  value={stats.accepted}           icon={CheckCircle2} color="green"   />
          <StatCard label="Refusées"   value={stats.rejected}           icon={XCircle}     color="sky"      />
        </div>
      )}

      {/* Recent applications */}
      <Card className={"bg-transparent border-0"}>
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-0">
          <CardTitle className="text-xl">Candidatures récentes</CardTitle>
          <Link to="/applications" className="text-md text-primary hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="size-5" />
          </Link>
        </CardHeader>
          <CardContent className="p-0 bg-white shadow rounded-2xl">
          {applications.length === 0 ? (
            <div className="px-5 m-auto pb-5">
              <p className="text-md text-muted-foreground">Aucune candidature soumise.</p>
              <Button asChild size="lg" className="mt-3">
                <Link to="/projects">Découvrir les projets</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {applications.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link to={`/projects/${a.project_id}`}
                      className="text-lg font-medium hover:text-primary transition-colors truncate block">
                      Projet #{a.project_id}
                    </Link>
                    <p className="text-md text-muted-foreground">
                      {new Date(a.applied_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main export — dispatche selon le rôle
// ─────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="space-y-6">

      {user?.role === "admin"   && <AdminDashboard />}
      {user?.role === "teacher" && <TeacherDashboard />}
      {user?.role === "student" && <StudentDashboard />}
    </div>
  );
}
