import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Calendar, ArrowRight } from "lucide-react";
import { applicationService } from "@/services/application.service";
import { ApplicationStatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, PageLoader } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Application } from "@/types";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationService.getMyApplications()
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const byStatus = {
    pending:  applications.filter((a) => a.status === "pending"),
    accepted: applications.filter((a) => a.status === "accepted"),
    rejected: applications.filter((a) => a.status === "rejected"),
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Mes candidatures</h2>
          <p className="text-md text-muted-foreground mt-0.5">
            {applications.length} candidature{applications.length !== 1 ? "s" : ""} soumise{applications.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild variant="outline" size="lg">
          <Link to="/projects">
            <FolderOpen className="size-4" /> Parcourir les projets
          </Link>
        </Button>
      </div>

      {/* Summary chips */}
      {applications.length > 0 && (
        <div className="flex justify-center gap-3 flex-wrap">
          <Chip color="amber"   label="En attente" count={byStatus.pending.length} />
          <Chip color="emerald" label="Acceptées"  count={byStatus.accepted.length} />
          <Chip color="red"     label="Refusées"   count={byStatus.rejected.length} />
        </div>
      )}

      {applications.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Aucune candidature"
          description="Vous n'avez encore postulé à aucun projet."
          action={
            <Button asChild size="sm">
              <Link to="/projects">Découvrir les projets</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <Card key={app.id} className="hover:shadow-card-hover transition-shadow duration-200">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  {/* Status color dot */}
                  <div className={`size-3 rounded-full shrink-0 ${
                    app.status === "accepted" ? "bg-emerald-500" :
                    app.status === "rejected" ? "bg-red-500" : "bg-amber-400"
                  }`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/projects/${app.project_id}`}
                      className="text-lg font-semibold hover:text-primary transition-colors"
                    >
                      Projet #{app.project_id}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-md text-muted-foreground">
                        <Calendar className="size-3" />
                        {new Date(app.applied_at).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "long", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>


                  {/* Status + link */}
                  <div className="flex items-center gap-3 shrink-0">
                    <ApplicationStatusBadge status={app.status} />
                    <Link
                      to={`/projects/${app.project_id}`}
                      className="text-md text-primary hover:underline flex items-center gap-1"
                    >
                      Voir <ArrowRight className="size-5 text-primary" />
                    </Link>
                  </div>
                </div>

                {/* Motivation expandable */}
                <div className="border-t rounded-b-xl border-border px-4 py-2.5 bg-primary">
                  <p className="text-md text-primary-foreground/80">
                    <span className="font-medium text-white">Motivation : </span>
                    {app.motivation}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ color, label, count }: { color: string; label: string; count: number }) {
  const styles: Record<string, string> = {
    amber:   "text-amber-800",
    emerald: "text-emerald-800",
    red:     "text-red-800",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-md font-semibold ${styles[color] ?? ""}`}>
      <span className="font-bold">{count}</span> {label}
    </span>
  );
}
