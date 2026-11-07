import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", env: process.env });
  process.exit(result.status ?? 1);
}

/** Cloudflare Workers Builds sets WORKERS_CI=1 and often runs `pnpm run build`. */
if (process.env.WORKERS_CI === "1" || process.env.CF_PAGES === "1") {
  run("pnpm", ["--filter", "@gspb-cs/web", "build:cf"]);
} else {
  run("pnpm", ["exec", "turbo", "build"]);
}
