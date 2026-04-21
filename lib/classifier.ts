import type {
  ClassifiedProject,
  Thresholds,
  TrafficSignal,
  VercelDeployment,
  VercelEnv,
  VercelProject,
} from "./types";

export type ClassifierInput = {
  project: VercelProject;
  latestProductionDeployment: VercelDeployment | null;
  deploymentsInWindow: number;
  analytics: { visitors: number } | null;
  envVars: VercelEnv[];
  now?: number;
  thresholds: Thresholds;
};

const DAY_MS = 1000 * 60 * 60 * 24;

export function classify(input: ClassifierInput): ClassifiedProject {
  const now = input.now ?? Date.now();
  const dep = input.latestProductionDeployment;
  const lastCommitAt = dep?.createdAt ?? null;
  const daysSinceLastCommit =
    lastCommitAt === null
      ? null
      : Math.floor((now - lastCommitAt) / DAY_MS);

  const traffic: TrafficSignal =
    input.analytics !== null
      ? { source: "analytics", visitors: input.analytics.visitors }
      : {
          source: "deployment-heuristic",
          visitors:
            input.deploymentsInWindow > 0
              ? input.thresholds.monthlyVisitors + 1
              : 0,
        };

  const productionUrl = dep?.url ? `https://${dep.url}` : null;
  const envVarKeys = input.envVars.map((e) => e.key).sort();

  const stale =
    daysSinceLastCommit !== null &&
    daysSinceLastCommit > input.thresholds.staleDays;
  const quiet = traffic.visitors <= input.thresholds.monthlyVisitors;

  let verdict: ClassifiedProject["verdict"];
  let reason: string;

  if (daysSinceLastCommit === null) {
    verdict = "unknown";
    reason = "No production deployment found — cannot assess staleness.";
  } else if (stale && quiet) {
    verdict = "slop";
    reason = `No commits in ${daysSinceLastCommit}d and ${traffic.visitors} visitors (${traffic.source}).`;
  } else if (stale && !quiet) {
    verdict = "healthy";
    reason = `Stale (${daysSinceLastCommit}d) but has traffic (${traffic.visitors} visitors).`;
  } else if (!stale && quiet) {
    verdict = "healthy";
    reason = `Recent activity (${daysSinceLastCommit}d old) — keep for now.`;
  } else {
    verdict = "healthy";
    reason = `Active — ${daysSinceLastCommit}d since last deploy, ${traffic.visitors} visitors.`;
  }

  return {
    project: input.project,
    productionUrl,
    latestDeploymentId: dep?.id ?? null,
    lastCommitAt,
    daysSinceLastCommit,
    traffic,
    envVarCount: input.envVars.length,
    envVarKeys,
    verdict,
    reason,
  };
}
