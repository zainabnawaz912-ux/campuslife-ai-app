import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bus,
  BookOpen,
  Megaphone,
  Notebook,
  MapPin,
  Sparkles,
  TrendingUp,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { announcements, buses, events, notes, statusColor } from "@/lib/mock-data";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CampusLife AI" },
      { name: "description", content: "Your personal campus overview: updates, buses, and events." },
    ],
  }),
  component: Dashboard,
});

const features = [
  { to: "/app/notes", label: "Notes", icon: Notebook, color: "from-sky-500 to-blue-600" },
  { to: "/app/books", label: "Books", icon: BookOpen, color: "from-indigo-500 to-violet-600" },
  { to: "/app/lost-found", label: "Lost & Found", icon: MapPin, color: "from-emerald-500 to-teal-600" },
  { to: "/app/bus", label: "Bus Updates", icon: Bus, color: "from-amber-500 to-orange-600" },
  { to: "/app/announcements", label: "Announcements", icon: Megaphone, color: "from-rose-500 to-pink-600" },
  { to: "/app/assistant", label: "AI Assistant", icon: Sparkles, color: "from-fuchsia-500 to-purple-600" },
];

function Dashboard() {
  const [name, setName] = useState("Student");
  useEffect(() => {
    const s = getSession();
    if (s?.name) setName(s.name.split(" ")[0]);
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        title={`${greet}, ${name} 👋`}
        subtitle="Here's what's happening on campus today."
      />

      {/* Welcome card */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-glow md:p-8">
        <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_15%_10%,white,transparent_40%),radial-gradient(circle_at_85%_85%,white,transparent_40%)]" />
        <div className="relative grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider opacity-80">Today</div>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">
              3 new announcements • 1 bus delay
            </h2>
            <p className="mt-2 max-w-xl text-sm opacity-90">
              Ask the CampusLife AI Assistant anything — from bus routes to exam schedules and study tips.
            </p>
          </div>
          <Link
            to="/app/assistant"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-primary hover:opacity-95"
          >
            <Sparkles size={16} /> Ask AI
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.to}
              to={f.to}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div
                className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white ${f.color}`}
              >
                <Icon size={20} />
              </div>
              <div className="mt-3 text-sm font-semibold">{f.label}</div>
              <ArrowRight size={14} className="mt-1 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone size={18} /> Recent announcements
            </CardTitle>
            <Link to="/app/announcements" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="divide-y">
            {announcements.slice(0, 4).map((a) => (
              <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full text-[10px]">{a.category}</Badge>
                    {a.pinned && <Badge className="rounded-full text-[10px]">Pinned</Badge>}
                  </div>
                  <div className="mt-1.5 truncate font-semibold">{a.title}</div>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{a.body}</p>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">{a.date}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bus size={18} /> Live bus status
            </CardTitle>
            <Link to="/app/bus" className="text-xs font-medium text-primary hover:underline">
              All buses
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {buses.slice(0, 3).map((b) => (
              <div key={b.id} className="rounded-xl border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{b.number}</div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColor(b.status)}`}>
                    {b.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{b.route}</div>
                <div className="mt-1 text-xs">{b.eta}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp size={18} /> Trending notes
            </CardTitle>
            <Link to="/app/notes" className="text-xs font-medium text-primary hover:underline">
              Browse library
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {notes.slice(0, 4).map((n) => (
              <div key={n.id} className="rounded-xl border border-border bg-background/60 p-3">
                <div className="line-clamp-1 text-sm font-semibold">{n.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {n.department} • Sem {n.semester}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{n.uploader}</span>
                  <span>{n.downloads} downloads</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays size={18} /> Upcoming events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <div className="text-center leading-tight">
                    <div className="text-[10px] font-medium uppercase">{e.date.split(" ")[0]}</div>
                    <div className="text-sm font-bold">{e.date.split(" ")[1]}</div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.time} • {e.venue}</div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full rounded-xl">View calendar</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
