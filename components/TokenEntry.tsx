"use client";

import { useRef, useState, useEffect } from "react";
import { AppHeader, Stamp } from "./Stamp";
import type { VercelTeam } from "@/lib/types";

type Step = "paste" | "verifying" | "pickTeam";

export function TokenEntry({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [step, setStep] = useState<Step>("paste");
  const [token, setToken] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [teams, setTeams] = useState<VercelTeam[]>([]);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!token.trim()) return;
    setErr(null);
    setStep("verifying");
    try {
      const res = await fetch("/api/vercel/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const j = await res.json();
      if (!j.ok) {
        setErr(j.error || "Invalid token.");
        setStep("paste");
        return;
      }
      setUser(j.user);
      if (j.teams && j.teams.length > 0) {
        setTeams(j.teams);
        setStep("pickTeam");
      } else {
        onAuthenticated();
      }
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Network error");
      setStep("paste");
    }
  }

  async function pickTeam(teamId: string | null) {
    await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    onAuthenticated();
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppHeader subtitle="one-time setup · no account · no cloud" />

      <section className="flex-1 flex items-stretch">
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-16 py-14 border-r-[3px] border-[color:var(--ink)]">
          <div className="max-w-2xl">
            <div className="label text-[color:var(--muted)]">step 01 / auth</div>
            <h1 className="display text-5xl sm:text-6xl font-bold leading-[0.95] mt-3">
              Paste your
              <br />
              Vercel token.
            </h1>
            <p className="mt-5 text-sm text-[color:var(--ink-soft)] max-w-md">
              Stored only in{" "}
              <code className="bg-[color:var(--subtle)] px-1 border border-[color:var(--ink)]">
                ~/.slop-buster/config.json
              </code>{" "}
              with <code>0600</code> permissions. Nothing leaves localhost
              except requests to{" "}
              <code className="bg-[color:var(--subtle)] px-1 border border-[color:var(--ink)]">
                api.vercel.com
              </code>
              .
            </p>

            {step === "pickTeam" ? (
              <TeamPicker
                teams={teams}
                user={user}
                onPick={pickTeam}
              />
            ) : (
              <form onSubmit={submit} className="mt-10">
                <label className="label block mb-2">
                  vercel api token
                </label>
                <textarea
                  ref={inputRef}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
                  }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  rows={3}
                  placeholder="vercel_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full text-base font-mono tracking-wide"
                  disabled={step === "verifying"}
                />
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    type="submit"
                    className="ink-btn"
                    disabled={step === "verifying" || !token.trim()}
                  >
                    {step === "verifying" ? "verifying…" : "→ unlock"}
                  </button>
                  <a
                    className="ink-btn"
                    style={{ background: "var(--warn)" }}
                    href="https://vercel.com/account/tokens?name=slop-buster&scope=full"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ↗ get one from vercel
                  </a>
                  <span className="label text-[color:var(--muted)]">
                    ⌘/ctrl + enter to submit
                  </span>
                </div>

                {err ? (
                  <div className="mt-6 border-[3px] border-[color:var(--danger)] bg-[color:var(--danger)] text-white p-3 label">
                    {err}
                  </div>
                ) : null}
              </form>
            )}
          </div>
        </div>

        <aside className="hidden lg:flex flex-col w-[380px] bg-[color:var(--subtle)]">
          <div className="p-6 border-b-[3px] border-[color:var(--ink)]">
            <div className="label">why this exists</div>
            <p className="mt-2 text-sm leading-relaxed">
              Half-finished vibe-coded projects sit on Vercel forever. Each one
              holds live API keys. Each one is a future leak. slop-buster finds
              the dead ones, shows you what they looked like so memory kicks
              in, and helps you delete them.
            </p>
          </div>
          <div className="p-6 border-b-[3px] border-[color:var(--ink)]">
            <div className="label">what it does not do</div>
            <ul className="mt-2 text-sm space-y-1">
              <li>— touch github repos</li>
              <li>— rotate your openai / anthropic / stripe keys</li>
              <li>— store your token anywhere but this laptop</li>
              <li>— nag you with notifications</li>
            </ul>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-end">
            <div className="flex flex-wrap gap-2">
              <Stamp>OPEN SOURCE</Stamp>
              <Stamp>ONE SCREEN</Stamp>
              <Stamp status="danger">DESTRUCTIVE</Stamp>
            </div>
          </div>
        </aside>
      </section>

      <footer className="border-t-[3px] border-[color:var(--ink)] marquee py-2 bg-[color:var(--ink)] text-[color:var(--paper)]">
        <div className="marquee-track label px-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mr-12">
              * slop-buster * vercel graveyard sweeper * paste token to begin *
              keys get leaked when you forget *{" "}
            </span>
          ))}
        </div>
      </footer>
    </main>
  );
}

function TeamPicker({
  teams,
  user,
  onPick,
}: {
  teams: VercelTeam[];
  user: { username: string; email: string } | null;
  onPick: (teamId: string | null) => void;
}) {
  return (
    <div className="mt-10">
      <div className="label text-[color:var(--muted)]">step 02 / scope</div>
      <h2 className="display text-3xl font-bold mt-2">Which account?</h2>
      <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
        Pick one. You can change later.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onPick(null)}
          className="rule border p-4 text-left bg-[color:var(--paper)] hover:bg-[color:var(--warn)] transition-colors"
        >
          <div className="label">personal</div>
          <div className="display text-xl mt-1">
            {user?.username ?? "me"}
          </div>
          <div className="text-xs text-[color:var(--muted)] mt-1">
            {user?.email ?? ""}
          </div>
        </button>
        {teams.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            className="rule border p-4 text-left bg-[color:var(--paper)] hover:bg-[color:var(--warn)] transition-colors"
          >
            <div className="label">team</div>
            <div className="display text-xl mt-1">{t.name}</div>
            <div className="text-xs text-[color:var(--muted)] mt-1">
              {t.slug}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
