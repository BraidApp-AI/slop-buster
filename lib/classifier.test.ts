import { describe, expect, it } from "vitest";
import { classify } from "./classifier";
import type { VercelDeployment, VercelEnv, VercelProject } from "./types";

const DAY_MS = 86_400_000;
const NOW = new Date("2026-04-21T00:00:00Z").getTime();

function proj(overrides: Partial<VercelProject> = {}): VercelProject {
  return {
    id: "prj_1",
    name: "example",
    accountId: "acc",
    createdAt: NOW - 200 * DAY_MS,
    updatedAt: NOW - 100 * DAY_MS,
    framework: "nextjs",
    ...overrides,
  };
}

function deploy(daysAgo: number): VercelDeployment {
  return {
    uid: `dpl_${daysAgo}`,
    url: "example-xyz.vercel.app",
    name: "example",
    createdAt: NOW - daysAgo * DAY_MS,
  };
}

const envs: VercelEnv[] = [
  { id: "e1", key: "OPENAI_API_KEY", target: ["production"], type: "encrypted" },
  { id: "e2", key: "DATABASE_URL", target: ["production"], type: "encrypted" },
];

const DEFAULT_T = { staleDays: 30, monthlyVisitors: 10 };

describe("classify", () => {
  it("marks stale + quiet project as slop", () => {
    const r = classify({
      project: proj(),
      latestProductionDeployment: deploy(142),
      deploymentsInWindow: 0,
      analytics: { visitors: 0 },
      envVars: envs,
      now: NOW,
      thresholds: DEFAULT_T,
    });
    expect(r.verdict).toBe("slop");
    expect(r.daysSinceLastCommit).toBe(142);
    expect(r.envVarCount).toBe(2);
    expect(r.envVarKeys).toEqual(["DATABASE_URL", "OPENAI_API_KEY"]);
    expect(r.productionUrl).toBe("https://example-xyz.vercel.app");
  });

  it("marks stale + has traffic as healthy", () => {
    const r = classify({
      project: proj(),
      latestProductionDeployment: deploy(90),
      deploymentsInWindow: 0,
      analytics: { visitors: 500 },
      envVars: envs,
      now: NOW,
      thresholds: DEFAULT_T,
    });
    expect(r.verdict).toBe("healthy");
    expect(r.reason).toMatch(/has traffic/);
  });

  it("marks fresh + quiet as healthy (in grace window)", () => {
    const r = classify({
      project: proj(),
      latestProductionDeployment: deploy(5),
      deploymentsInWindow: 1,
      analytics: { visitors: 0 },
      envVars: [],
      now: NOW,
      thresholds: DEFAULT_T,
    });
    expect(r.verdict).toBe("healthy");
  });

  it("falls back to deployment heuristic when analytics is null", () => {
    const r = classify({
      project: proj(),
      latestProductionDeployment: deploy(60),
      deploymentsInWindow: 0,
      analytics: null,
      envVars: envs,
      now: NOW,
      thresholds: DEFAULT_T,
    });
    expect(r.traffic.source).toBe("deployment-heuristic");
    expect(r.traffic.visitors).toBe(0);
    expect(r.verdict).toBe("slop");
  });

  it("deployment-heuristic: any deployment in window counts as traffic", () => {
    const r = classify({
      project: proj(),
      latestProductionDeployment: deploy(60),
      deploymentsInWindow: 2,
      analytics: null,
      envVars: envs,
      now: NOW,
      thresholds: DEFAULT_T,
    });
    expect(r.traffic.source).toBe("deployment-heuristic");
    expect(r.traffic.visitors).toBeGreaterThan(DEFAULT_T.monthlyVisitors);
    expect(r.verdict).toBe("healthy");
  });

  it("returns unknown when there is no production deployment", () => {
    const r = classify({
      project: proj(),
      latestProductionDeployment: null,
      deploymentsInWindow: 0,
      analytics: null,
      envVars: [],
      now: NOW,
      thresholds: DEFAULT_T,
    });
    expect(r.verdict).toBe("unknown");
    expect(r.daysSinceLastCommit).toBeNull();
    expect(r.productionUrl).toBeNull();
  });

  it("respects user thresholds", () => {
    const r = classify({
      project: proj(),
      latestProductionDeployment: deploy(45),
      deploymentsInWindow: 0,
      analytics: { visitors: 5 },
      envVars: [],
      now: NOW,
      thresholds: { staleDays: 90, monthlyVisitors: 10 },
    });
    expect(r.verdict).toBe("healthy");

    const r2 = classify({
      project: proj(),
      latestProductionDeployment: deploy(45),
      deploymentsInWindow: 0,
      analytics: { visitors: 5 },
      envVars: [],
      now: NOW,
      thresholds: { staleDays: 30, monthlyVisitors: 10 },
    });
    expect(r2.verdict).toBe("slop");
  });

  it("edge: exactly at threshold is not stale (> not >=)", () => {
    const r = classify({
      project: proj(),
      latestProductionDeployment: deploy(30),
      deploymentsInWindow: 0,
      analytics: { visitors: 0 },
      envVars: [],
      now: NOW,
      thresholds: DEFAULT_T,
    });
    expect(r.verdict).toBe("healthy");
  });

  it("edge: exactly at visitor threshold is still quiet (<=)", () => {
    const r = classify({
      project: proj(),
      latestProductionDeployment: deploy(50),
      deploymentsInWindow: 0,
      analytics: { visitors: 10 },
      envVars: [],
      now: NOW,
      thresholds: DEFAULT_T,
    });
    expect(r.verdict).toBe("slop");
  });
});
