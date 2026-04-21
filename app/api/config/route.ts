import { readConfig, writeConfig } from "@/lib/config-store";
import { DEFAULT_THRESHOLDS, type Thresholds } from "@/lib/types";
import { getUser, listTeams } from "@/lib/vercel-client";

export async function GET() {
  let cfg = await readConfig();
  if (cfg.token && !cfg.accountSlug) {
    try {
      let accountSlug: string | null = null;
      if (cfg.teamId) {
        const teams = await listTeams({ token: cfg.token });
        accountSlug = teams.teams.find((t) => t.id === cfg.teamId)?.slug ?? null;
      } else {
        const user = await getUser({ token: cfg.token });
        accountSlug = user.user.username;
      }
      if (accountSlug) {
        cfg = { ...cfg, accountSlug };
        await writeConfig(cfg);
      }
    } catch {}
  }
  return Response.json({
    hasToken: !!cfg.token,
    teamId: cfg.teamId,
    accountSlug: cfg.accountSlug,
    thresholds: cfg.thresholds,
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<{
    teamId: string | null;
    thresholds: Partial<Thresholds>;
  }>;
  const cfg = await readConfig();
  const next = {
    ...cfg,
    teamId: body.teamId === undefined ? cfg.teamId : body.teamId,
    thresholds: {
      staleDays: clamp(
        body.thresholds?.staleDays ?? cfg.thresholds.staleDays,
        1,
        3650,
        DEFAULT_THRESHOLDS.staleDays,
      ),
      monthlyVisitors: clamp(
        body.thresholds?.monthlyVisitors ?? cfg.thresholds.monthlyVisitors,
        0,
        1_000_000,
        DEFAULT_THRESHOLDS.monthlyVisitors,
      ),
    },
  };
  await writeConfig(next);
  return Response.json({ ok: true, config: {
    hasToken: !!next.token,
    teamId: next.teamId,
    accountSlug: next.accountSlug,
    thresholds: next.thresholds,
  }});
}

function clamp(n: number, min: number, max: number, fallback: number) {
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
