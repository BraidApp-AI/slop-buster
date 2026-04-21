"use client";

import { useMemo, useState } from "react";

export type DeletedLog = {
  projectName: string;
  envKeys: string[];
  rotationHints: {
    envKey: string;
    provider: string;
    url: string | null;
    known: boolean;
  }[];
};

export function RotationTitleBar() {
  return (
    <div className="flex-1 min-h-[72px] px-5 py-3 flex flex-col justify-center bg-[color:var(--ink)] text-[color:var(--paper)]">
      <div className="display text-lg leading-none font-bold">ROTATE NOW</div>
      <div className="label text-[color:var(--chrome)] mt-1 leading-none">
        keys from deleted projects
      </div>
    </div>
  );
}

export function RotationBody({ entries }: { entries: DeletedLog[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const allKeys = useMemo(() => {
    const out: { id: string; projectName: string; hint: DeletedLog["rotationHints"][number] }[] = [];
    entries.forEach((e, i) =>
      e.rotationHints.forEach((h, j) =>
        out.push({ id: `${i}:${j}:${h.envKey}`, projectName: e.projectName, hint: h }),
      ),
    );
    return out;
  }, [entries]);

  function toggle(id: string) {
    setChecked((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function markAllDone() {
    setChecked(new Set(allKeys.map((k) => k.id)));
  }

  function exportMarkdown() {
    const lines: string[] = ["# Key rotation checklist", ""];
    entries.forEach((e) => {
      lines.push(`## ${e.projectName}`);
      e.rotationHints.forEach((h) => {
        const tick = "- [ ]";
        const url = h.url ? ` — ${h.url}` : "";
        lines.push(`${tick} ${h.envKey} (${h.provider})${url}`);
      });
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slop-buster-rotation-checklist.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto scroll-mask">
        {entries.length === 0 ? (
          <div className="p-5 text-sm text-[color:var(--muted)]">
            Nothing here yet. After you delete a project, its API keys will
            appear here so you can rotate them in the original providers.
          </div>
        ) : (
          entries.map((e, i) => (
            <div
              key={i}
              className="px-5 py-4 border-b-[3px] border-[color:var(--ink)] fade-in"
            >
              <div className="label">deleted</div>
              <div className="display text-lg font-bold break-all">
                {e.projectName}
              </div>
              {e.rotationHints.length === 0 ? (
                <div className="text-xs text-[color:var(--muted)] mt-1">
                  No env vars. Nothing to rotate.
                </div>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {e.rotationHints.map((h, j) => {
                    const id = `${i}:${j}:${h.envKey}`;
                    const isChecked = checked.has(id);
                    return (
                      <li key={id} className="flex items-start gap-2">
                        <button
                          onClick={() => toggle(id)}
                          aria-pressed={isChecked}
                          className="mt-0.5 w-5 h-5 border-[3px] border-[color:var(--ink)] flex items-center justify-center shrink-0"
                          style={{
                            background: isChecked
                              ? "var(--ink)"
                              : "var(--paper)",
                          }}
                        >
                          {isChecked ? (
                            <span className="text-[color:var(--paper)] text-xs font-bold">
                              ×
                            </span>
                          ) : null}
                        </button>
                        <div
                          className={`flex-1 text-sm ${isChecked ? "line-through opacity-50" : ""}`}
                        >
                          <div className="font-bold break-all">{h.envKey}</div>
                          <div className="text-[11px] text-[color:var(--ink-soft)]">
                            {h.provider}
                            {h.url ? (
                              <>
                                {" — "}
                                <a
                                  href={h.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline underline-offset-2 decoration-2"
                                >
                                  rotate ↗
                                </a>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
      {entries.length > 0 ? (
        <div className="p-4 border-t-[3px] border-[color:var(--ink)] flex gap-2">
          <button onClick={markAllDone} className="ink-btn flex-1">
            mark all done
          </button>
          <button onClick={exportMarkdown} className="ink-btn flex-1">
            export .md
          </button>
        </div>
      ) : null}
    </>
  );
}
