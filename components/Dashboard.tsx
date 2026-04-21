"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClassifiedProject, Thresholds } from "@/lib/types";
import { AppHeader, Stamp } from "./Stamp";
import { ProjectCard } from "./ProjectCard";
import { DeleteModal, type DeleteOutcome } from "./DeleteModal";
import {
  RotationBody,
  RotationTitleBar,
  type DeletedLog,
} from "./RotationSidebar";
import { SettingsDrawer } from "./SettingsDrawer";

type ScanResponse = {
  ok: boolean;
  error?: string;
  thresholds: Thresholds;
  projects: ClassifiedProject[];
};

type Filter = "slop" | "all" | "healthy" | "unknown";

const SIDEBAR_W = "380px";

export function Dashboard({
  thresholds: initialThresholds,
  accountSlug,
  onLogout,
}: {
  thresholds: Thresholds;
  accountSlug: string | null;
  onLogout: () => void;
}) {
  const [items, setItems] = useState<ClassifiedProject[] | null>(null);
  const [scanning, setScanning] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState<Thresholds>(initialThresholds);
  const [filter, setFilter] = useState<Filter>("slop");
  const [target, setTarget] = useState<ClassifiedProject | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<DeletedLog[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const rescan = useCallback(async () => {
    setScanning(true);
    setErr(null);
    try {
      const res = await fetch("/api/vercel/projects", { cache: "no-store" });
      const j = (await res.json()) as ScanResponse;
      if (!j.ok) {
        setErr(j.error || "Scan failed");
        setItems([]);
      } else {
        setItems(j.projects);
        setThresholds(j.thresholds);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
    } finally {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    rescan();
  }, [rescan]);

  const counts = useMemo(() => {
    const c = { slop: 0, healthy: 0, unknown: 0, all: 0 };
    (items ?? []).forEach((i) => {
      c.all++;
      c[i.verdict]++;
    });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === "all") return items;
    return items.filter((i) => i.verdict === filter);
  }, [items, filter]);

  async function logout() {
    await fetch("/api/vercel/validate", { method: "DELETE" });
    onLogout();
  }

  function confirmDelete(item: ClassifiedProject) {
    setTarget(item);
  }

  function onDeleteDone(result: DeleteOutcome) {
    if (!target) return;
    const victim = target;
    setTarget(null);
    if (!result.ok) {
      setErr(result.error ?? "Delete failed.");
      return;
    }
    setDeletingIds((s) => new Set(s).add(victim.project.id));
    setTimeout(() => {
      setItems((prev) => (prev ?? []).filter((x) => x.project.id !== victim.project.id));
      setDeletingIds((s) => {
        const next = new Set(s);
        next.delete(victim.project.id);
        return next;
      });
      setLog((l) => [
        {
          projectName: victim.project.name,
          envKeys: victim.envVarKeys,
          rotationHints: result.rotationHints ?? [],
        },
        ...l,
      ]);
    }, 350);
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppHeader
        subtitle={
          items === null
            ? "scanning…"
            : `${counts.slop} slop · ${counts.unknown} unknown · ${counts.healthy} healthy`
        }
        right={
          <>
            <button
              className="ink-btn"
              onClick={rescan}
              disabled={scanning}
              title="re-scan"
            >
              {scanning ? "scanning…" : "↻ rescan"}
            </button>
            <button className="ink-btn" onClick={() => setSettingsOpen(true)}>
              ⚙ rules
            </button>
            <button className="ink-btn" onClick={logout}>
              sign out
            </button>
          </>
        }
      />

      {/* Sub-header row: forced equal height via flex items-stretch */}
      <div className="flex items-stretch border-b-[3px] border-[color:var(--ink)]">
        <FilterBar
          filter={filter}
          counts={counts}
          onChange={setFilter}
          thresholds={thresholds}
        />
        <div
          className="hidden lg:block shrink-0 border-l-[3px] border-[color:var(--ink)]"
          style={{ width: SIDEBAR_W }}
        >
          <RotationTitleBar />
        </div>
      </div>

      {/* Content row */}
      <div className="flex flex-1 flex-col lg:flex-row">
        <section className="flex-1 flex flex-col">
          {err ? (
            <div className="m-6 border-[3px] border-[color:var(--danger)] bg-[color:var(--danger)] text-white p-4 label">
              {err}
            </div>
          ) : null}

          {items === null || scanning ? (
            <div className="p-10 label text-[color:var(--muted)]">
              auditing vercel projects…
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState filter={filter} counts={counts} />
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <ProjectCard
                  key={item.project.id}
                  item={item}
                  accountSlug={accountSlug}
                  onRequestDelete={() => confirmDelete(item)}
                  deleting={deletingIds.has(item.project.id)}
                />
              ))}
            </div>
          )}
        </section>
        <aside
          className="shrink-0 border-l-[3px] border-[color:var(--ink)] bg-[color:var(--subtle)] flex flex-col"
          style={{ width: SIDEBAR_W }}
        >
          <div className="lg:hidden">
            <RotationTitleBar />
          </div>
          <RotationBody entries={log} />
        </aside>
      </div>

      <FooterStrip counts={counts} />

      {target ? (
        <DeleteModal
          item={target}
          onCancel={() => setTarget(null)}
          onDone={onDeleteDone}
        />
      ) : null}

      <SettingsDrawer
        open={settingsOpen}
        initial={thresholds}
        onClose={() => setSettingsOpen(false)}
        onSaved={(t) => {
          setThresholds(t);
          rescan();
        }}
      />
    </main>
  );
}

