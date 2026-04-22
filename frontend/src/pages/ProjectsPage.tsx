import { useCallback, useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { projectService } from "@/services/project.service";
import ProjectCard from "@/components/shared/ProjectCard";
import { EmptyState, PageLoader } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProjectListResponse } from "@/types";

const DOMAINS = [
  "Intelligence Artificielle", "Développement Mobile", "Web",
  "Big Data / Santé", "Éducation", "Sécurité", "Réseaux", "Autre",
];

export default function ProjectsPage() {
  const [data, setData] = useState<ProjectListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
    </div>
  );
}
