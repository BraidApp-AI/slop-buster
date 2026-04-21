import { readConfig, writeConfig } from "@/lib/config-store";
import { getUser, listTeams } from "@/lib/vercel-client";

export async function POST(req: Request) {
  const { teamId } = (await req.json()) as { teamId: string | null };
  const cfg = await readConfig();
  let accountSlug: string | null = cfg.accountSlug;
  if (cfg.token) {
    try {
      if (teamId) {
        const teams = await listTeams({ token: cfg.token });
        accountSlug = teams.teams.find((t) => t.id === teamId)?.slug ?? null;
      } else {
        const user = await getUser({ token: cfg.token });
        accountSlug = user.user.username;
      }
    } catch {}
  }
  await writeConfig({ ...cfg, teamId: teamId ?? null, accountSlug });
  return Response.json({ ok: true, teamId: teamId ?? null, accountSlug });
}
