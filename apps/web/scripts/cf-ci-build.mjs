import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

if (process.env.WORKERS_CI !== "1") process.exit(0);

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (existsSync(resolve(webRoot, ".open-next/worker.js"))) process.exit(0);

const result = spawnSync("node", ["./scripts/with-env.mjs", "pnpm", "exec", "opennextjs-cloudflare", "build"], {
  cwd: webRoot,
  env: process.env,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
