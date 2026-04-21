import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { applicationService } from "@/services/application.service";
import { projectService } from "@/services/project.service";
import { ApplicationStatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, PageLoader } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Application, Project } from "@/types";

export default function ProjectApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject]         = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]         = useState(true);
  const [updating, setUpdating]       = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      projectService.getById(Number(id)),
      applicationService.getProjectApplications(Number(id)),
    ]).then(([p, apps]) => {
      setProject(p);
      setApplications(apps);
    }).catch(() => toast.error("Impossible de charger les données."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatus(appId: number, status: "accepted" | "rejected") {
    setUpdating(appId);
    try {
      const updated = await applicationService.updateStatus(appId, { status });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: updated.status } : a))
      );
      toast.success(status === "accepted" ? "Candidature acceptée !" : "Candidature refusée.");
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <PageLoader />;

  const pending  = applications.filter((a) => a.status === "pending");
  const decided  = applications.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-5 max-w-3xl">
      <Link
        to={`/projects/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Retour au projet
      </Link>

      {project && (
        <div>
          <h2 className="text-xl font-bold">Candidatures</h2>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{project.title}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total",       value: applications.length,  color: "bg-primary/10 text-primary" },
          { label: "En attente",  value: pending.length,       color: "bg-amber-100 text-amber-700" },
          { label: "Décidées",    value: decided.length,       color: "bg-emerald-100 text-emerald-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-4 text-center ${color} border border-current/10`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={User}
          title="Aucune candidature"
          description="Personne n'a encore postulé à ce projet."
        />
      ) : (
        <div className="space-y-5">
          {/* Pending section */}
          {pending.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-400 inline-block" />
                  En attente de décision ({pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {pending.map((app) => (
                    <ApplicationRow
                      key={app.id}
                      application={app}
                      updating={updating === app.id}
                      onAccept={() => handleStatus(app.id, "accepted")}
                      onReject={() => handleStatus(app.id, "rejected")}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Decided section */}
          {decided.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                  Décisions prises ({decided.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {decided.map((app) => (
                    <ApplicationRow
                      key={app.id}
                      application={app}
                      updating={false}
                      readOnly
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-component ────────────────────────────────────────────

interface ApplicationRowProps {
  application: Application;
  updating: boolean;
  readOnly?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

function ApplicationRow({ application: app, updating, readOnly, onAccept, onReject }: ApplicationRowProps) {
  const initials = app.student.full_name
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="p-4 space-y-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{app.student.full_name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(app.applied_at).toLocaleDateString("fr-FR", {
                day: "2-digit", month: "long", year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ApplicationStatusBadge status={app.status} />
          {!readOnly && app.status === "pending" && (
            <div className="flex gap-1.5">
              {/* Accept */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="success" className="gap-1.5 h-8" disabled={updating}>
                    <CheckCircle2 className="size-3.5" />
                    <span className="hidden sm:inline">Accepter</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Accepter la candidature de {app.student.full_name} ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Une notification sera envoyée à l'étudiant.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onAccept}>
                      Confirmer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Reject */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-destructive hover:text-destructive border-destructive/30" disabled={updating}>
                    <XCircle className="size-3.5" />
                    <span className="hidden sm:inline">Refuser</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Refuser la candidature de {app.student.full_name} ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Une notification sera envoyée à l'étudiant.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-white" onClick={onReject}>
                      Confirmer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>

      {/* Motivation */}
      <div className="rounded-lg bg-muted/50 px-3 py-2.5">
        <p className="text-xs font-semibold text-muted-foreground mb-1">Lettre de motivation</p>
        <p className="text-sm text-foreground/80 leading-relaxed">{app.motivation}</p>
      </div>
    </div>
  );
}
