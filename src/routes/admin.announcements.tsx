import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { announcements as seed, type Announcement } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/announcements")({
  head: () => ({
    meta: [
      { title: "Manage announcements — CampusLife AI Admin" },
      { name: "description", content: "Post and manage official campus announcements." },
    ],
  }),
  component: AdminAnnouncements,
});

const cats: Announcement["category"][] = [
  "Notice", "Event", "Scholarship", "Seminar", "Workshop", "Exam", "Holiday", "Emergency", "Circular",
];

function AdminAnnouncements() {
  const [list, setList] = useState<Announcement[]>(seed);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cat, setCat] = useState<Announcement["category"]>("Notice");

  const publish = () => {
    if (!title.trim() || !body.trim()) return toast.error("Please fill in title and body.");
    setList([{ id: crypto.randomUUID(), title, body, category: cat, date: "Just now", pinned: false }, ...list]);
    setTitle(""); setBody("");
    toast.success("Announcement published");
  };

  return (
    <>
      <PageHeader title="Announcements" subtitle="Create and manage announcements for all students." />

      <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="text-sm font-semibold">New announcement</div>
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 rounded-xl" placeholder="e.g. Exam schedule update" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={cat} onValueChange={(v) => setCat(v as Announcement["category"])}>
                <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Body</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="mt-1.5 min-h-[120px] rounded-xl" placeholder="Write the notice…" />
            </div>
            <Button className="w-full rounded-xl" onClick={publish}><Plus size={16} /> Publish</Button>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {list.map((a) => (
            <Card key={a.id}>
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full text-[10px]">{a.category}</Badge>
                    <span className="text-xs text-muted-foreground">{a.date}</span>
                  </div>
                  <div className="mt-1.5 font-semibold">{a.title}</div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => { setList(list.filter((x) => x.id !== a.id)); toast.success("Deleted"); }}
                >
                  <Trash2 size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
