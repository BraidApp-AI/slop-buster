import type {
  VercelDeployment,
  VercelEnv,
  VercelProject,
  VercelTeam,
} from "./types";

const API = "https://api.vercel.com";

export class VercelApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type ClientOptions = { token: string; teamId?: string | null };

function buildUrl(path: string, teamId: string | null | undefined, extra?: Record<string, string | number | undefined>) {
  const url = new URL(path, API);
  if (teamId) url.searchParams.set("teamId", teamId);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url;
}

async function request<T>(
  opts: ClientOptions,
  method: string,
  path: string,
  extra?: Record<string, string | number | undefined>,
  body?: unknown,
): Promise<T> {
  const url = buildUrl(path, opts.teamId, extra);
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${opts.token}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = "";
    let code: string | undefined;
    try {
      const j = await res.json();
      detail = j?.error?.message ?? JSON.stringify(j);
      code = j?.error?.code;
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new VercelApiError(res.status, detail || res.statusText, code);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function getUser(opts: ClientOptions): Promise<{ user: { username: string; email: string } }> {
  return request(opts, "GET", "/v2/user");
}

export async function listTeams(opts: ClientOptions): Promise<{ teams: VercelTeam[] }> {
  return request(opts, "GET", "/v2/teams", { limit: 100 });
}

export async function listProjects(opts: ClientOptions): Promise<VercelProject[]> {
  const out: VercelProject[] = [];
  let until: number | undefined;
  for (let i = 0; i < 10; i++) {
    const page = await request<{
      projects: VercelProject[];
      pagination?: { next: number | null };
    }>(opts, "GET", "/v9/projects", { limit: 100, until });
    out.push(...page.projects);
    if (!page.pagination?.next) break;
    until = page.pagination.next;
  }
  return out;
}

export async function listDeployments(
  opts: ClientOptions,
  projectId: string,
  params: { target?: "production"; limit?: number; since?: number } = {},
): Promise<VercelDeployment[]> {
  const res = await request<{ deployments: VercelDeployment[] }>(
    opts,
    "GET",
    "/v6/deployments",
    {
      projectId,
      limit: params.limit ?? 20,
      target: params.target,
      since: params.since,
    },
  );
  return res.deployments;
}

export async function listEnvVars(
  opts: ClientOptions,
  projectId: string,
): Promise<VercelEnv[]> {
  const res = await request<{ envs: VercelEnv[] }>(
    opts,
    "GET",
    `/v10/projects/${projectId}/env`,
    { decrypt: "false" },
  );
  return res.envs;
}

export async function deleteEnvVar(
  opts: ClientOptions,
  projectId: string,
  envId: string,
): Promise<void> {
  await request(opts, "DELETE", `/v9/projects/${projectId}/env/${envId}`);
}

export async function deleteProject(
  opts: ClientOptions,
  projectIdOrName: string,
): Promise<void> {
  await request(opts, "DELETE", `/v9/projects/${projectIdOrName}`);
}

export async function fetchAnalytics(
  opts: ClientOptions,
  projectId: string,
): Promise<{ visitors: number } | null> {
  const from = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const to = Date.now();
  try {
    const res = await request<{ total?: { visitors?: number }; visitors?: number }>(
      opts,
      "GET",
      "/v1/analytics/usage",
      { projectId, from, to, type: "web" },
    );
    const visitors = res.total?.visitors ?? res.visitors ?? 0;
    return { visitors };
  } catch (e) {
    if (e instanceof VercelApiError && (e.status === 402 || e.status === 403 || e.status === 404)) {
      return null;
    }
    throw e;
  }
}
