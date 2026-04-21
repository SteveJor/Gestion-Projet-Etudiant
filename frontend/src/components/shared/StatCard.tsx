import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: "lavender" | "bronze" | "green" | "sky" | "amber";
  sublabel?: string;
}

const colorMap = {
  lavender: {
    bg:   "bg-primary/10",
    icon: "text-primary",
    val:  "text-primary",
  },
  bronze: {
    bg:   "bg-brand-bronze/15",
    icon: "text-amber-700",
    val:  "text-amber-800",
  },
  green: {
    bg:   "bg-emerald-100",
    icon: "text-emerald-600",
    val:  "text-emerald-700",
  },
  sky: {
    bg:   "bg-sky-100",
    icon: "text-sky-600",
    val:  "text-sky-700",
  },
  amber: {
    bg:   "bg-amber-100",
    icon: "text-amber-600",
    val:  "text-amber-700",
  },
};

export default function StatCard({ label, value, icon: Icon, color = "lavender", sublabel }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className={cn("mt-1.5 text-3xl font-bold", c.val)}>{value}</p>
          {sublabel && <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>}
        </div>
        <div className={cn("rounded-xl p-2.5", c.bg)}>
          <Icon className={cn("size-5", c.icon)} />
        </div>
      </div>
    </div>
  );
}
