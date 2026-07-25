import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "./login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot")({
  head: () => ({
    meta: [
      { title: "Reset password — CampusLife AI" },
      { name: "description", content: "Reset your CampusLife AI password." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  return (
    <AuthLayout title="Forgot password?" subtitle="We'll email you a secure reset link.">
      {sent ? (
        <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
          A reset link has been sent to <strong>{email}</strong>. Please check your inbox.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email.");
            setSent(true);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11 rounded-xl" required />
          </div>
          <Button type="submit" className="h-11 w-full rounded-xl">Send reset link</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
