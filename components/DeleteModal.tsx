"use client";

import { useEffect, useRef, useState } from "react";
import type { ClassifiedProject } from "@/lib/types";

export type DeleteOutcome = {
  ok: boolean;
  error?: string;
  rotationHints?: {
    envKey: string;
    provider: string;
    url: string | null;
    known: boolean;
  }[];
};

export function DeleteModal({
  item,
  onDone,
  onCancel,
}: {
  item: ClassifiedProject;
  onDone: (result: DeleteOutcome) => void;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
      if ((e.key === "Enter" || e.key === " ") && !busy) {
        e.preventDefault();
        doDelete();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, onCancel]);

  async function doDelete() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(
        `/api/vercel/projects/${encodeURIComponent(item.project.id)}`,
        { method: "DELETE" },
      );
      const j = (await res.json()) as DeleteOutcome;
      if (!j.ok) {
        setErr(j.error || "Delete failed.");
        setBusy(false);
        return;
      }
      onDone(j);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color:var(--ink)]/80">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-xl bg-[color:var(--paper)] border-[4px] border-[color:var(--ink)] fade-in"
      >
        <div className="px-5 py-3 border-b-[3px] border-[color:var(--ink)] bg-[color:var(--danger)] text-white flex items-center justify-between">
          <div className="display text-xl font-bold">DELETE FOREVER</div>
          <button
            onClick={onCancel}
            disabled={busy}
            className="label underline underline-offset-2 decoration-2"
          >
            [esc]
          </button>
        </div>
        <div className="p-6">
          <div className="label text-[color:var(--muted)]">target</div>
          <div className="display text-3xl font-bold mt-1">
            {item.project.name}
          </div>
          {item.productionUrl ? (
            <div className="text-sm text-[color:var(--ink-soft)] truncate">
              {item.productionUrl.replace(/^https?:\/\//, "")}
            </div>
          ) : null}

          <div className="mt-5 border-[3px] border-[color:var(--ink)] p-4 text-sm">
            <div className="label mb-2">this removes</div>
            <ul className="space-y-1">
              <li>✗ the vercel project</li>
              <li>✗ all deployments and preview urls</li>
              <li>
                ✗ {item.envVarCount} environment variable
                {item.envVarCount === 1 ? "" : "s"}
              </li>
              <li>✗ the production url above</li>
            </ul>
          </div>

          <div className="mt-5 label text-[color:var(--muted)]">
            ↵ enter to confirm · esc to cancel
          </div>

          {err ? (
            <div className="mt-4 border-[3px] border-[color:var(--danger)] bg-[color:var(--danger)] text-white p-3 label">
              {err}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3 justify-end">
            <button onClick={onCancel} className="ink-btn" disabled={busy}>
              cancel
            </button>
            <button
              ref={ref}
              onClick={doDelete}
              className="ink-btn danger-btn"
              disabled={busy}
            >
              {busy ? "deleting…" : "delete forever"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
