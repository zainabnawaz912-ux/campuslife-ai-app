import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Bus,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Notebook,
  Search,
  Sparkles,
  Sun,
  UserRound,
  MapPin,
  Megaphone,
  Shield,
  Users,
  Package,
  X,
} from "lucide-react";
import { AppWordmark } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearSession, getSession, type Session } from "@/lib/session";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Home };

const studentNav: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/notes", label: "Notes", icon: Notebook },
  { to: "/app/books", label: "Books", icon: BookOpen },
  { to: "/app/lost-found", label: "Lost & Found", icon: MapPin },
  { to: "/app/bus", label: "Bus Updates", icon: Bus },
  { to: "/app/announcements", label: "Announcements", icon: Megaphone },
  { to: "/app/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/app/profile", label: "Profile", icon: UserRound },
];

const bottomNav: NavItem[] = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/notes", label: "Notes", icon: Notebook },
  { to: "/app/assistant", label: "AI", icon: Sparkles },
  { to: "/app/bus", label: "Bus", icon: Bus },
  { to: "/app/profile", label: "Me", icon: UserRound },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/bus", label: "Bus Updates", icon: Bus },
  { to: "/admin/notes", label: "Notes", icon: Notebook },
  { to: "/admin/books", label: "Books", icon: BookOpen },
  { to: "/admin/lost-found", label: "Lost & Found", icon: Package },
  { to: "/admin/reports", label: "Reports", icon: ClipboardList },
];

export function AppShell({
  children,
  variant = "student",
}: {
  children: ReactNode;
  variant?: "student" | "admin";
}) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [session, setSessionState] = useState<Session | null>(null);
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    setSessionState(getSession());
    const stored = localStorage.getItem("campuslife.theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("campuslife.theme", next ? "dark" : "light");
  };

  const logout = () => {
    clearSession();
    router.navigate({ to: "/login" });
  };

  const nav = variant === "admin" ? adminNav : studentNav;
  const isActive = (to: string) =>
    to === "/app" || to === "/admin" ? pathname === to : pathname.startsWith(to);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.navigate({ to: "/app/notes", search: { q } as never });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/60 bg-sidebar px-4 py-5 lg:block">
        <Link to={variant === "admin" ? "/admin" : "/app"} className="block px-1">
          <AppWordmark />
        </Link>
        {variant === "admin" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
            <Shield size={14} /> Admin Console
          </div>
        )}
        <nav className="mt-6 flex flex-col gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold">
              {(session?.name ?? "S").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{session?.name ?? "Student"}</div>
              <div className="truncate text-xs text-muted-foreground capitalize">
                {session?.role ?? "student"}
              </div>
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-destructive"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar (mobile drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-sidebar px-4 py-5 shadow-xl">
            <div className="flex items-center justify-between">
              <AppWordmark />
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 hover:bg-sidebar-accent"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-sidebar-accent",
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              {variant === "student" ? (
                <Link
                  to="/admin"
                  className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground"
                >
                  <Shield size={16} /> Switch to Admin
                </Link>
              ) : (
                <Link
                  to="/app"
                  className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground"
                >
                  <Users size={16} /> Student view
                </Link>
              )}
            </nav>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:px-6">
            <div className="flex items-center gap-2">
              <button
                className="rounded-lg p-2 hover:bg-accent lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div className="lg:hidden">
                <AppWordmark size={32} />
              </div>
            </div>
            <form onSubmit={onSearch} className="mx-auto hidden w-full max-w-xl md:block">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search notes, books, buses, announcements…"
                  className="h-10 rounded-xl pl-9"
                />
              </div>
            </form>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle theme">
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <Link
                to="/app/profile"
                className="ml-1 hidden h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground md:grid"
              >
                {(session?.name ?? "S").slice(0, 1).toUpperCase()}
              </Link>
            </div>
          </div>
          <form onSubmit={onSearch} className="px-4 pb-3 md:hidden">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search everything…"
                className="h-10 rounded-xl pl-9"
              />
            </div>
          </form>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 md:px-6 lg:pb-10">{children}</main>
      </div>

      {/* Bottom nav (mobile) */}
      {variant === "student" && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur lg:hidden">
          <div className="grid grid-cols-5">
            {bottomNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
