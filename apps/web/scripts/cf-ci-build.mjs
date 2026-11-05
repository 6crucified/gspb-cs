import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const worker = resolve(webRoot, ".open-next/worker.js");
if (existsSync(worker)) process.exit(0);

const bin = resolve(webRoot, "node_modules/.bin/opennextjs-cloudflare");
const result = spawnSync("node", ["./scripts/with-env.mjs", bin, "build"], {
  cwd: webRoot,
  env: process.env,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
