import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
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
import { buses as seed, statusColor, type BusRoute } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bus")({
  head: () => ({
    meta: [
      { title: "Manage bus updates — CampusLife AI Admin" },
      { name: "description", content: "Update live bus statuses and driver notes." },
    ],
  }),
  component: AdminBus,
});

const statuses: BusRoute["status"][] = ["On Time", "Delayed", "Cancelled", "Route Changed"];

function AdminBus() {
  const [list, setList] = useState<BusRoute[]>(seed);

  const update = (id: string, patch: Partial<BusRoute>) => {
    setList((l) => l.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  return (
    <>
      <PageHeader title="Bus updates" subtitle="Change live status and notes; students see updates instantly." />

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((b) => (
          <Card key={b.id}>
            <CardContent className="p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold">{b.number}</div>
                  <div className="truncate text-xs text-muted-foreground">{b.route}</div>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusColor(b.status)}`}>
                  {b.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Status</Label>
                  <Select value={b.status} onValueChange={(v) => update(b.id, { status: v as BusRoute["status"] })}>
                    <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ETA</Label>
                  <Input value={b.eta} onChange={(e) => update(b.id, { eta: e.target.value })} className="mt-1.5 rounded-xl" />
                </div>
                <div className="md:col-span-2">
                  <Label>Driver note</Label>
                  <Textarea value={b.note} onChange={(e) => update(b.id, { note: e.target.value })} className="mt-1.5 min-h-[64px] rounded-xl" />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button className="rounded-xl" onClick={() => toast.success(`${b.number} updated`)}>
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
