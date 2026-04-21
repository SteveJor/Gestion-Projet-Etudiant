import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, UserRound, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRole } from "@/types";
import type { AxiosError } from "axios";
import { cn } from "@/lib/utils";

interface FormState {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState<FormState>({
    full_name: "", email: "", password: "", role: "student",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function validate() {
    const e: typeof errors = {};
    if (!form.full_name.trim()) e.full_name = "Nom requis";
    if (!form.email) e.email = "Email requis";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
    if (!form.password) e.password = "Mot de passe requis";
    else if (form.password.length < 6) e.password = "6 caractères minimum";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success("Compte créé ! Connectez-vous.");
      navigate("/login");
    } catch (err) {
      const msg = (err as AxiosError<{ detail: string }>)?.response?.data?.detail ?? "Erreur lors de l'inscription.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-platinum">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="size-4 text-white" />
          </div>
          <span className="font-bold text-foreground">UniProjets</span>
        </div>

        <Card className="shadow-card-hover border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Créer un compte</CardTitle>
            <CardDescription>Rejoignez la plateforme académique</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Role selector */}
              <div className="space-y-1.5">
                <Label>Je suis</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["student", "teacher"] as UserRole[]).map((r) => {
                    const Icon = r === "student" ? UserRound : BookOpen;
                    const label = r === "student" ? "Étudiant(e)" : "Enseignant(e)";
                    return (
                      <button
                        key={r} type="button"
                        onClick={() => setForm({ ...form, role: r })}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150",
                          form.role === r
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        <Icon className="size-4" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="full_name">Nom complet</Label>
                <Input id="full_name" placeholder="Jean Mbarga" value={form.full_name}
                  error={errors.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="vous@univ.cm" value={form.email}
                  error={errors.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input id="password" type={showPwd ? "text" : "password"}
                    placeholder="6 caractères minimum" value={form.password}
                    error={errors.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors">
                    {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Créer mon compte
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Déjà inscrit ?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
