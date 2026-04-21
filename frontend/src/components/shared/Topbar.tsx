import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user } = useAuth();

  const roleLabel: Record<string, string> = {
    student: "Étudiant",
    teacher: "Enseignant",
    admin:   "Administrateur",
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-white/80 backdrop-blur-md px-4 lg:px-6">
      {/* Mobile hamburger */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="size-5" />
      </Button>

      {/* Page title */}
      <div className="flex-1">
        {title && <h1 className="text-sm font-semibold text-foreground/80">{title}</h1>}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary inline-block" />
          {user?.role ? roleLabel[user.role] : ""}
        </span>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
        </Button>
      </div>
    </header>
  );
}
