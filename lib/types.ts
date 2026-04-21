export type VercelTeam = {
  id: string;
  slug: string;
  name: string;
};

export type VercelProject = {
  id: string;
  name: string;
  accountId: string;
  createdAt: number;
  updatedAt: number;
  framework: string | null;
  latestDeployments?: VercelDeployment[];
  targets?: { production?: VercelDeployment };
};

export type VercelDeployment = {
  // v6/deployments returns `uid`; v13/deployments/{id} returns `id`. Both hold.
  uid?: string;
  id?: string;
  url: string;
  name: string;
  createdAt: number;
  state?: string;
  target?: string | null;
  meta?: {
    githubCommitSha?: string;
    githubCommitAuthorName?: string;
    gitCommitSha?: string;
    [k: string]: string | undefined;
  };
};

export type VercelEnv = {
  id: string;
  key: string;
  target: string[];
  type: string;
};

export type TrafficSignal =
  | { source: "analytics"; visitors: number }
  | { source: "deployment-heuristic"; visitors: number };

export type ClassifiedProject = {
  project: VercelProject;
  productionUrl: string | null;
  latestDeploymentId: string | null;
  lastCommitAt: number | null;
  daysSinceLastCommit: number | null;
  traffic: TrafficSignal;
  envVarCount: number;
  envVarKeys: string[];
  verdict: "slop" | "healthy" | "unknown";
  reason: string;
};

export type Thresholds = {
  staleDays: number;
  monthlyVisitors: number;
};

export type AppConfig = {
  token: string | null;
  teamId: string | null;
  accountSlug: string | null;
  thresholds: Thresholds;
};

export const DEFAULT_THRESHOLDS: Thresholds = {
  staleDays: 30,
  monthlyVisitors: 10,
};
