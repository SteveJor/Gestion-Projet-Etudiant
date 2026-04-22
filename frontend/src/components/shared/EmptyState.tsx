import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center  p-10 text-center">
        <img src={"/images/empty.png"} className={"h-56"}/>

        <p className="text-lg font-semibold text-foreground/80">{title}</p>
      {description && <p className="mt-1 text-mg text-muted-foreground max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground">Chargement…</p>
      </div>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
