import { GraduationCap } from "lucide-react";

export function AppLogo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow"
      style={{ width: size, height: size }}
    >
      <GraduationCap size={size * 0.58} strokeWidth={2.2} />
    </div>
  );
}

export function AppWordmark({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <AppLogo size={size} />
      <div className="leading-tight">
        <div className="text-base font-bold tracking-tight">
          CampusLife <span className="text-primary">AI</span>
        </div>
        <div className="text-[11px] text-muted-foreground">One smart app for every student.</div>
      </div>
    </div>
  );
}
