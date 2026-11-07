import { verifyToken } from "@clerk/backend";
import type { AuthInfo } from "@modelcontextprotocol/server";

function authorizedParties(): string[] {
  const fromEnv = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];
  return fromEnv.filter((value): value is string => Boolean(value));
}

/** Validates a Clerk Bearer token for MCP HTTP clients. */
export async function mcpAuthInfo(request: Request): Promise<AuthInfo | undefined> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return undefined;

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return undefined;

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return undefined;

  try {
    const payload = await verifyToken(token, {
      secretKey,
      authorizedParties: authorizedParties(),
    });
    const clerkUserId = payload.sub;
    if (!clerkUserId) return undefined;

    return {
      token,
      clientId: clerkUserId,
      scopes: ["devoirs:write"],
      extra: { clerkUserId },
    };
  } catch {
    return undefined;
  }
}
