// import { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { ArrowLeft, Save } from "lucide-react";
// import { toast } from "sonner";
// import { projectService } from "@/services/project.service";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { PageLoader } from "@/components/shared/EmptyState";
// import type { ProjectStatus } from "@/types";
//
// type FormErrors = Partial<Record<keyof FormState, string>>;
//
// export default function ProjectFormPage() {
//   const { id } = useParams<{ id?: string }>();
//   const isEdit = !!id;
//   const navigate = useNavigate();
//
//   const [form, setForm] = useState<FormState>({
//     title: "", description: "", max_students: 1, domain: "", status: "open",
//   });
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [loading, setLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(isEdit);
//
//   // Pre-fill form for edit mode
//   useEffect(() => {
//     if (!isEdit || !id) return;
//     projectService.getById(Number(id))
//       .then((p) => {
//         setForm({
//           title: p.title,
//           description: p.description,
//           max_students: p.max_students,
//           domain: p.domain ?? "",
//           status: p.status,
//         });
//       })
//       .catch(() => toast.error("Projet introuvable."))
//       .finally(() => setFetchLoading(false));
//   }, [id, isEdit]);
//
//   function validate(): boolean {
//     const e: FormErrors = {};
//     if (!form.title.trim()) e.title = "Le titre est requis.";
//     else if (form.title.trim().length < 5) e.title = "Titre trop court (5 caractères minimum).";
//     if (!form.description.trim()) e.description = "La description est requise.";
//     else if (form.description.trim().length < 20) e.description = "Description trop courte (20 caractères minimum).";
//     if (form.max_students < 1) e.max_students = "Au moins 1 étudiant.";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   }
//
//   async function handleSubmit(evt: React.FormEvent) {
//     evt.preventDefault();
//     if (!validate()) return;
//     setLoading(true);
//
//     const payload = {
//       title: form.title.trim(),
//       description: form.description.trim(),
//       max_students: form.max_students,
//       domain: form.domain || undefined,
//       ...(isEdit ? { status: form.status } : {}),
//     };
//
//     try {
//       if (isEdit) {
//         await projectService.update(Number(id), payload);
//         toast.success("Projet mis à jour avec succès !");
//         navigate(`/projects/${id}`);
//       } else {
//         const created = await projectService.create(payload);
//         toast.success("Projet créé avec succès !");
//         navigate(`/projects/${created.id}`);
//       }
//     } catch {
//       toast.error(isEdit ? "Erreur lors de la mise à jour." : "Erreur lors de la création.");
//     } finally {
//       setLoading(false);
//     }
//   }
//
//   if (fetchLoading) return <PageLoader />;
//
//   return (
//   );
// }
