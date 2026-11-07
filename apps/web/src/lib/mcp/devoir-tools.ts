import {
  assignmentContentType,
  isAllowedAssignmentFile,
  MAX_ASSIGNMENT_FILE_BYTES,
  MAX_ASSIGNMENT_FILES,
  parseDueDate,
  safeAssignmentFileName,
} from "@/lib/assignment-files";
import {
  createAssignment,
  deleteAssignment,
  isClassroomTeacher,
  requireClassroom,
} from "@/lib/assignments";
import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

const fileInputSchema = z.object({
  fileName: z.string().min(1).max(120),
  contentUtf8: z.string().optional(),
  contentBase64: z.string().optional(),
});

function toolError(message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}

function decodeFilePayload(file: z.infer<typeof fileInputSchema>): ArrayBuffer | null {
  if (file.contentUtf8 != null) {
    const encoded = new TextEncoder().encode(file.contentUtf8);
    return encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength);
  }
  if (file.contentBase64 != null) {
    const binary = atob(file.contentBase64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
  }
  return null;
}

function clerkUserIdFromContext(context: { http?: { authInfo?: { clientId?: string; extra?: unknown } } }) {
  const extra = context.http?.authInfo?.extra;
  if (extra && typeof extra === "object" && "clerkUserId" in extra) {
    const value = (extra as { clerkUserId?: unknown }).clerkUserId;
    if (typeof value === "string" && value.length > 0) return value;
  }
  return context.http?.authInfo?.clientId;
}

export function registerDevoirTools(server: McpServer) {
  server.registerTool(
    "add_devoir",
    {
      description:
        "Publie un devoir (assignment) dans une classe. Réservé aux enseignants de la classe.",
      inputSchema: z.object({
        classroomId: z.string().min(1).describe("Identifiant de la classe"),
        title: z.string().min(2).max(120),
        description: z.string().min(2).max(2000),
        dueOn: z.string().describe("Date limite au format YYYY-MM-DD"),
        files: z.array(fileInputSchema).max(MAX_ASSIGNMENT_FILES).optional(),
      }),
    },
    async (input, context) => {
      const clerkUserId = clerkUserIdFromContext(context);
      if (!clerkUserId) return toolError("Authentification requise.");

      const classroom = await requireClassroom(input.classroomId, clerkUserId);
      if (!classroom) return toolError("Classe introuvable ou accès refusé.");
      if (!isClassroomTeacher(classroom, clerkUserId)) {
        return toolError("Seul un enseignant peut publier un devoir.");
      }

      const dueOn = parseDueDate(input.dueOn);
      if (!dueOn) return toolError("Date limite invalide (attendu YYYY-MM-DD).");

      const uploads = input.files ?? [];
      if (uploads.length > MAX_ASSIGNMENT_FILES) {
        return toolError(`Au maximum ${MAX_ASSIGNMENT_FILES} fichiers.`);
      }

      const files: { name: string; bytes: ArrayBuffer; contentType: string }[] = [];
      for (const item of uploads) {
        const name = safeAssignmentFileName(item.fileName);
        if (!isAllowedAssignmentFile(name)) {
          return toolError(`Type de fichier non autorisé: ${name}`);
        }
        const bytes = decodeFilePayload(item);
        if (!bytes) {
          return toolError(`Fichier sans contenu: ${name} (contentUtf8 ou contentBase64 requis).`);
        }
        if (bytes.byteLength > MAX_ASSIGNMENT_FILE_BYTES) {
          return toolError(`Fichier trop volumineux: ${name}`);
        }
        files.push({
          name,
          bytes,
          contentType: assignmentContentType(name),
        });
      }

      const assignmentId = await createAssignment({
        classroomId: input.classroomId,
        createdBy: clerkUserId,
        title: input.title.trim(),
        description: input.description.trim(),
        dueOn,
        files,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ok: true,
              assignmentId,
              classroomId: input.classroomId,
              title: input.title.trim(),
              dueOn,
              fileCount: files.length,
            }),
          },
        ],
      };
    },
  );

  server.registerTool(
    "delete_devoir",
    {
      description: "Supprime un devoir publié dans une classe. Réservé aux enseignants.",
      inputSchema: z.object({
        classroomId: z.string().min(1),
        assignmentId: z.string().min(1),
      }),
    },
    async (input, context) => {
      const clerkUserId = clerkUserIdFromContext(context);
      if (!clerkUserId) return toolError("Authentification requise.");

      const classroom = await requireClassroom(input.classroomId, clerkUserId);
      if (!classroom) return toolError("Classe introuvable ou accès refusé.");
      if (!isClassroomTeacher(classroom, clerkUserId)) {
        return toolError("Seul un enseignant peut supprimer un devoir.");
      }

      const removed = await deleteAssignment(input.classroomId, input.assignmentId);
      if (!removed) return toolError("Devoir introuvable.");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ok: true,
              deleted: true,
              assignmentId: input.assignmentId,
              classroomId: input.classroomId,
            }),
          },
        ],
      };
    },
  );
}
