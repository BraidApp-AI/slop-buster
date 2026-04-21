import { getUser, listTeams, VercelApiError } from "@/lib/vercel-client";
import { readConfig, writeConfig } from "@/lib/config-store";

export async function POST(req: Request) {
  const { token } = (await req.json()) as { token?: string };
  if (!token || typeof token !== "string" || token.length < 10) {
    return Response.json({ ok: false, error: "Missing or malformed token." }, { status: 400 });
  }
  try {
    const [user, teamsRes] = await Promise.all([
      getUser({ token }),
      listTeams({ token }).catch(() => ({ teams: [] })),
    ]);
    const cfg = await readConfig();
    await writeConfig({ ...cfg, token });
    return Response.json({
      ok: true,
      user: user.user,
      teams: teamsRes.teams,
    });
  } catch (e) {
    if (e instanceof VercelApiError) {
      return Response.json({ ok: false, error: e.message, status: e.status }, { status: 401 });
    }
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const cfg = await readConfig();
  await writeConfig({ ...cfg, token: null, teamId: null });
  return Response.json({ ok: true });
}
