import { createFileRoute } from "@tanstack/react-router";
import { Bus, MapPin, Phone, User } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buses, statusColor } from "@/lib/mock-data";

export const Route = createFileRoute("/app/bus")({
  head: () => ({
    meta: [
      { title: "Smart bus updates — CampusLife AI" },
      { name: "description", content: "Live campus bus statuses, routes and driver info." },
    ],
  }),
  component: BusPage,
});

const summary = [
  { label: "On Time", color: "bg-success", count: 2 },
  { label: "Delayed", color: "bg-warning", count: 1 },
  { label: "Cancelled", color: "bg-destructive", count: 1 },
  { label: "Route Changed", color: "bg-info", count: 1 },
];

function BusPage() {
  const [q, setQ] = useState("");
  const filtered = buses.filter((b) =>
    `${b.number} ${b.route} ${b.pickup} ${b.drop}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Smart bus updates"
        subtitle="Real-time status, routes, and driver contact — updated by campus transport."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="flex items-center gap-3 p-4">
              <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-xl font-bold">{s.count}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-5">
        <CardContent className="py-4">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 rounded-xl"
            placeholder="Search by bus number or route"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                  <Bus size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-semibold">{b.number}</h3>
                  </div>
                  <div className="mt-0.5 truncate text-sm text-muted-foreground">{b.route}</div>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusColor(b.status)}`}>
                  {b.status}
                </span>
              </div>

              <div className="mt-4 grid gap-2 rounded-xl bg-muted/40 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 text-primary" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Pickup</div>
                    <div className="truncate">{b.pickup}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 text-destructive" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Drop</div>
                    <div className="truncate">{b.drop}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User size={14} /> {b.driver}
                </div>
                <div className="font-medium">{b.eta}</div>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">{b.note}</p>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="rounded-lg">
                  <Phone size={14} /> {b.driverPhone}
                </Button>
                <Button size="sm" className="rounded-lg">Track live</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
