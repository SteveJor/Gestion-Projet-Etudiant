import { useEffect, useRef, useState } from "react";
import {
  Plus, Search, X, Pencil, Trash2,
  UserRound, BookOpen, ShieldCheck,
  Users, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { adminService } from "@/services/admin.service";
import { useAuth } from "@/context/AuthContext";
import type { User, UserCreatePayload, UserRole, UserUpdatePayload } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState, PageLoader } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: React.ElementType; badgeClass: string; iconClass: string }
> = {
  student: {
    label: "Étudiant",
    icon: UserRound,
    badgeClass: "text-sky-700 border-sky-200",
    iconClass: "text-sky-600",
  },
  teacher: {
    label: "Enseignant",
    icon: BookOpen,
    badgeClass: "text-emerald-700 border-emerald-200",
    iconClass: "text-emerald-600",
  },
  admin: {
    label: "Administrateur",
    icon: ShieldCheck,
    badgeClass: "text-primary border-purple-200",
    iconClass: "text-purple-600",
  },
};

const FILTER_ROLES = [
  { value: "all",     label: "Tous les rôles" },
  { value: "student", label: "Étudiants" },
  { value: "teacher", label: "Enseignants" },
  { value: "admin",   label: "Admins" },
];

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FormState {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

const DEFAULT_FORM: FormState = {
  full_name: "", email: "", password: "", role: "student",
};

// ─────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  // Liste
  const [users, setUsers]   = useState<User[]>([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [search, setSearch]       = useState("");
  const [debouncedSearch, setDbSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal create/edit
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [form, setForm]             = useState<FormState>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving]         = useState(false);

  // Debounce
  const debRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDbSearch(search), 400);
    return () => clearTimeout(debRef.current);
  }, [search]);

  // Fetch
  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.listUsers({
        search: debouncedSearch || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        limit: 100,
      });
      setUsers(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [debouncedSearch, roleFilter]); // eslint-disable-line

  // ── Validation ─────────────────────────────
  function validate(isEdit: boolean): boolean {
    const e: Partial<FormState> = {};
    if (!form.full_name.trim()) e.full_name = "Nom requis.";
    if (!form.email.trim()) e.email = "Email requis.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide.";
    if (!isEdit && !form.password) e.password = "Mot de passe requis.";
    if (form.password && form.password.length < 6) e.password = "6 caractères minimum.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Ouvrir modal ────────────────────────────
  function openCreate() {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(u: User) {
    setEditTarget(u);
    setForm({ full_name: u.full_name, email: u.email, password: "", role: u.role });
    setFormErrors({});
    setModalOpen(true);
  }

  // ── Soumettre ───────────────────────────────
  async function handleSubmit() {
    const isEdit = !!editTarget;
    if (!validate(isEdit)) return;
    setSaving(true);
    try {
      if (isEdit) {
        const payload: UserUpdatePayload = {
          full_name: form.full_name,
          email: form.email,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        };
        const updated = await adminService.updateUser(editTarget!.id, payload);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        toast.success(`Compte de ${updated.full_name} mis à jour.`);
      } else {
        const payload: UserCreatePayload = { ...form };
        const created = await adminService.createUser(payload);
        setUsers((prev) => [created, ...prev]);
        setTotal((t) => t + 1);
        toast.success(`Compte de ${created.full_name} créé.`);
      }
      setModalOpen(false);
    } catch (err) {
      const msg = (err as AxiosError<{ detail: string }>)?.response?.data?.detail
        ?? "Une erreur est survenue.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  // ── Supprimer ───────────────────────────────
  async function handleDelete(id: number) {
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setTotal((t) => t - 1);
      toast.success("Utilisateur supprimé.");
    } catch (err) {
      const msg = (err as AxiosError<{ detail: string }>)?.response?.data?.detail
        ?? "Erreur lors de la suppression.";
      toast.error(msg);
    }
  }

  // ── Stats rapides ────────────────────────────
  const stats = {
    total:    users.length,
    students: users.filter((u) => u.role === "student").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    admins:   users.filter((u) => u.role === "admin").length,
  };

  // ────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestion des utilisateurs</h2>
          <p className="text-md text-muted-foreground mt-0.5">
            {total} utilisateur{total !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Button onClick={openCreate} size="lg" className="gap-2">
          <Plus className="size-5" /> Nouvel utilisateur
        </Button>
      </div>

      {/* Stats chips */}
      <div className="flex justify-center my-5 flex-wrap gap-2">
        {[
          { icon: Users,       label: "Total",        value: stats.total,    color: "text-primary" },
          { icon: UserRound,   label: "Étudiants",    value: stats.students, color: "text-sky-700" },
          { icon: BookOpen,    label: "Enseignants",  value: stats.teachers, color: "text-emerald-700" },
          { icon: ShieldCheck, label: "Admins",       value: stats.admins,   color: "text-purple-700" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-md font-semibold border border-current/10")}>
            <Icon className="size-3.5" />
            <span>{value} {label}</span>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email…"
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
          <Select value={roleFilter}  onValueChange={setRoleFilter}>
            <SelectTrigger className="px-4 py-6 text-md w-44 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className={"px-9 py-6 "} onClick={load} title="Actualiser">
            <RefreshCw className="size-10" />
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <PageLoader />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun utilisateur trouvé"
          description={search || roleFilter !== "all" ? "Essayez d'autres critères." : "Créez le premier compte."}
          action={
            <Button size="lg" onClick={openCreate}>
              <Plus className="size-4" /> Créer un utilisateur
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-muted/40 border-b border-border text-md font-semibold text-muted-foreground uppercase tracking-wide">
            <div className="col-span-5">Utilisateur</div>
            <div className="col-span-3">Rôle</div>
            <div className="col-span-2 hidden sm:block">Inscription</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {users.map((u) => {
              const cfg = ROLE_CONFIG[u.role];
              const RoleIcon = cfg.icon;
              const initials = u.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              const isSelf = u.id === currentUser?.id;

              return (
                <div
                  key={u.id}
                  className={cn(
                    "grid grid-cols-12 gap-3 items-center px-4 py-3 hover:bg-muted/20 transition-colors",
                    isSelf && "bg-primary/5"
                  )}
                >
                  {/* Nom + email */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <Avatar className="size-12 shrink-0">
                      <AvatarFallback className="text-md">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-lg truncate">
                        {u.full_name}
                        {isSelf && (
                          <span className="ml-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                            Moi
                          </span>
                        )}
                      </p>
                      <p className="text-md text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>

                  {/* Rôle */}
                  <div className="col-span-3">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-md font-medium",
                      cfg.badgeClass
                    )}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-md text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end gap-1">
                    <Button
                      variant="ghost" size="icon"
                      className="size-8"
                      title="Modifier"
                      onClick={() => openEdit(u)}
                    >
                      <Pencil className="size-5" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost" size="icon"
                          className="size-8 text-destructive/50 hover:text-destructive"
                          title={isSelf ? "Vous ne pouvez pas vous supprimer" : "Supprimer"}
                          disabled={isSelf}
                        >
                          <Trash2 className="size-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer {u.full_name} ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ce compte et toutes ses données associées (projets, candidatures) seront
                            définitivement supprimés. Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(u.id)}
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modal Créer / Modifier ─────────────── */}
      <UserFormModal
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

// ─────────────────────────────────────────────
// Modal formulaire
// ─────────────────────────────────────────────

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  form: FormState;
  setForm: (f: FormState) => void;
  errors: Partial<FormState>;
  isEdit: boolean;
  saving: boolean;
  onSubmit: () => void;
}

function UserFormModal({
  open, onClose, form, setForm, errors, isEdit, saving, onSubmit,
}: UserFormModalProps) {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifiez les informations du compte. Laissez le mot de passe vide pour le conserver."
              : "Créez un nouveau compte. L'utilisateur devra changer son mot de passe à la première connexion."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Rôle — en premier pour orienter le formulaire */}
          <div className="space-y-1.5">
            <Label>Rôle</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["student", "teacher", "admin"] as UserRole[]).map((r) => {
                const cfg = ROLE_CONFIG[r];
                const Icon = cfg.icon;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all duration-150",
                      form.role === r
                        ? `border-current ${cfg.badgeClass}`
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <Icon className="size-4" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nom complet */}
          <div className="space-y-1.5">
            <Label htmlFor="m-name">Nom complet</Label>
            <Input
              id="m-name"
              placeholder="Jean Mbarga"
              value={form.full_name}
              error={errors.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="m-email">Email</Label>
            <Input
              id="m-email"
              type="email"
              placeholder="jean.mbarga@univ.cm"
              value={form.email}
              error={errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <Label htmlFor="m-pwd">
              Mot de passe
              {isEdit && (
                <span className="ml-1.5 text-xs text-muted-foreground font-normal">(laisser vide = inchangé)</span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="m-pwd"
                type={showPwd ? "text" : "password"}
                placeholder={isEdit ? "Nouveau mot de passe (optionnel)" : "6 caractères minimum"}
                value={form.password}
                error={errors.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground text-xs"
              >
                {showPwd ? "Cacher" : "Voir"}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={onSubmit} loading={saving} className="gap-2">
            {isEdit ? "Enregistrer" : "Créer le compte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
