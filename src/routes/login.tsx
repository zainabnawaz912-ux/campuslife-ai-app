import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AppWordmark } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { setSession } from "@/lib/session";
import { toast } from "sonner";
import { Mail, Lock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — CampusLife AI" },
      { name: "description", content: "Sign in to your CampusLife AI account." },
    ],
  }),
  component: Login,
});

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("student@campus.edu");
  const [password, setPassword] = useState("demo1234");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSession({
        name: email.split("@")[0].replace(/[.\-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        role: "student",
        regNo: "2024" + Math.floor(1000 + Math.random() * 8999),
        department: "Computer Science",
        semester: "5",
      });
      toast.success("Welcome back!");
      router.navigate({ to: "/role" });
    }, 700);
    void remember;
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your campus.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1.5">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl pl-9"
              required
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot" className="text-xs font-medium text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl pl-9"
              required
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
          Remember me for 30 days
        </label>
        <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-sm font-semibold">
          {loading ? <Loader2 className="animate-spin" size={16} /> : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New to CampusLife?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_15%_20%,white,transparent_40%),radial-gradient(circle_at_80%_75%,white,transparent_35%)]" />
        <div className="relative">
          <AppWordmark />
        </div>
        <div className="relative">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight">
            Everything your campus life needs, in one intelligent app.
          </h2>
          <p className="mt-4 max-w-md text-base opacity-90">
            Notes, book exchange, lost & found, bus updates, announcements and an AI assistant that
            actually understands your college.
          </p>
          <ul className="mt-6 grid max-w-md gap-2 text-sm opacity-95">
            <li>• Smart notes library across departments and semesters</li>
            <li>• Real-time bus status and route changes</li>
            <li>• AI assistant for coursework and campus questions</li>
          </ul>
        </div>
        <p className="relative text-xs opacity-70">© {new Date().getFullYear()} CampusLife AI</p>
      </div>
      <div className="flex items-center justify-center bg-background px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <AppWordmark />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
