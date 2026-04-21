import { readConfig } from "@/lib/config-store";
import { scanProjects } from "@/lib/scan";
import { VercelApiError } from "@/lib/vercel-client";

export async function GET() {
  const cfg = await readConfig();
  if (!cfg.token) {
    return Response.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }
  try {
    const results = await scanProjects(
      { token: cfg.token, teamId: cfg.teamId },
      cfg.thresholds,
    );
    return Response.json({ ok: true, thresholds: cfg.thresholds, projects: results });
  } catch (e) {
    if (e instanceof VercelApiError) {
      return Response.json(
        { ok: false, error: e.message, status: e.status },
        { status: e.status === 401 ? 401 : 500 },
      );
    }
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
