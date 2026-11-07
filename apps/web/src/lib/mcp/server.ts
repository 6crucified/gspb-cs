import { McpServer } from "@modelcontextprotocol/server";
import { registerDevoirTools } from "@/lib/mcp/devoir-tools";

export function createGspbMcpServer() {
  const server = new McpServer({
    name: "gspb-cs",
    version: "0.1.0",
  });

  registerDevoirTools(server);
  return server;
}
