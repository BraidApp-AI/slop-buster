import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DEFAULT_THRESHOLDS, type AppConfig } from "./types";

const CONFIG_DIR = path.join(os.homedir(), ".slop-buster");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

const EMPTY: AppConfig = {
  token: null,
  teamId: null,
  accountSlug: null,
  thresholds: DEFAULT_THRESHOLDS,
};

export async function readConfig(): Promise<AppConfig> {
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return {
      token: parsed.token ?? null,
      teamId: parsed.teamId ?? null,
      accountSlug: parsed.accountSlug ?? null,
      thresholds: { ...DEFAULT_THRESHOLDS, ...(parsed.thresholds ?? {}) },
    };
  } catch {
    return { ...EMPTY };
  }
}

export async function writeConfig(config: AppConfig): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), {
    mode: 0o600,
  });
}

export async function clearConfig(): Promise<void> {
  try {
    await fs.unlink(CONFIG_FILE);
  } catch {}
}
