import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":       "Tableau de bord",
  "/projects":        "Projets",
  "/projects/create": "Créer un projet",
  "/my-projects":     "Mes projets",
  "/applications":    "Mes candidatures",
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] ?? "";

  return (
    <div className="flex h-screen overflow-hidden " style={{ background: "linear-gradient(133deg,rgba(244, 245, 246, 1) 0%, rgba(244, 245, 246, 1) 50%, rgba(232, 242, 223, 1) 100%)"}}>
      {/* Sidebar */}
      {/* <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div> */}

      {/* Mobile sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-7xl p-4 lg:p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
