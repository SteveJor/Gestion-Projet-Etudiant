import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FolderOpen, PlusCircle, FileText,
  LogOut, GraduationCap, X, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ── Nav items by role ──────────────────────────
const studentNav = [
  { to: "/dashboard",    label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/projects",     label: "Projets",          icon: FolderOpen },
  { to: "/applications", label: "Mes candidatures", icon: FileText },
];

const teacherNav = [
  { to: "/dashboard",         label: "Tableau de bord",  icon: LayoutDashboard },
  { to: "/projects",          label: "Projets ouverts",  icon: FolderOpen },
  { to: "/my-projects",       label: "Mes projets",      icon: FileText },
];

const adminNav = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/projects",  label: "Tous les projets", icon: FolderOpen },
  { to: "/admin/users", label: "Gestion utilisateurs", icon: Users },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems =
    user?.role === "teacher" ? teacherNav :
    user?.role === "admin"   ? adminNav   : studentNav;

  const initials = user?.full_name
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          /* base */
          "fixed top-0 left-0 z-40 h-screen w-72 flex flex-col",
          " bg-white shadow-lg",
          /* mobile: slide in/out */
          "transition-transform duration-300 ease-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0 animate-slide-in" : "-translate-x-full"
        )}
      >
        {/* ── Logo ─────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
                        <img src="/logo/logo.png" style={{"height":50}}/>

            <span className="text-xl font-bold tracking-tight ">CampusFlow</span>
          </div>
          {/* Mobile close */}
          <button onClick={onClose} className="lg:hidden text-sidebar-foreground/60 hover:text-white">
            <X className="size-4" />
          </button>
        </div>


        {/* ── Nav ──────────────────────────── */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 font-bold rounded-md px-3 py-2.5 text-md transition-colors duration-150",
                  active
                    ? "bg-sidebar text-white"
                    : "text-sidebar/80  hover:bg-sidebar/50 hover:text-white"
                )}
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>


        {/* ── User footer ─────────────────── */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-8 text-sidebar">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-md font-semibold text-sidebar truncate">{user?.full_name}</p>
              <p className="text-sm text-sidebar/80 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-md justify-start gap-2 py-5 text-sidebar/80 hover:text-white hover:bg-sidebar-muted"
            onClick={logout}
          >
            <LogOut className="size-4" />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  );
}
