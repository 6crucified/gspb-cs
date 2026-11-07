import type { NextConfig } from "next";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: workspaceRoot,
  serverExternalPackages: ["@prisma/client"],
  transpilePackages: ["@gspb-cs/auth", "@gspb-cs/database"],
  cacheMaxMemorySize: 12 * 1024 * 1024,
  experimental: {
    proxyClientMaxBodySize: "5mb",
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