function FilterBar({
  filter,
  counts,
  onChange,
  thresholds,
}: {
  filter: Filter;
  counts: { slop: number; healthy: number; unknown: number; all: number };
  onChange: (f: Filter) => void;
  thresholds: Thresholds;
}) {
  const tabs: { key: Filter; label: string; n: number; tone?: "danger" | "warn" | "ok" }[] = [
    { key: "slop", label: "slop", n: counts.slop, tone: "danger" },
    { key: "unknown", label: "unknown", n: counts.unknown, tone: "warn" },
    { key: "healthy", label: "healthy", n: counts.healthy, tone: "ok" },
    { key: "all", label: "all", n: counts.all },
  ];
  return (
    <div className="flex-1 flex items-center gap-1 px-4 py-3 flex-wrap min-w-0">
      <div className="flex items-center gap-1 mr-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`ink-btn ${filter === t.key ? "" : "opacity-60"}`}
            style={
              filter === t.key && t.tone === "danger"
                ? { background: "var(--danger)", color: "white" }
                : filter === t.key && t.tone === "warn"
                  ? { background: "var(--warn)", color: "var(--ink)" }
                  : filter === t.key && t.tone === "ok"
                    ? { background: "var(--ok)", color: "var(--paper)" }
                    : filter === t.key
                      ? { background: "var(--ink)", color: "var(--paper)" }
                      : undefined
            }
          >
            {t.label} · {t.n}
          </button>
        ))}
      </div>
      <div className="flex-1" />
      <div className="flex flex-wrap items-center gap-2">
        <Stamp>RULE</Stamp>
        <span className="label text-[color:var(--ink)]">
          stale &gt; {thresholds.staleDays}d · visitors ≤ {thresholds.monthlyVisitors}
        </span>
      </div>
    </div>
  );
}

function FooterStrip({
  counts,
}: {
  counts: { slop: number; healthy: number; unknown: number; all: number };
}) {
  return (
    <div className="border-t-[3px] border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)] py-2 px-4 flex justify-between items-center text-xs label flex-wrap gap-2">
      <div>slop-buster · localhost · click delete on a card, confirm, done.</div>
      <div className="flex gap-3">
        <span>SLOP {counts.slop}</span>
        <span>UNKNOWN {counts.unknown}</span>
        <span>HEALTHY {counts.healthy}</span>
      </div>
    </div>
  );
}

function EmptyState({
  filter,
  counts,
}: {
  filter: Filter;
  counts: { slop: number; healthy: number; unknown: number; all: number };
}) {
  if (counts.all === 0) {
    return (
      <div className="p-10 border-[3px] border-[color:var(--ink)] m-6 bg-[color:var(--subtle)]">
        <div className="display text-3xl font-bold">no projects found</div>
        <div className="label text-[color:var(--muted)] mt-2">
          either this account has no vercel projects, or the token lacks
          permission to see them.
        </div>
      </div>
    );
  }
  if (filter === "slop") {
    return (
      <div className="p-10 border-[3px] border-[color:var(--ink)] m-6 bg-[color:var(--subtle)]">
        <div className="display text-3xl font-bold">inbox zero.</div>
        <div className="text-sm mt-2">
          No slop matches the current rule. Try the <em>all</em> tab to browse
          everything.
        </div>
      </div>
    );
  }
  return (
    <div className="p-10 label text-[color:var(--muted)]">
      Nothing in <em>{filter}</em>.
    </div>
  );
}
