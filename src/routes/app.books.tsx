import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Loader2, MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { AddBookDialog } from "@/components/AddBookDialog";
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
import { books as seedBooks } from "@/lib/mock-data";
import { booksQueryKey, fetchBooks } from "@/lib/campus-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/books")({
  head: () => ({
    meta: [
      { title: "Book exchange — CampusLife AI" },
      { name: "description", content: "Sell, exchange or donate books to fellow students." },
    ],
  }),
  component: BooksPage,
});

function BooksPage() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<string>("all");
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const { data: saved = [], isLoading, isError } = useQuery({
    queryKey: booksQueryKey,
    queryFn: fetchBooks,
  });

  const books = useMemo(() => [...saved, ...seedBooks], [saved]);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (mode !== "all" && b.mode !== mode) return false;
      if (q && !`${b.title} ${b.author} ${b.department}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [q, mode, books]);

  return (
    <>
      <PageHeader
        title="Book exchange"
        subtitle="Give textbooks a second life — sell, swap or donate."
        action={<AddBookDialog />}
      />


      <Card className="mb-5">
        <CardContent className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} className="h-10 rounded-xl pl-9" placeholder="Search by title, author or department" />
          </div>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="h-10 rounded-xl md:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All listings</SelectItem>
              <SelectItem value="Sell">For sale</SelectItem>
              <SelectItem value="Exchange">For exchange</SelectItem>
              <SelectItem value="Donate">Donation</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> Loading latest listings…
        </div>
      )}
      {isError && (
        <div className="mb-4 text-sm text-destructive">
          Couldn't load new listings. Showing available books.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {filtered.map((b) => (
          <Card key={b.id} className="group overflow-hidden pt-0 transition hover:-translate-y-0.5 hover:shadow-glow">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img src={b.cover} alt={b.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
              <button
                onClick={() => {
                  const next = new Set(favs);
                  next.has(b.id) ? next.delete(b.id) : next.add(b.id);
                  setFavs(next);
                }}
                className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-foreground shadow-soft hover:bg-white"
              >
                <Heart size={16} className={favs.has(b.id) ? "fill-destructive text-destructive" : ""} />
              </button>
              <Badge className="absolute left-2 top-2 rounded-full">{b.mode}{b.price ? ` • ${b.price}` : ""}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="line-clamp-1 font-semibold">{b.title}</h3>
              <div className="text-xs text-muted-foreground">by {b.author}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="rounded-full text-[10px]">{b.department}</Badge>
                <Badge variant="secondary" className="rounded-full text-[10px]">Sem {b.semester}</Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">{b.condition}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{b.description}</p>
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>Owner: {b.owner}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => toast.success(`Contact ${b.owner}: ${b.contact}`)}
                >
                  <MessageCircle size={14} /> Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
