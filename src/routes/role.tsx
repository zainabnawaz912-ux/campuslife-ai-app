import { createFileRoute, useRouter } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { AppWordmark } from "@/components/AppLogo";
import { getSession, setSession, type Session } from "@/lib/session";

export const Route = createFileRoute("/role")({
  head: () => ({
    meta: [
      { title: "Choose your role — CampusLife AI" },
      { name: "description", content: "Continue as a student or as campus administration." },
    ],
  }),
  component: RolePicker,
});

function RolePicker() {
  const router = useRouter();
  const [session, setLocal] = useState<Session | null>(null);

  useEffect(() => {
    const s = getSession() ?? {
      name: "Guest Student",
      email: "guest@campus.edu",
      role: "student" as const,
    };
    setLocal(s);
  }, []);

  const choose = (role: "student" | "admin") => {
    const s: Session = {
      ...(session ?? { name: "Guest", email: "guest@campus.edu", role: "student" }),
      role,
    };
    setSession(s);
    router.navigate({ to: role === "admin" ? "/admin" : "/app" });
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col">
        <AppWordmark />
        <div className="mt-10">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">How will you use CampusLife?</h1>
          <p className="mt-2 text-muted-foreground">
            You can switch roles later from the sidebar.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <RoleCard
            icon={<GraduationCap size={26} />}
            title="I'm a Student"
            desc="Access notes, book exchange, lost & found, bus updates and the AI assistant."
            highlight
            onClick={() => choose("student")}
          />
          <RoleCard
            icon={<ShieldCheck size={26} />}
            title="I'm an Admin"
            desc="Post announcements, update bus status, moderate listings and view reports."
            onClick={() => choose("admin")}
          />
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  desc,
  onClick,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "group relative overflow-hidden rounded-2xl border p-6 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow " +
        (highlight
          ? "border-primary/40 bg-gradient-to-br from-primary/10 via-background to-background"
          : "border-border bg-card")
      }
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
        {icon}
      </div>
      <div className="mt-4 text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5 text-sm font-medium text-primary">Continue →</div>
    </button>
  );
}
