import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { notes as seed, type Note } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notes")({
  head: () => ({
    meta: [
      { title: "Moderate notes — CampusLife AI Admin" },
      { name: "description", content: "Approve or remove student-uploaded notes." },
    ],
  }),
  component: AdminNotes,
});

function AdminNotes() {
  const [list, setList] = useState<Note[]>(seed);
  return (
    <>
      <PageHeader title="Notes moderation" subtitle="Approve or remove student-uploaded material." />
      <Card>
        <CardContent className="divide-y p-0">
          {list.map((n) => (
            <div key={n.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
              <div className="min-w-0">
                <div className="truncate font-semibold">{n.title}</div>
                <div className="text-xs text-muted-foreground">
                  {n.department} • Sem {n.semester} • by {n.uploader}
                </div>
                <div className="mt-1 flex gap-1.5">
                  <Badge variant="secondary" className="rounded-full text-[10px]">{n.subject}</Badge>
                  <Badge variant="outline" className="rounded-full text-[10px]">{n.size}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success("Approved")}>
                  <CheckCircle2 size={14} /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => { setList(list.filter((x) => x.id !== n.id)); toast.success("Removed"); }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
