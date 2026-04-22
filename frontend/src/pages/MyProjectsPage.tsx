import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Pencil, Trash2, Users, Eye } from "lucide-react";
import { toast } from "sonner";
import { projectService } from "@/services/project.service";
import { ProjectStatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, PageLoader } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    projectService.getMyProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await projectService.delete(id);
      toast.success("Projet supprimé.");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Mes projets</h2>
          <p className="text-md text-muted-foreground mt-0.5">
            {projects.length} projet{projects.length !== 1 ? "s" : ""} créé{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/projects/create">
            <PlusCircle className="size-5" /> Nouveau projet
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={PlusCircle}
          title="Aucun projet créé"
          description="Proposez votre premier sujet de recherche aux étudiants."
          action={
            <Button asChild size="lg">
              <Link to="/projects/create">Créer un projet</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {projects.map((p) => (
            <Card key={p.id} className="hover:shadow-card-hover transition-shadow duration-200">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  {/* Color dot */}
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-xl">
                      {p.title.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-md font-semibold truncate">{p.title}</p>
                      <ProjectStatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-md text-muted-foreground flex items-center gap-1">
                        <Users className="size-3" /> {p.max_students} place{p.max_students > 1 ? "s" : ""}
                      </span>
                      {p.domain && (
                        <span className="text-md text-muted-foreground">· {p.domain}</span>
                      )}
                      <span className="text-md text-primary">
                        · {new Date(p.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button asChild variant="ghost" size="icon" title="Voir les candidatures">
                      <Link to={`/projects/${p.id}/applications`}>
                        <Users className="size-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" title="Voir le projet">
                      <Link to={`/projects/${p.id}`}>
                        <Eye className="size-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" title="Modifier">
                      <Link to={`/projects/${p.id}/edit`}>
                        <Pencil className="size-5" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Supprimer"
                          className="text-destructive/60 hover:text-destructive">
                          <Trash2 className="size-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className={"text-xl"}>Supprimer "{p.title}" ?</AlertDialogTitle>
                          <AlertDialogDescription className={"text-md  my-2"}>
                            Toutes les candidatures associées seront également supprimées. Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(p.id)}
                          >
                            {deletingId === p.id ? "Suppression…" : "Supprimer"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
