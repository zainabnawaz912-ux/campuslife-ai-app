import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { ReportItemDialog } from "@/components/ReportItemDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lostItems as seedItems } from "@/lib/mock-data";
import { fetchLostItems, lostItemsQueryKey } from "@/lib/campus-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/lost-found")({
  head: () => ({
    meta: [
      { title: "Lost & Found — CampusLife AI" },
      { name: "description", content: "Report items you've lost or found on campus." },
    ],
  }),
  component: LostFound,
});

function LostFound() {
  const [tab, setTab] = useState<string>("all");
  const [q, setQ] = useState("");

  const { data: saved = [], isLoading, isError } = useQuery({
    queryKey: lostItemsQueryKey,
    queryFn: fetchLostItems,
  });

  const items = useMemo(() => [...saved, ...seedItems], [saved]);

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        if (tab !== "all" && i.type.toLowerCase() !== tab) return false;
        if (q && !`${i.title} ${i.location} ${i.description}`.toLowerCase().includes(q.toLowerCase()))
          return false;
        return true;
      }),
    [tab, q, items],
  );

  return (
    <>
      <PageHeader
        title="Lost & Found"
        subtitle="Reunite belongings with their owners across campus."
        action={
          <div className="flex gap-2">
            <ReportItemDialog type="Lost" />
            <ReportItemDialog type="Found" />
          </div>
        }
      />

      <Card className="mb-5">
        <CardContent className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} className="h-10 rounded-xl pl-9" placeholder="Search item or location" />
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="rounded-xl">
              <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
              <TabsTrigger value="lost" className="rounded-lg">Lost</TabsTrigger>
              <TabsTrigger value="found" className="rounded-lg">Found</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> Loading latest reports…
        </div>
      )}
      {isError && (
        <div className="mb-4 text-sm text-destructive">
          Couldn't load new reports. Showing available items.
        </div>
      )}


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i) => (
          <Card key={i.id} className="overflow-hidden pt-0">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img src={i.image} alt={i.title} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  className={
                    "rounded-full " +
                    (i.type === "Lost"
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/10"
                      : "bg-success/15 text-success hover:bg-success/15")
                  }
                  variant="secondary"
                >
                  {i.type}
                </Badge>
                <Badge variant={i.status === "Resolved" ? "secondary" : "outline"} className="rounded-full text-[10px]">
                  {i.status}
                </Badge>
              </div>
              <h3 className="mt-2 line-clamp-1 font-semibold">{i.title}</h3>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={12} /> {i.location} • {i.date}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{i.description}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full rounded-lg"
                disabled={i.status === "Resolved"}
                onClick={() => toast.success(`Contact: ${i.contact}`)}
              >
                {i.status === "Resolved" ? "Resolved" : "Contact owner"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
