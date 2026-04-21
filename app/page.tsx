"use client";

import { useCallback, useEffect, useState } from "react";
import type { Thresholds } from "@/lib/types";
import { TokenEntry } from "@/components/TokenEntry";
import { Dashboard } from "@/components/Dashboard";

type ConfigState = {
  hasToken: boolean;
  teamId: string | null;
  accountSlug: string | null;
  thresholds: Thresholds;
};

export default function Home() {
  const [cfg, setCfg] = useState<ConfigState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/config", { cache: "no-store" });
      const j = (await res.json()) as ConfigState;
      setCfg(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read config");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (error) {
    return (
      <main className="p-10">
        <div className="rule border p-6 bg-[color:var(--danger)] text-white label">
          {error}
        </div>
      </main>
    );
  }
  if (!cfg) {
    return (
      <main className="p-10 label text-[color:var(--muted)]">booting…</main>
    );
  }
  if (!cfg.hasToken) {
    return <TokenEntry onAuthenticated={refresh} />;
  }
  return (
    <Dashboard
      thresholds={cfg.thresholds}
      accountSlug={cfg.accountSlug}
      onLogout={refresh}
    />
  );
}
