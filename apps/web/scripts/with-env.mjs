import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(webRoot, "../..");

function apply(file, override) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (override || process.env[key] === undefined) process.env[key] = value;
  }
}

apply(resolve(webRoot, ".env.production"), false);
apply(resolve(repoRoot, ".env"), true);
apply(resolve(webRoot, ".env.local"), true);

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("with-env: missing command");
  process.exit(1);
}

const result = spawnSync(command, args, {
  cwd: webRoot,
  env: process.env,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
