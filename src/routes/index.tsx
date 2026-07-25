import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLogo } from "@/components/AppLogo";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  component: Splash,
});

function Splash() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const s = getSession();
      if (s) {
        router.navigate({ to: s.role === "admin" ? "/admin" : "/app" });
      } else {
        setReady(true);
      }
    }, 1400);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero px-6 text-primary-foreground">
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_70%,white,transparent_35%)]" />
      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        <div className="animate-[fadeUp_0.6s_ease-out]">
          <AppLogo size={88} />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
          CampusLife <span className="opacity-80">AI</span>
        </h1>
        <p className="mt-3 text-base opacity-90">One smart app for every student.</p>

        {!ready ? (
          <div className="mt-10 flex items-center gap-2 text-sm opacity-90">
            <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:0.2s]" />
          </div>
        ) : (
          <div className="mt-10 flex w-full flex-col gap-3">
            <Link
              to="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-primary shadow-glow transition hover:opacity-95"
            >
              Get started
            </Link>
            <Link
              to="/register"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/40 px-5 text-sm font-semibold text-white/95 hover:bg-white/10"
            >
              Create an account
            </Link>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
