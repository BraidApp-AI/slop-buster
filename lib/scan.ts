import { classify } from "./classifier";
import {
  fetchAnalytics,
  listDeployments,
  listEnvVars,
  listProjects,
} from "./vercel-client";
import type { ClassifiedProject, Thresholds } from "./types";

export async function scanProjects(
  opts: { token: string; teamId: string | null },
  thresholds: Thresholds,
): Promise<ClassifiedProject[]> {
  const projects = await listProjects(opts);
  const now = Date.now();
  const windowStart = now - thresholds.staleDays * 24 * 60 * 60 * 1000;

  const results = await Promise.all(
    projects.map(async (project) => {
      const [prodDeploys, envs, analytics] = await Promise.all([
        listDeployments(opts, project.id, {
          target: "production",
          limit: 5,
        }).catch(() => []),
        listEnvVars(opts, project.id).catch(() => []),
        fetchAnalytics(opts, project.id).catch(() => null),
      ]);
      const latest = prodDeploys[0] ?? null;
      const inWindow = prodDeploys.filter((d) => d.createdAt >= windowStart).length;
      return classify({
        project,
        latestProductionDeployment: latest,
        deploymentsInWindow: inWindow,
        analytics,
        envVars: envs,
        now,
        thresholds,
      });
    }),
  );

  results.sort((a, b) => {
    const rank = (v: ClassifiedProject["verdict"]) =>
      v === "slop" ? 0 : v === "unknown" ? 1 : 2;
    const r = rank(a.verdict) - rank(b.verdict);
    if (r !== 0) return r;
    return (b.daysSinceLastCommit ?? 0) - (a.daysSinceLastCommit ?? 0);
  });

  return results;
}
