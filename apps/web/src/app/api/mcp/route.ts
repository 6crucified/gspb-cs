import { createMcpHandler } from "agents/mcp/server";
import { createGspbMcpServer } from "@/lib/mcp/server";
import { mcpAuthInfo } from "@/lib/mcp/auth";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const handler = createMcpHandler(createGspbMcpServer, {
  route: "/api/mcp",
  corsOptions: {
    origin: siteUrl,
  },
});

async function serve(request: Request): Promise<Response> {
  const authInfo = await mcpAuthInfo(request);
  if (!authInfo) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="gspb-cs-mcp"' },
    });
  }

  let parsedBody: unknown;
  if (request.method === "POST") {
    try {
      parsedBody = await request.clone().json();
    } catch {
      parsedBody = undefined;
    }
  }

  return handler.fetch(request, { authInfo, parsedBody });
}

export const maxDuration = 60;

export { serve as GET, serve as POST };

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": siteUrl,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Accept, Authorization, MCP-Protocol-Version, Mcp-Method, Mcp-Name",
      "Access-Control-Max-Age": "7200",
    },
  });
}
