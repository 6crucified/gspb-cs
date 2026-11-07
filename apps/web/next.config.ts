import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: workspaceRoot,
  serverExternalPackages: ["@prisma/client"],
  transpilePackages: ["@gspb-cs/auth", "@gspb-cs/database", "agents"],
  cacheMaxMemorySize: 12 * 1024 * 1024,
  experimental: {
    proxyClientMaxBodySize: "5mb",
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

export default withSentryConfig(nextConfig, {
  org: "gspb",
  project: "gspb-web",
  authToken: sentryAuthToken,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  ...(sentryAuthToken
    ? {}
    : {
        disableServerWebpackPlugin: true,
        disableClientWebpackPlugin: true,
      }),
});
