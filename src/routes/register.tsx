import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "./login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSession } from "@/lib/session";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — CampusLife AI" },
      { name: "description", content: "Join CampusLife AI to unify your student life." },
    ],
  }),
  component: Register,
});

function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email.");
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    setTimeout(() => {
      setSession({
        name,
        email,
        role: "student",
        regNo: regNo || "2024" + Math.floor(1000 + Math.random() * 8999),
        department: "Computer Science",
        semester: "1",
      });
      toast.success("Account created!");
      router.navigate({ to: "/role" });
    }, 700);
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join thousands of students on CampusLife AI.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-11 rounded-xl" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11 rounded-xl" required />
        </div>
        <div>
          <Label htmlFor="reg">Registration number</Label>
          <Input id="reg" value={regNo} onChange={(e) => setRegNo(e.target.value)} className="mt-1.5 h-11 rounded-xl" placeholder="e.g. 2024CS091" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11 rounded-xl" required />
        </div>
        <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-sm font-semibold">
          {loading ? <Loader2 className="animate-spin" size={16} /> : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already a member?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
