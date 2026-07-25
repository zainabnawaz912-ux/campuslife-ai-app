import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Bus, Megaphone, Notebook, Package, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { announcements, buses, statusColor } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin overview — CampusLife AI" },
      { name: "description", content: "Manage announcements, buses, listings and reports." },
    ],
  }),
  component: AdminOverview,
});

const stats = [
  { label: "Active students", value: "4,281", icon: Users, tone: "text-primary" },
  { label: "Notes uploaded", value: "1,204", icon: Notebook, tone: "text-info" },
  { label: "Books listed", value: "312", icon: BookOpen, tone: "text-success" },
  { label: "Open reports", value: "18", icon: Package, tone: "text-warning-foreground" },
];

function AdminOverview() {
  return (
    <>
      <PageHeader title="Admin overview" subtitle="Snapshot of your campus platform." />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 p-5">
                <div className={`grid h-11 w-11 place-items-center rounded-xl bg-muted ${s.tone}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-xl font-bold">{s.value}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base"><Megaphone size={16} /> Recent announcements</CardTitle>
            <Link to="/admin/announcements" className="text-xs font-medium text-primary hover:underline">Manage</Link>
          </CardHeader>
          <CardContent className="divide-y">
            {announcements.slice(0, 5).map((a) => (
              <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.category} • {a.date}</div>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Published</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base"><Bus size={16} /> Bus status</CardTitle>
            <Link to="/admin/bus" className="text-xs font-medium text-primary hover:underline">Update</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {buses.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{b.number}</div>
                  <div className="truncate text-xs text-muted-foreground">{b.route}</div>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColor(b.status)}`}>{b.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp size={16} /> Weekly activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {[40, 65, 52, 78, 90, 60, 82].map((h, i) => (
                <div key={i} className="flex-1">
                  <div className="rounded-t-lg bg-gradient-primary" style={{ height: `${h}%` }} />
                  <div className="mt-1 text-center text-[10px] text-muted-foreground">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
