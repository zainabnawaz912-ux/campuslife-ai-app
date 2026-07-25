import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, LogOut, Moon, Notebook, Settings, ShieldCheck, Sun } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { clearSession, getSession, setSession, type Session } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — CampusLife AI" },
      { name: "description", content: "Manage your student profile, saved items and preferences." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const router = useRouter();
  const [session, setLocal] = useState<Session | null>(null);
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    setLocal(
      getSession() ?? {
        name: "Guest Student",
        email: "guest@campus.edu",
        role: "student",
        regNo: "2024CS091",
        department: "Computer Science",
        semester: "5",
      },
    );
    setDark(localStorage.getItem("campuslife.theme") === "dark");
  }, []);

  const save = () => {
    if (!session) return;
    setSession(session);
    toast.success("Profile updated");
  };

  const toggleDark = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("campuslife.theme", v ? "dark" : "light");
  };

  if (!session) return null;

  return (
    <>
      <PageHeader title="Your profile" subtitle="Personal info, saved items and preferences." />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-primary text-3xl font-bold text-primary-foreground shadow-glow">
              {session.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="mt-4 text-lg font-bold">{session.name}</div>
            <div className="text-sm text-muted-foreground">{session.email}</div>
            <div className="mt-3 grid w-full grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl bg-muted p-2">
                <div className="text-muted-foreground">Reg. No.</div>
                <div className="mt-0.5 truncate font-semibold">{session.regNo}</div>
              </div>
              <div className="rounded-xl bg-muted p-2">
                <div className="text-muted-foreground">Dept</div>
                <div className="mt-0.5 truncate font-semibold">{session.department}</div>
              </div>
              <div className="rounded-xl bg-muted p-2">
                <div className="text-muted-foreground">Sem</div>
                <div className="mt-0.5 font-semibold">{session.semester}</div>
              </div>
            </div>
            <Button
              variant="destructive"
              className="mt-6 w-full rounded-xl"
              onClick={() => {
                clearSession();
                router.navigate({ to: "/login" });
              }}
            >
              <LogOut size={16} /> Sign out
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" value={session.name} onChange={(v) => setLocal({ ...session, name: v })} />
              <Field label="Email" value={session.email} onChange={(v) => setLocal({ ...session, email: v })} />
              <Field label="Registration number" value={session.regNo ?? ""} onChange={(v) => setLocal({ ...session, regNo: v })} />
              <Field label="Department" value={session.department ?? ""} onChange={(v) => setLocal({ ...session, department: v })} />
              <Field label="Semester" value={session.semester ?? ""} onChange={(v) => setLocal({ ...session, semester: v })} />
              <div className="flex items-end">
                <Button className="w-full rounded-xl" onClick={save}>Save changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings size={16} /> Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <Row
                icon={dark ? <Moon size={16} /> : <Sun size={16} />}
                title="Dark mode"
                desc="Use a darker interface, easier on your eyes at night."
                control={<Switch checked={dark} onCheckedChange={toggleDark} />}
              />
              <Row
                icon={<ShieldCheck size={16} />}
                title="Notifications"
                desc="Announcements, bus alerts and replies to your listings."
                control={<Switch checked={notif} onCheckedChange={setNotif} />}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Notebook size={16} /> Saved notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">You haven't saved any notes yet.</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><BookOpen size={16} /> Saved books</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Tap the heart on any book to save it here.</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function Row({ icon, title, desc, control }: { icon: React.ReactNode; title: string; desc: string; control: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {control}
    </div>
  );
}
