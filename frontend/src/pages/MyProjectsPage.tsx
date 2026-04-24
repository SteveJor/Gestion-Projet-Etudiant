import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle, Pencil, Trash2, Users, Eye, Save,
} from "lucide-react";
import { toast } from "sonner";
import { projectService } from "@/services/project.service";
import { ProjectStatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, PageLoader } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { Project, ProjectStatus } from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const DOMAINS = [
  "Intelligence Artificielle",
  "Développement Mobile",
  "Web",
  "Big Data / Santé",
  "Éducation",
  "Sécurité",
  "Réseaux",
  "Autre",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  description: string;
  max_students: number;
  domain: string;
  status: ProjectStatus;
}

const DEFAULT_FORM: FormState = {
  title: "",
  description: "",
  max_students: 1,
  domain: "",
  status: "open",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyProjectsPage() {
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Modal
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [form, setForm]             = useState<FormState>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving]         = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = () => {
    setLoading(true);
    projectService
        .getMyProjects()
        .then(setProjects)
        .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // ── Ouvrir modal ──────────────────────────────────────────────────────────

  function openCreate() {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(p: Project) {
    setEditTarget(p);
    setForm({
      title:        p.title,
      description:  p.description,
      max_students: p.max_students,
      domain:       p.domain ?? "",
      status:       p.status,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.title.trim())
      e.title = "Le titre est requis.";
    else if (form.title.trim().length < 5)
      e.title = "Titre trop court (5 caractères minimum).";
    if (!form.description.trim())
      e.description = "La description est requise.";
    else if (form.description.trim().length < 20)
      e.description = "Description trop courte (20 caractères minimum).";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Soumettre ─────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);

    const isEdit  = !!editTarget;
    const payload = {
      title:        form.title.trim(),
      description:  form.description.trim(),
      max_students: form.max_students,
      domain:       form.domain || undefined,
      ...(isEdit ? { status: form.status } : {}),
    };

    try {
      if (isEdit) {
        const updated = await projectService.update(Number(editTarget!.id), payload);
        setProjects((prev) =>
            prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
        );
        toast.success("Projet mis à jour avec succès !");
      } else {
        const created = await projectService.create(payload);
        setProjects((prev) => [...prev, created]);
        toast.success("Projet créé avec succès !");
      }
      setModalOpen(false);
    } catch {
      toast.error(isEdit ? "Erreur lors de la mise à jour." : "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  }

  // ── Supprimer ─────────────────────────────────────────────────────────────

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await projectService.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Projet supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <PageLoader />;

  return (
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Mes projets</h2>
            <p className="text-md text-muted-foreground mt-0.5">
              {projects.length} projet{projects.length !== 1 ? "s" : ""} créé
              {projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button size="lg" onClick={openCreate} className="gap-2">
            <PlusCircle className="size-5" /> Nouveau projet
          </Button>
        </div>

        {/* Empty state */}
        {projects.length === 0 ? (
            <EmptyState
                icon={PlusCircle}
                title="Aucun projet créé"
                description="Proposez votre premier sujet de recherche aux étudiants."
                action={
                  <Button size="lg" onClick={openCreate}>
                    Créer un projet
                  </Button>
                }
            />
        ) : (
            <div className="grid grid-cols-1 gap-3">
              {projects.map((p) => (
                  <Card
                      key={p.id}
                      className="hover:shadow-card-hover transition-shadow duration-200"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center gap-4 p-4">

                        {/* Initiale */}
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-xl">
                      {p.title.charAt(0).toUpperCase()}
                    </span>
                        </div>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-md font-semibold truncate">{p.title}</p>
                            <ProjectStatusBadge status={p.status} />
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                      <span className="text-md text-muted-foreground flex items-center gap-1">
                        <Users className="size-3" />
                        {p.max_students} place{p.max_students > 1 ? "s" : ""}
                      </span>
                            {p.domain && (
                                <span className="text-md text-muted-foreground">
                          · {p.domain}
                        </span>
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

                          {/*<Button asChild variant="ghost" size="icon" title="Voir le projet">*/}
                          {/*  <Link to={`/projects/${p.id}`}>*/}
                          {/*    <Eye className="size-5" />*/}
                          {/*  </Link>*/}
                          {/*</Button>*/}

                          <Button
                              variant="ghost"
                              size="icon"
                              title="Modifier"
                              onClick={() => openEdit(p)}
                          >
                            <Pencil className="size-5" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Supprimer"
                                  className="text-destructive/60 hover:text-destructive"
                              >
                                <Trash2 className="size-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl">
                                  Supprimer "{p.title}" ?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-md my-2">
                                  Toutes les candidatures associées seront également supprimées.
                                  Cette action est irréversible.
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

        {/* Modal */}
        <ProjectFormModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            form={form}
            setForm={setForm}
            errors={formErrors}
            isEdit={!!editTarget}
            saving={saving}
            onSubmit={handleSubmit}
        />

      </div>
  );
}

// ─── Modal formulaire ─────────────────────────────────────────────────────────

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  form: FormState;
  setForm: (f: FormState) => void;
  errors: Partial<FormState>;
  isEdit: boolean;
  saving: boolean;
  onSubmit: () => void;
}

function ProjectFormModal({
                            open, onClose, form, setForm, errors, isEdit, saving, onSubmit,
                          }: ProjectFormModalProps) {
  return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEdit ? "Modifier le projet" : "Créer un projet"}
            </DialogTitle>
            <DialogDescription className="text-md">
              {isEdit
                  ? "Modifiez les informations de ce projet."
                  : "Remplissez les informations pour créer un nouveau projet."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Titre */}
            <div className="space-y-1.5">
              <Label htmlFor="p-title" className="text-md">
                Titre du projet <span className="text-destructive">*</span>
              </Label>
              <Input
                  id="p-title"
                  placeholder="Ex : Système de détection de fraude par IA"
                  value={form.title}
                  error={errors.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="p-desc" className="text-md">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                  id="p-desc"
                  placeholder="Décrivez les objectifs, les technologies utilisées, le contexte..."
                  rows={5}
                  value={form.description}
                  error={errors.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {form.description.length} caractères
              </p>
            </div>

            {/* Étudiants max + Domaine */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="p-max" className="text-md">Étudiants max</Label>
                <Input
                    id="p-max"
                    type="number"
                    min={1}
                    max={10}
                    value={form.max_students}
                    onChange={(e) =>
                        setForm({ ...form, max_students: Number(e.target.value) })
                    }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-md">Domaine</Label>
                <Select
                    value={form.domain || "none"}
                    onValueChange={(v) =>
                        setForm({ ...form, domain: v === "none" ? "" : v })
                    }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {DOMAINS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Statut — édition uniquement */}
            {isEdit && (
                <div className="space-y-1.5">
                  <Label className="text-md">Statut</Label>
                  <Select
                      value={form.status}
                      onValueChange={(v) =>
                          setForm({ ...form, status: v as ProjectStatus })
                      }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Ouvert</SelectItem>
                      <SelectItem value="closed">Fermé</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={onSubmit} loading={saving} className="gap-2">
              <Save className="size-4" />
              {isEdit ? "Enregistrer les modifications" : "Créer le projet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}