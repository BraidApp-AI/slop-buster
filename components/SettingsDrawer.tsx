"use client";

import { useEffect, useRef, useState } from "react";
import type { Thresholds } from "@/lib/types";

export function SettingsDrawer({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Thresholds;
  onClose: () => void;
  onSaved: (t: Thresholds) => void;
}) {
  const [staleDays, setStaleDays] = useState(initial.staleDays);
  const [monthlyVisitors, setMonthlyVisitors] = useState(initial.monthlyVisitors);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStaleDays(initial.staleDays);
      setMonthlyVisitors(initial.monthlyVisitors);
      setTimeout(() => ref.current?.focus(), 10);
    }
  }, [open, initial]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thresholds: { staleDays, monthlyVisitors },
        }),
      });
      const j = await res.json();
      if (j.ok) onSaved(j.config.thresholds);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-[color:var(--ink)]/70 flex">
      <div className="ml-auto w-full max-w-md bg-[color:var(--paper)] border-l-[4px] border-[color:var(--ink)] flex flex-col">
        <div className="px-5 py-4 border-b-[3px] border-[color:var(--ink)] flex items-center justify-between">
          <div>
            <div className="display text-2xl font-bold">THRESHOLDS</div>
            <div className="label text-[color:var(--muted)]">
              what counts as slop
            </div>
          </div>
          <button onClick={onClose} className="ink-btn">
            close [esc]
          </button>
        </div>
        <div className="p-6 space-y-6 flex-1">
          <div>
            <label className="label block mb-2">
              stale after <span className="text-[color:var(--muted)]">(days since last commit)</span>
            </label>
            <input
              ref={ref}
              type="text"
              inputMode="numeric"
              value={staleDays}
              onChange={(e) => setStaleDays(parseInt(e.target.value || "0", 10) || 0)}
              className="w-full"
            />
            <div className="label text-[color:var(--muted)] mt-1">default 30 · min 1 · max 3650</div>
          </div>
          <div>
            <label className="label block mb-2">
              traffic ceiling <span className="text-[color:var(--muted)]">(monthly visitors)</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyVisitors}
              onChange={(e) =>
                setMonthlyVisitors(parseInt(e.target.value || "0", 10) || 0)
              }
              className="w-full"
            />
            <div className="label text-[color:var(--muted)] mt-1">
              default 10 · projects at or below this count = quiet
            </div>
          </div>
          <div className="border-[3px] border-[color:var(--ink)] p-4 text-sm bg-[color:var(--subtle)]">
            <div className="label mb-1">current rule</div>
            A project is <span className="font-bold">SLOP</span> when it has
            had <span className="font-bold">no commit for {staleDays}+ days</span>{" "}
            AND{" "}
            <span className="font-bold">
              ≤ {monthlyVisitors} visitor{monthlyVisitors === 1 ? "" : "s"} / 30d
            </span>
            .
          </div>
        </div>
        <div className="p-5 border-t-[3px] border-[color:var(--ink)] flex gap-2">
          <button className="ink-btn flex-1" onClick={onClose} disabled={busy}>
            cancel
          </button>
          <button
            className="ink-btn flex-1"
            style={{ background: "var(--warn)" }}
            onClick={save}
            disabled={busy}
          >
            {busy ? "saving…" : "save + rescan"}
          </button>
        </div>
      </div>
    </div>
  );
}
