import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { lostItems as seed, type LostItem } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/lost-found")({
  head: () => ({
    meta: [
      { title: "Lost & Found admin — CampusLife AI" },
      { name: "description", content: "Resolve or remove lost & found reports." },
    ],
  }),
  component: AdminLostFound,
});

function AdminLostFound() {
  const [list, setList] = useState<LostItem[]>(seed);
  const resolve = (id: string) => {
    setList((l) => l.map((i) => (i.id === id ? { ...i, status: "Resolved" } : i)));
    toast.success("Marked as resolved");
  };
  return (
    <>
      <PageHeader title="Lost & Found" subtitle="Help students recover their belongings." />
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((i) => (
          <Card key={i.id}>
            <CardContent className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-3 p-3">
              <img src={i.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
              <div className="min-w-0">
                <div className="truncate font-semibold">{i.title}</div>
                <div className="truncate text-xs text-muted-foreground">{i.location} • {i.date}</div>
                <div className="mt-1 flex gap-1">
                  <Badge className={"rounded-full " + (i.type === "Lost" ? "bg-destructive/10 text-destructive" : "bg-success/15 text-success")} variant="secondary">{i.type}</Badge>
                  <Badge variant="outline" className="rounded-full text-[10px]">{i.status}</Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" className="rounded-lg" disabled={i.status === "Resolved"} onClick={() => resolve(i.id)}>
                Resolve
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
