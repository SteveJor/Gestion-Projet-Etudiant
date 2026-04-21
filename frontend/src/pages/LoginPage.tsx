import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AxiosError } from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.email) e.email = "Email requis";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
    if (!form.password) e.password = "Mot de passe requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      toast.success("Connexion réussie !");
      navigate("/dashboard");
    } catch (err) {
      const msg = (err as AxiosError<{ detail: string }>)?.response?.data?.detail ?? "Identifiants incorrects.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-evently p-10"
        style={{ background: "linear-gradient(135deg, hsl(0, 0%, 97%) 0%, hsl(217, 12%, 87%) 100%)" }}>
        <center><img src="/images/login_1.png" className="mt-5" style={{"height":580, "width":420}}/></center>
        <div>
          <blockquote className="space-y-2">
            <p className="text-xl font-medium leading-relaxed">
              "La plateforme officielle de gestion des projets académiques de l'Université de Douala."
            </p>
          </blockquote>
        </div>
        {/* Decorative shapes */}
        <div className="relative h-28 pointer-events-none select-none">
          <div className="absolute -top-4 left-0 size-24 rounded-full bg-brand-bronze/20 blur-2xl" />
          <div className="absolute top-0 left-20 size-16 rounded-full bg-primary/30 blur-xl" />
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 bg-brand-platinum">
        <div className="w-full max-w-md">
          <Card className="shadow-card-hover border-0">
            <CardHeader className="pb-4">
            <div className="flex flex-row">
            <img src="/logo/logo.png" style={{"height":80}}/>
<div className="mt-3 ml-2">
  <CardTitle className="text-xl">Connexion</CardTitle>
              <CardDescription>Accédez à votre espace personnel</CardDescription>
</div>
            </div>

              
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email" type="email" placeholder="vous@univ.cm"
                    value={form.email} error={errors.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password" type={showPwd ? "text" : "password"}
                      placeholder="••••••" value={form.password} error={errors.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" loading={loading}>
                  Se connecter
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  S'inscrire
                </Link>
              </p>

              {/* Quick test accounts hint */}
              {/* <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-0.5">
                <p className="font-semibold text-foreground/70 mb-1">Comptes de démo :</p>
                <p>teacher@univ.cm / password123 (Enseignant)</p>
                <p>student@univ.cm / password123 (Étudiant)</p>
                <p>admin@univ.cm / admin123 (Admin)</p>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
