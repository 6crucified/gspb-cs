export const MAX_API_JSON_BYTES = 5 * 1024 * 1024;

export function payloadTooLarge(request: Request, limit = MAX_API_JSON_BYTES): Response | null {
  const length = request.headers.get("content-length");
  if (!length) return null;
  const bytes = Number(length);
  if (!Number.isFinite(bytes) || bytes <= limit) return null;
  return Response.json({ error: "Corps de requête trop volumineux." }, { status: 413 });
}

export async function readJsonBody<T>(request: Request, limit = MAX_API_JSON_BYTES): Promise<T | Response> {
  const blocked = payloadTooLarge(request, limit);
  if (blocked) return blocked;
  return (await request.json().catch(() => null)) as T;
}
