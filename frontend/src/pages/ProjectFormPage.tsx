import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { projectService } from "@/services/project.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageLoader } from "@/components/shared/EmptyState";
import type { ProjectStatus } from "@/types";

const DOMAINS = [
  "Intelligence Artificielle", "Développement Mobile", "Web",
  "Big Data / Santé", "Éducation / Web", "Sécurité", "Réseaux",
  "Éducation", "Compiler / Langages", "Autre",
];

interface FormState {
  title: string;
  description: string;
  max_students: number;
  domain: string;
  status: ProjectStatus;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function ProjectFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    title: "", description: "", max_students: 1, domain: "", status: "open",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  // Pre-fill form for edit mode
  useEffect(() => {
    if (!isEdit || !id) return;
    projectService.getById(Number(id))
      .then((p) => {
        setForm({
          title: p.title,
          description: p.description,
          max_students: p.max_students,
          domain: p.domain ?? "",
          status: p.status,
        });
      })
      .catch(() => toast.error("Projet introuvable."))
      .finally(() => setFetchLoading(false));
  }, [id, isEdit]);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = "Le titre est requis.";
    else if (form.title.trim().length < 5) e.title = "Titre trop court (5 caractères minimum).";
    if (!form.description.trim()) e.description = "La description est requise.";
    else if (form.description.trim().length < 20) e.description = "Description trop courte (20 caractères minimum).";
    if (form.max_students < 1) e.max_students = "Au moins 1 étudiant.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      max_students: form.max_students,
      domain: form.domain || undefined,
      ...(isEdit ? { status: form.status } : {}),
    };

    try {
      if (isEdit) {
        await projectService.update(Number(id), payload);
        toast.success("Projet mis à jour avec succès !");
        navigate(`/projects/${id}`);
      } else {
        const created = await projectService.create(payload);
        toast.success("Projet créé avec succès !");
        navigate(`/projects/${created.id}`);
      }
    } catch {
      toast.error(isEdit ? "Erreur lors de la mise à jour." : "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  if (fetchLoading) return <PageLoader />;

  return (
    <div className="max-w-2xl space-y-5">
      <Link
        to={isEdit ? `/projects/${id}` : "/my-projects"}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        {isEdit ? "Retour au projet" : "Mes projets"}
      </Link>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>{isEdit ? "Modifier le projet" : "Créer un nouveau projet"}</CardTitle>
          <CardDescription>
            {isEdit ? "Mettez à jour les informations du projet." : "Proposez un sujet de recherche ou de développement aux étudiants."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            <div className="space-y-1.5">
              <Label htmlFor="title">Titre du projet <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="Ex : Système de détection de fraude par IA"
                value={form.title}
                error={errors.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                placeholder="Décrivez les objectifs, les technologies utilisées, le contexte…"
                rows={6}
                value={form.description}
                error={errors.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">{form.description.length} caractères</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="max_students">Nombre d'étudiants max</Label>
                <Input
                  id="max_students"
                  type="number"
                  min={1}
                  max={10}
                  value={form.max_students}
                  error={errors.max_students}
                  onChange={(e) => setForm({ ...form, max_students: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Domaine</Label>
                <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v === "none" ? "" : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un domaine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isEdit && (
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}>
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

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} className="gap-2">
                <Save className="size-4" />
                {isEdit ? "Enregistrer les modifications" : "Créer le projet"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
