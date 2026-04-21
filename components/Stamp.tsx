import { Logo } from "./Logo";

export function Stamp({
  status,
  children,
}: {
  status?: "ok" | "warn" | "danger" | "idle";
  children: React.ReactNode;
}) {
  const cls =
    status === "danger"
      ? "chip chip-danger"
      : status === "warn"
        ? "chip chip-warn"
        : status === "ok"
          ? "chip chip-ok"
          : "chip";
  return <span className={cls}>{children}</span>;
}

export function AppHeader({
  right,
  subtitle,
}: {
  right?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <header className="flex items-stretch border-b-[3px] border-[color:var(--ink)]">
      <div className="flex-1 px-6 py-5 flex items-center gap-4">
        <Logo size={52} />
        <div>
          <div className="display text-3xl sm:text-4xl font-bold tracking-tight leading-none">
            SLOP-BUSTER
          </div>
          <div className="label text-[color:var(--muted)] mt-1">
            {subtitle ?? "sweep the vercel graveyard · v0.1"}
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          <Stamp status="warn">LOCAL ONLY</Stamp>
          <Stamp>NO TELEMETRY</Stamp>
          <Stamp>MIT</Stamp>
        </div>
      </div>
      {right ? (
        <div className="flex items-center justify-end gap-2 shrink-0 px-4 border-l-[3px] border-[color:var(--ink)] w-auto lg:w-[380px]">
          {right}
        </div>
      ) : null}
    </header>
  );
}
