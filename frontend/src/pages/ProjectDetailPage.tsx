import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Users, Calendar, Tag, User, ArrowLeft,
  Pencil, Trash2, SendHorizonal,
} from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { projectService } from "@/services/project.service";
import { applicationService } from "@/services/application.service";
import { ProjectStatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Project } from "@/types";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [motivationError, setMotivationError] = useState("");
  const [applying, setApplying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    projectService.getById(Number(id))
      .then(setProject)
      .catch(() => toast.error("Projet introuvable."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApply() {
    if (motivation.trim().length < 20) {
      setMotivationError("La motivation doit comporter au moins 20 caractères.");
      return;
    }
    setMotivationError("");
    setApplying(true);
    try {
      await applicationService.apply(Number(id), { motivation });
      toast.success("Candidature envoyée avec succès !");
      setApplyOpen(false);
      setMotivation("");
    } catch (err) {
      const msg = (err as AxiosError<{ detail: string }>)?.response?.data?.detail ?? "Erreur lors de la candidature.";
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await projectService.delete(Number(id));
      toast.success("Projet supprimé.");
      navigate("/my-projects");
    } catch {
      toast.error("Erreur lors de la suppression.");
      setDeleting(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!project) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Projet introuvable.</p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link to="/projects">← Retour aux projets</Link>
      </Button>
    </div>
  );

  const isOwner = user?.id === project.teacher_id;
  const isStudent = user?.role === "student";
  const isOpen = project.status === "open";

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Back */}
      <Link to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" /> Retour aux projets
      </Link>

      {/* Main card */}
      <div className="rounded-xl border border-border bg-white shadow-card overflow-hidden">
        {/* Accent top bar */}
        <div className="h-1 w-full flex">
          <div className="flex-1 bg-primary" />
          <div className="flex-1 bg-brand-bronze" />
          <div className="flex-1 bg-emerald-400" />
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <ProjectStatusBadge status={project.status} />
                {project.domain && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 bg-brand-bronze/15 rounded-full px-2.5 py-0.5">
                    <Tag className="size-3" /> {project.domain}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground leading-snug">{project.title}</h1>
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div className="flex gap-2 shrink-0">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/projects/${project.id}/edit`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action supprimera définitivement le projet et toutes ses candidatures. Elle est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDelete}
                      >
                        {deleting ? "Suppression…" : "Supprimer"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</h3>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{project.description}</p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetaItem icon={User} label="Enseignant" value={project.teacher.full_name} />
            <MetaItem icon={Users} label="Étudiants max" value={`${project.max_students} place${project.max_students > 1 ? "s" : ""}`} />
            <MetaItem
              icon={Calendar} label="Publié le"
              value={new Date(project.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
            />
          </div>

          {/* Teacher actions: see applications */}
          {isOwner && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button asChild variant="outline" size="sm">
                <Link to={`/projects/${project.id}/applications`}>
                  <Users className="size-4" /> Voir les candidatures
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to={`/projects/${project.id}/edit`}>
                  <Pencil className="size-4" /> Modifier
                </Link>
              </Button>
            </div>
          )}

          {/* Student: apply */}
          {isStudent && (
            <div className="pt-2 border-t border-border">
              {isOpen ? (
                <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <SendHorizonal className="size-4" /> Postuler à ce projet
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Postuler au projet</DialogTitle>
                      <DialogDescription className="line-clamp-1">{project.title}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                      <Label htmlFor="motivation">Lettre de motivation</Label>
                      <Textarea
                        id="motivation"
                        placeholder="Expliquez pourquoi vous êtes le meilleur candidat pour ce projet (20 caractères minimum)…"
                        rows={6}
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        error={motivationError}
                      />
                      <p className="text-xs text-muted-foreground text-right">{motivation.length} caractères</p>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setApplyOpen(false)}>Annuler</Button>
                      <Button onClick={handleApply} loading={applying} className="gap-2">
                        <SendHorizonal className="size-4" /> Envoyer ma candidature
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <p className="text-sm text-muted-foreground italic">Ce projet n'accepte plus de candidatures.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
