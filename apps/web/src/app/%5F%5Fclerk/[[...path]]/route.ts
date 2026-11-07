import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";

function frontendApiOrigin() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const encoded = key.replace(/^pk_(test|live)_/, "");
  const decoded = atob(encoded).replace(/\$$/, "");
  if (!decoded.includes(".")) {
    throw new Error("Clerk publishable key is missing.");
  }
  return `https://${decoded}`;
}

async function proxy(request: NextRequest, path: string[] = []) {
  const target = new URL(frontendApiOrigin());
  target.pathname = `/${path.join("/")}`;
  target.search = request.nextUrl.search;

  const proxyUrl = publicProxyUrl(request);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("Clerk-Proxy-Url", proxyUrl);
  const secret = process.env.CLERK_SECRET_KEY?.trim();
  if (secret) headers.set("Clerk-Secret-Key", secret);
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) headers.set("X-Forwarded-For", ip);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
    // @ts-expect-error Node/Workers streaming fetch requires duplex for a request body.
    duplex: hasBody ? "half" : undefined,
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  rewriteProxyHeaders(upstream, responseHeaders, target.origin, proxyUrl);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

function publicProxyUrl(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    .trim();
  if (host && !host.startsWith("localhost") && !host.startsWith("127.0.0.1")) {
    return `https://${host}/__clerk`;
  }
  return process.env.NEXT_PUBLIC_CLERK_PROXY_URL || "https://gspb.codes/__clerk";
}

function rewriteProxyHeaders(upstream: Response, headers: Headers, frontendOrigin: string, proxyUrl: string) {
  const location = headers.get("location");
  if (location?.startsWith(frontendOrigin)) {
    headers.set("location", proxyUrl + location.slice(frontendOrigin.length));
  }

  const cookies = typeof upstream.headers.getSetCookie === "function" ? upstream.headers.getSetCookie() : [];
  if (cookies.length === 0) return;
  headers.delete("set-cookie");
  for (const cookie of cookies) {
    headers.append("set-cookie", cookie.replace(/;\s*Domain=[^;]*/gi, ""));
  }
}

type Context = { params: Promise<{ path?: string[] }> };

export async function GET(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}
export async function POST(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}
export async function PUT(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}
export async function PATCH(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}
export async function DELETE(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}
