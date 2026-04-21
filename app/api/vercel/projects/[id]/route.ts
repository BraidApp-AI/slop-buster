import { readConfig } from "@/lib/config-store";
import {
  deleteEnvVar,
  deleteProject,
  listEnvVars,
  VercelApiError,
} from "@/lib/vercel-client";
import { rotationHintFor } from "@/lib/rotation-lookup";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const cfg = await readConfig();
  if (!cfg.token) {
    return Response.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }
  const opts = { token: cfg.token, teamId: cfg.teamId };
  try {
    const envs = await listEnvVars(opts, id).catch(() => []);
    const envKeys = envs.map((e) => e.key);
    const hints = envKeys.map(rotationHintFor);

    for (const env of envs) {
      await deleteEnvVar(opts, id, env.id).catch(() => {});
    }
    await deleteProject(opts, id);

    return Response.json({
      ok: true,
      projectId: id,
      envKeys,
      rotationHints: hints,
    });
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
