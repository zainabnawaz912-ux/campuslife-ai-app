import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, Filter, Search, Star, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { departments, notes, semesters } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/notes")({
  head: () => ({
    meta: [
      { title: "Notes library — CampusLife AI" },
      { name: "description", content: "Share, browse, and download notes across departments." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) ?? "" }),
  component: NotesPage,
});

function NotesPage() {
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ);
  const [dept, setDept] = useState<string>("all");
  const [sem, setSem] = useState<string>("all");
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      if (dept !== "all" && n.department !== dept) return false;
      if (sem !== "all" && n.semester !== sem) return false;
      if (q && !`${n.title} ${n.subject} ${n.uploader}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [q, dept, sem]);

  const toggleFav = (id: string) => {
    const next = new Set(favs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavs(next);
  };

  return (
    <>
      <PageHeader
        title="AI Learning Hub"
        subtitle="Shared notes, AI-powered study tools and your personal study coach."

        action={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Upload size={16} /> Upload notes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload your notes</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Notes uploaded! They'll appear after moderation.");
                  (e.target as HTMLFormElement).reset();
                }}
                className="space-y-3"
              >
                <div>
                  <Label>Title</Label>
                  <Input required className="mt-1.5 rounded-xl" placeholder="e.g. DBMS Unit 2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Department</Label>
                    <Select defaultValue={departments[0]}>
                      <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Semester</Label>
                    <Select defaultValue="1">
                      <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {semesters.map((s) => <SelectItem key={s} value={s}>Sem {s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>File</Label>
                  <Input type="file" required className="mt-1.5 rounded-xl" />
                </div>
                <Button className="w-full rounded-xl">Upload</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="mb-5 grid w-full grid-cols-3 rounded-xl sm:w-auto sm:inline-grid">
          <TabsTrigger value="library" className="rounded-lg text-xs sm:text-sm">Notes library</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg text-xs sm:text-sm">AI Notes</TabsTrigger>
          <TabsTrigger value="coach" className="rounded-lg text-xs sm:text-sm">AI Study Coach</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="animate-in fade-in-50">
      <Card className="mb-5">

        <CardContent className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} className="h-10 rounded-xl pl-9" placeholder="Search by title, subject or uploader" />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="h-10 rounded-xl md:w-48"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sem} onValueChange={setSem}>
            <SelectTrigger className="h-10 rounded-xl md:w-36"><SelectValue placeholder="Semester" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All semesters</SelectItem>
              {semesters.map((s) => <SelectItem key={s} value={s}>Sem {s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-10 rounded-xl" onClick={() => { setQ(""); setDept("all"); setSem("all"); }}>
            <Filter size={14} /> Reset
          </Button>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No notes match your filters" hint="Try clearing filters or search a different subject." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((n) => (
            <Card key={n.id} className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-glow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary" className="rounded-full text-[10px]">{n.subject}</Badge>
                    <h3 className="mt-2 line-clamp-2 text-base font-semibold">{n.title}</h3>
                  </div>
                  <button onClick={() => toggleFav(n.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
                    <Star size={16} className={favs.has(n.id) ? "fill-warning text-warning" : ""} />
                  </button>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {n.department} • Sem {n.semester} • {n.size}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">By {n.uploader} • {n.updatedAt}</div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs font-medium text-primary">{n.downloads} downloads</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="rounded-lg"><Eye size={14} /> Preview</Button>
                    <Button size="sm" className="rounded-lg" onClick={() => toast.success("Download started")}>
                      <Download size={14} /> Get
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </TabsContent>

        <TabsContent value="ai" className="animate-in fade-in-50">
          <AiNotesTab />
        </TabsContent>

        <TabsContent value="coach" className="animate-in fade-in-50">
          <StudyCoachTab />
        </TabsContent>
      </Tabs>
    </>
  );
}


function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
        <Search size={20} />
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
