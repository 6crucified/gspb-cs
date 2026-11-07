import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const prisma = resolve(root, "node_modules/.bin/prisma");
if (!existsSync(prisma)) {
  console.warn("[postinstall] prisma CLI not found; skip db:generate (set .npmrc production=false on CI)");
  process.exit(0);
}

run("pnpm", ["db:generate"]);

const worker = resolve(root, "apps/web/.open-next/worker.js");
if (existsSync(worker)) {
  process.exit(0);
}

const openNext = resolve(root, "apps/web/node_modules/.bin/opennextjs-cloudflare");
if (!existsSync(openNext)) {
  console.warn("[postinstall] opennextjs-cloudflare not found; skip cf-ci-build");
  process.exit(0);
}

run("node", ["apps/web/scripts/cf-ci-build.mjs"]);
