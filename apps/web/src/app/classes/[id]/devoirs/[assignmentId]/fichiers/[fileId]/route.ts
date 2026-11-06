import { auth } from "@clerk/nextjs/server";
import { attachmentDisposition } from "@/lib/assignment-files";
import { readAssignmentFile } from "@/lib/assignments";

type Params = { id: string; assignmentId: string; fileId: string };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Connexion requise", { status: 401 });

  const { id, assignmentId, fileId } = await context.params;
  const file = await readAssignmentFile({
    classroomId: id,
    assignmentId,
    fileId,
    clerkUserId: userId,
  });
  if (!file) return new Response("Introuvable", { status: 404 });

  const body = new ArrayBuffer(file.bytes.byteLength);
  new Uint8Array(body).set(file.bytes);

  return new Response(body, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.size),
      "Content-Disposition": attachmentDisposition(file.name),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
