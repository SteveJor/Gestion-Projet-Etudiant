import { Link } from "react-router-dom";
import { Users, Calendar, Tag, ArrowRight, FileText } from "lucide-react";
import type { ProjectSummary } from "@/types";
import { ProjectStatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectSummary;
  className?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-white p-5",
        "shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
    >


      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <ProjectStatusBadge status={project.status} />
      </div>

      {/* Description */}
      <p className="text-md text-primary  line-clamp-3 mb-4 flex-1">
        {project.description}
      </p>

      {/* Meta */}
      <div className="space-y-1.5 mb-4">
        {project.domain && (
          <div className="flex items-center gap-1.5 text-sm  text-muted-foreground">
            <Tag className="size-5 text-brand-bronze" />
            <span className={" text-sidebar"}>{project.domain}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-5 text-primary" />
          <span className={" text-sidebar"}>{project.max_students} étudiant{project.max_students > 1 ? "s" : ""} max</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="size-5 text-muted-foreground/70" />
          <span className={" text-sidebar"}>{formatDate(project.created_at)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {project.teacher_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">{project.teacher_name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <FileText className="size-5" />
            {project.applications_count}
          </span>
          <Link
            to={`/projects/${project.id}`}
            className="flex items-center text-accent gap-1 text-sm font-medium text-primary hover:underline"
          >
            Voir <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
