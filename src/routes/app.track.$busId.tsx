import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bus,
  Clock,
  Info,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buses, statusColor, type BusRoute } from "@/lib/mock-data";

export const Route = createFileRoute("/app/track/$busId")({
  head: () => ({
    meta: [
      { title: "Live bus tracking — CampusLife AI" },
      {
        name: "description",
        content: "Track a campus bus route, stops, next stop and estimated arrival time.",
      },
      { property: "og:title", content: "Live bus tracking — CampusLife AI" },
      {
        property: "og:description",
        content: "Route timeline, next stop and ETA for your campus bus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackBusPage,
  errorComponent: () => <TrackFallback message="Something went wrong while loading this bus." />,
  notFoundComponent: () => <TrackFallback message="We couldn't find that bus." />,
});

function TrackFallback({ message }: { message: string }) {
  return (
    <Card className="mx-auto mt-6 max-w-md">
      <CardContent className="p-6 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link to="/app/bus">Back to bus updates</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function TrackBusPage() {
  const { busId } = Route.useParams();
  const router = useRouter();
  const bus = buses.find((b) => b.id === busId);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, [busId]);

  if (!bus) return <TrackFallback message="We couldn't find that bus." />;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-4 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          aria-label="Back to bus updates"
          onClick={() => router.history.back()}
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-2xl">Tracking {bus.number}</h1>
          <p className="truncate text-sm text-muted-foreground">{bus.route}</p>
        </div>
      </div>

      {loading ? <TrackSkeleton /> : <TrackContent bus={bus} refreshedAt={refreshedAt} onRefresh={() => {
        setLoading(true);
        setTimeout(() => {
          setRefreshedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          setLoading(false);
        }, 450);
      }} />}
    </div>
  );
}

function TrackSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="h-28 animate-pulse rounded-2xl bg-muted/60" />
      <div className="h-20 animate-pulse rounded-2xl bg-muted/50" />
      <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />
    </div>
  );
}

function TrackContent({
  bus,
  refreshedAt,
  onRefresh,
}: {
  bus: BusRoute;
  refreshedAt: string | null;
  onRefresh: () => void;
}) {
  const total = bus.stops.length;
  const passed = bus.stops.filter((s) => s.passed).length;
  const nextStop = bus.stops.find((s) => !s.passed);
  const progress = total > 1 ? Math.round((passed / total) * 100) : 0;

  return (
    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Bus size={22} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold">{bus.number}</div>
              <div className="truncate text-sm text-muted-foreground">{bus.route}</div>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusColor(bus.status)}`}
            >
              {bus.status}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={13} /> Estimated arrival
              </div>
              <div className="mt-1 text-base font-semibold">{bus.eta}</div>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Navigation size={13} /> Next stop
              </div>
              <div className="mt-1 truncate text-base font-semibold">
                {nextStop ? `${nextStop.name} · ${nextStop.time}` : "Trip completed"}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Route progress</span>
              <span>
                {passed}/{total} stops
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-primary transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Last updated: {refreshedAt ?? bus.lastUpdated}</span>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={onRefresh}>
              <RefreshCw size={13} /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-info/30 bg-info/10">
        <CardContent className="flex items-start gap-2 p-4 text-xs text-muted-foreground">
          <Info size={14} className="mt-0.5 shrink-0 text-info" />
          <p>
            <span className="font-semibold text-foreground">Demo Tracking Mode</span> – Bus
            information is based on the current schedule and stored data.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold">Route timeline</h2>
          <ol className="mt-4 space-y-0">
            {bus.stops.map((stop, i) => {
              const isNext = nextStop?.name === stop.name;
              const last = i === bus.stops.length - 1;
              return (
                <li key={stop.name} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1 grid h-4 w-4 place-items-center rounded-full border-2 transition-colors ${
                        stop.passed
                          ? "border-primary bg-primary"
                          : isNext
                            ? "animate-pulse border-primary bg-background"
                            : "border-muted-foreground/30 bg-background"
                      }`}
                    />
                    {!last && (
                      <span
                        className={`w-0.5 flex-1 ${stop.passed ? "bg-primary/60" : "bg-muted"}`}
                      />
                    )}
                  </div>
                  <div className={`pb-6 ${last ? "pb-0" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`truncate text-sm ${stop.passed || isNext ? "font-semibold" : "text-muted-foreground"}`}
                      >
                        {stop.name}
                      </span>
                      {isNext && (
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Next
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{stop.time}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold">Route & driver</h2>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 text-primary" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Pickup</div>
                <div className="truncate">{bus.pickup}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 text-destructive" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Drop</div>
                <div className="truncate">{bus.drop}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User size={14} /> {bus.driver}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{bus.note}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <a href={`tel:${bus.driverPhone.replace(/\s/g, "")}`}>
                <Phone size={14} /> {bus.driverPhone}
              </a>
            </Button>
            <Button size="sm" className="rounded-lg" asChild>
              <Link to="/app/bus">Back to bus updates</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
