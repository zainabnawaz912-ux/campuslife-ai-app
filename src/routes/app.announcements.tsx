import { createFileRoute } from "@tanstack/react-router";
import { Pin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { announcements, type Announcement } from "@/lib/mock-data";

export const Route = createFileRoute("/app/announcements")({
  head: () => ({
    meta: [
      { title: "Campus announcements — CampusLife AI" },
      { name: "description", content: "Official notices, events, scholarships and alerts." },
    ],
  }),
  component: AnnouncementsPage,
});

const cats: Array<Announcement["category"] | "All"> = [
  "All",
  "Notice",
  "Event",
  "Exam",
  "Scholarship",
  "Workshop",
  "Seminar",
  "Holiday",
  "Emergency",
  "Circular",
];

const catColor: Record<string, string> = {
  Exam: "bg-primary/15 text-primary",
  Event: "bg-info/15 text-info",
  Scholarship: "bg-success/15 text-success",
  Workshop: "bg-fuchsia-500/15 text-fuchsia-600",
  Seminar: "bg-indigo-500/15 text-indigo-600",
  Holiday: "bg-amber-500/15 text-amber-700",
  Emergency: "bg-destructive/15 text-destructive",
  Notice: "bg-muted text-foreground",
  Circular: "bg-secondary text-secondary-foreground",
};

function AnnouncementsPage() {
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      announcements.filter((a) => {
        if (cat !== "All" && a.category !== cat) return false;
        if (q && !`${a.title} ${a.body}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [cat, q],
  );

  return (
    <>
      <PageHeader title="Campus announcements" subtitle="Everything the campus wants you to know." />

      <Card className="mb-5">
        <CardContent className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} className="h-10 rounded-xl pl-9" placeholder="Search announcements" />
          </div>
          <Tabs value={cat} onValueChange={setCat} className="overflow-x-auto">
            <TabsList className="rounded-xl">
              {cats.map((c) => (
                <TabsTrigger key={c} value={c} className="rounded-lg text-xs">
                  {c}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filtered.map((a) => (
          <Card key={a.id} className="overflow-hidden">
            <CardContent className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 p-5">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${catColor[a.category] ?? "bg-muted"} font-semibold`}>
                {a.category.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full text-[10px]">{a.category}</Badge>
                  {a.pinned && (
                    <Badge className="rounded-full text-[10px]"><Pin size={10} /> Pinned</Badge>
                  )}
                </div>
                <h3 className="mt-1.5 font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              </div>
              <div className="shrink-0 text-xs text-muted-foreground">{a.date}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
