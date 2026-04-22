import type { ApplicationStatus, ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

const projectStatusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  open:      { label: "Ouvert",   className: "status-open" },
  closed:    { label: "Fermé",    className: "status-closed" },
  completed: { label: "Terminé",  className: "status-completed" },
};

const applicationStatusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  pending:  { label: "En attente", className: "status-pending" },
  accepted: { label: "Acceptée",   className: "status-accepted" },
  rejected: { label: "Refusée",    className: "status-rejected" },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = projectStatusConfig[status] ?? { label: status, className: "" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold", cfg.className)}>
      {cfg.label}
    </span>
  );
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const cfg = applicationStatusConfig[status] ?? { label: status, className: "" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-md font-semibold", cfg.className)}>
      {cfg.label}
    </span>
  );
}
