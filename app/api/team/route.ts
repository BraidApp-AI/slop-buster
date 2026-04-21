import { readConfig, writeConfig } from "@/lib/config-store";

export async function POST(req: Request) {
  const { teamId } = (await req.json()) as { teamId: string | null };
  const cfg = await readConfig();
  await writeConfig({ ...cfg, teamId: teamId ?? null });
  return Response.json({ ok: true, teamId: teamId ?? null });
}
