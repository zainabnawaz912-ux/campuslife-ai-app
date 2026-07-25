import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { books as seed, type Book } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/books")({
  head: () => ({
    meta: [
      { title: "Moderate books — CampusLife AI Admin" },
      { name: "description", content: "Review and remove book listings." },
    ],
  }),
  component: AdminBooks,
});

function AdminBooks() {
  const [list, setList] = useState<Book[]>(seed);
  return (
    <>
      <PageHeader title="Book listings" subtitle="Moderate the campus book exchange." />
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((b) => (
          <Card key={b.id}>
            <CardContent className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-3 p-3">
              <img src={b.cover} alt="" className="h-20 w-20 rounded-xl object-cover" />
              <div className="min-w-0">
                <div className="truncate font-semibold">{b.title}</div>
                <div className="truncate text-xs text-muted-foreground">by {b.author} • {b.owner}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="secondary" className="rounded-full text-[10px]">{b.mode}</Badge>
                  <Badge variant="outline" className="rounded-full text-[10px]">{b.condition}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setList(list.filter(x => x.id !== b.id)); toast.success("Removed"); }}>
                <Trash2 size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
