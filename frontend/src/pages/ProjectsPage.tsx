import { useCallback, useEffect, useRef, useState } from "react";
import {Save, Search, SlidersHorizontal, X} from "lucide-react";
import { projectService } from "@/services/project.service";
import ProjectCard from "@/components/shared/ProjectCard";
import { EmptyState, PageLoader } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type {Project, ProjectListResponse, ProjectStatus, User} from "@/types";
import {Dialog, DialogContent} from "@radix-ui/react-dialog";
import {DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import {toast} from "sonner";

const DOMAINS = [
  "Intelligence Artificielle", "Développement Mobile", "Web",
  "Big Data / Santé", "Éducation", "Sécurité", "Réseaux", "Autre",
];


interface FormState {
  title: string;
  description: string;
  max_students: number;
  domain: string;
  status: ProjectStatus;
}


export default function ProjectsPage() {
  const [data, setData] = useState<ProjectListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal create/edit
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [form, setForm]             = useState<FormState>({
    title: "", description: "", max_students: 1, domain: "", status: "open",
  });
  const [formErrors, setFormErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving]         = useState(false);

  // Debounce search input
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.title.trim()) e.title = "Le titre est requis.";
    else if (form.title.trim().length < 5) e.title = "Titre trop court (5 caractères minimum).";
    if (!form.description.trim()) e.description = "La description est requise.";
    else if (form.description.trim().length < 20) e.description = "Description trop courte (20 caractères minimum).";
    // if (form.max_students < 1) e.max_students = "Au moins 1 étudiant.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.listOpen({
        page,
        per_page: 9,
        search: debouncedSearch || undefined,
        domain: domain || undefined,
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, domain]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  function clearFilters() {
    setSearch("");
    setDomain("");
    setPage(1);
  }

  async function handleSubmit() {
    const isEdit = !!editTarget;
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
        const updated = await projectService.update(Number(editTarget!.id), payload);
        setData((prev) => {
          return prev?.items.map((p) => (p.id === updated.id ? updated : p));
        })
        toast.success("Projet mis à jour avec succès !");
      } else {
        const created = await projectService.create(payload);
        // @ts-ignore
        setData((prev) => {
          return prev?.items.push(created);
        })
        toast.success("Projet créé avec succès !");
      }
    } catch {
      toast.error(isEdit ? "Erreur lors de la mise à jour." : "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  const hasFilters = !!debouncedSearch || !!domain;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Projets disponibles</h2>
        <p className="text-md text-muted-foreground mt-0.5">
          {data ? `${data.total} projet${data.total !== 1 ? "s" : ""} ouvert${data.total !== 1 ? "s" : ""}` : "Chargement…"}
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-9 py-6 text-md bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute  right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-4.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Select  value={domain} onValueChange={(v) => { setDomain(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-48 text-md px-9 py-6 bg-white">
              <SlidersHorizontal className="size-3.5 text-muted-foreground mr-1" />
              <SelectValue placeholder="Domaine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les domaines</SelectItem>
              {DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
              <X className="size-3.5" /> Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {debouncedSearch && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-md px-3 py-1 font-medium">
              "{debouncedSearch}"
              <button onClick={() => { setSearch(""); setDebouncedSearch(""); setPage(1); }}>
                <X className="size-4" />
              </button>
            </span>
          )}
          {domain && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-bronze/15 text-amber-800 text-md px-3 py-1 font-medium">
              {domain}
              <button onClick={() => { setDomain(""); setPage(1); }}>
                <X className="size-4" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <PageLoader />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucun projet trouvé"
          description={hasFilters ? "Essayez d'autres critères de recherche." : "Aucun projet ouvert pour le moment."}
          action={hasFilters ? <Button variant="outline" size="lg" onClick={clearFilters}>Effacer les filtres</Button> : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>

          {/* Pagination */}
          {data.total_pages > 0 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-md text-muted-foreground">
                Page {data.page} sur {data.total_pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="lg"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Précédent
                </Button>
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: data.total_pages }, (_, i) => i + 1)
                    .filter((n) => Math.abs(n - page) <= 2)
                    .map((n) => (
                      <Button key={n} size="lg"
                        variant={n === page ? "default" : "outline"}
                        onClick={() => setPage(n)}
                        className="w-8 p-0"
                      >
                        {n}
                      </Button>
                    ))}
                </div>
                <Button
                  variant="outline" size="lg"
                  disabled={page === data.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant →
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      {/* ── Modal Créer / Modifier ─────────────── */}
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


interface ProjectFormModalProps {
  open: boolean;
  onClose: ()=> void;
  form: FormState;
  setForm: (f: FormState) => void;
  errors: Partial<FormState>;
  isEdit: boolean;
  saving: boolean;
  onSubmit: ()=> void;
}

function ProjectFormModal({
                            open, onClose, form, setForm, errors, isEdit, saving, onSubmit
                          }:ProjectFormModalProps) {

  return (
      <Dialog open={open} onOpenChange = {(v) => {if(!v) onClose();}}>
        <DialogContent className={"sm:max-w-md"}>
          <DialogHeader>
            <DialogTitle className={"text-xl"}>
              {isEdit ? "Modifier le projet" : "Créer un projet"}
            </DialogTitle>
            <DialogDescription  className={"text-md"}>
              {isEdit
                  ? "Modifiez les informations de ce projet."
                  : "Créez un nouveau projet. "}
            </DialogDescription>
          </DialogHeader>



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

          <DialogFooter className="gap-2">
            <Button onClick={onSubmit} loading={saving} className="gap-2">
              <Save className="size-4" />
              {isEdit ? "Enregistrer les modifications" : "Créer le projet"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={saving} >
              Annuler
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>
  );

}
