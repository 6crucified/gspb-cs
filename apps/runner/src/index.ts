import { Container, getContainer } from "@cloudflare/containers";

export class StudentBox extends Container {
  defaultPort = 8080;
  sleepAfter = "10m";
  enableInternet = false;
}

type SessionBody = {
  userId?: string;
  files?: { path: string; text: string }[];
  command?: string;
  data?: string;
  session?: string;
  removed?: string[];
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true });
    }
    if (request.headers.get("x-gspb-runner-secret") !== env.RUNNER_SECRET) {
      return new Response("Non autorisé", { status: 401 });
    }

    const allowed = url.pathname === "/session/output" || url.pathname === "/session/input" || url.pathname === "/session/open" || url.pathname === "/session/run";
    if (!allowed) return new Response("Introuvable", { status: 404 });

    const maxBytes = 5 * 1024 * 1024;
    const length = Number(request.headers.get("content-length") ?? "0");
    if (request.method !== "GET" && Number.isFinite(length) && length > maxBytes) {
      return new Response("Corps trop volumineux", { status: 413 });
    }

    let body: SessionBody = {};
    if (request.method !== "GET") {
      try {
        body = (await request.json()) as SessionBody;
      } catch {
        return new Response("JSON invalide", { status: 400 });
      }
    }

    const userId = (body.userId ?? url.searchParams.get("userId") ?? "").trim();
    if (!userId) return new Response("Élève manquant", { status: 400 });
    const session = ["1", "2", "3"].includes(String(body.session ?? url.searchParams.get("session") ?? "1"))
      ? String(body.session ?? url.searchParams.get("session") ?? "1")
      : "1";

    const files = (body.files ?? []).filter((file) => isSafePath(file.path));
    const removed = (body.removed ?? []).filter((path) => isSafePath(path));
    const container = getContainer(env.STUDENT_BOX, userId);
    return container.fetch(
      new Request(`http://student${url.pathname}?session=${session}`, {
        method: request.method,
        headers: { "Content-Type": "application/json" },
        body:
          request.method === "GET"
            ? undefined
            : JSON.stringify({ files, command: body.command, data: body.data, session, removed }),
      }),
    );
  },
};

function isSafePath(path: string) {
  if (!path || path.length > 180 || path.startsWith("/") || path.includes("\\") || path.includes("\0")) return false;
  const parts = path.split("/");
  return parts.every((part) => part !== "" && part !== "." && part !== ".." && part.length <= 80);
}
