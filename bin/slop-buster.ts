#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const requireFromPkg = createRequire(path.join(packageRoot, "package.json"));

const PORT = Number(process.env.SLOP_BUSTER_PORT ?? 4242);

function openBrowser(url: string) {
  const cmd =
    process.platform === "darwin"
      ? ["open", url]
      : process.platform === "win32"
        ? ["cmd", "/c", "start", url]
        : ["xdg-open", url];
  spawn(cmd[0], cmd.slice(1), { stdio: "ignore", detached: true }).unref();
}

async function main() {
  const isDev = process.env.SLOP_BUSTER_DEV === "1";
  const nextBin = requireFromPkg.resolve("next/dist/bin/next");
  const args = isDev ? ["dev", "-p", String(PORT)] : ["start", "-p", String(PORT)];

  console.log(`\n  slop-buster  →  http://localhost:${PORT}\n`);

  const child = spawn(process.execPath, [nextBin, ...args], {
    cwd: packageRoot,
    stdio: "inherit",
    env: { ...process.env, PORT: String(PORT) },
  });

  let opened = false;
  const tryOpen = () => {
    if (opened) return;
    opened = true;
    openBrowser(`http://localhost:${PORT}`);
  };
  setTimeout(tryOpen, 1500);

  child.on("exit", (code) => process.exit(code ?? 0));
  const shutdown = () => child.kill("SIGINT");
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
