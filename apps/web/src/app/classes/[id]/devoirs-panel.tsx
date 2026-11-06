import {
  createAssignmentAction,
  deleteAssignmentAction,
  setAssignmentStatusAction,
} from "@/app/classes/assignment-actions";
import {
  assignmentErrorMessage,
  formatDueDate,
  formatFileSize,
  isPastDue,
  statusLabel,
  type AssignmentStatus,
} from "@/lib/assignment-files";
import { listAssignments, type AssignmentRecord } from "@/lib/assignments";
import type { ClassroomMemberRecord } from "@/lib/classrooms";

type Student = Pick<ClassroomMemberRecord, "clerkUserId" | "displayName" | "email">;

function statusFor(assignment: AssignmentRecord, clerkUserId: string): AssignmentStatus {
  return assignment.statuses.find((item) => item.clerkUserId === clerkUserId)?.status ?? "todo";
}

function studentName(student: Student) {
  return student.displayName || student.email;
}

export async function Devoirs({
  classroomId,
  isTeacher,
  students,
  viewerId,
  erreur,
}: {
  classroomId: string;
  isTeacher: boolean;
  students: Student[];
  viewerId: string;
  erreur?: string;
}) {
  const assignments = await listAssignments(classroomId);
  const message = assignmentErrorMessage(erreur);

  return (
    <section className="mt-10">
      <h2 className="font-medium text-ink">Devoirs</h2>
      <p className="mt-2 text-sm text-muted">
        {isTeacher
          ? "Publiez le travail de la section. Chaque élève marque À faire ou Fait."
          : "Marquez chaque devoir À faire ou Fait."}
      </p>
      {message ? (
        <p className="mt-4 text-sm text-tomato" role="alert">
          {message}
        </p>
      ) : null}

      {isTeacher ? (
        <form action={createAssignmentAction} encType="multipart/form-data" className="mt-6 space-y-4">
          <input type="hidden" name="classroomId" value={classroomId} />
          <label className="block text-sm text-ink" htmlFor="title">
            Titre
            <input
              id="title"
              name="title"
              required
              minLength={2}
              maxLength={120}
              placeholder="TP fonctions"
              className="mt-2 w-full rounded-xl border border-line bg-paper-elevated px-3 py-2 text-ink outline-none focus:border-navy"
            />
          </label>
          <label className="block text-sm text-ink" htmlFor="description">
            Consigne
            <textarea
              id="description"
              name="description"
              required
              minLength={2}
              maxLength={2000}
              rows={4}
              placeholder="Écrivez une fonction qui décide si une note est reçue."
              className="mt-2 w-full rounded-xl border border-line bg-paper-elevated px-3 py-2 text-ink outline-none focus:border-navy"
            />
          </label>
          <label className="block text-sm text-ink" htmlFor="dueOn">
            Date limite
            <input
              id="dueOn"
              name="dueOn"
              type="date"
              required
              className="mt-2 w-full rounded-xl border border-line bg-paper-elevated px-3 py-2 text-ink outline-none focus:border-navy"
            />
          </label>
          <label className="block text-sm text-ink" htmlFor="files">
            Pièces jointes
            <input
              id="files"
              name="files"
              type="file"
              multiple
              accept=".pdf,.py,.ipynb,.js,.mjs,.cjs,.ts,.tsx,.jsx,.java,.c,.h,.cpp,.hpp,.cc,.cs,.go,.php,.html,.css,.json,.md,.txt,.sql,.rs,.rb,.sh,.xml,.yml,.yaml,.csv"
              className="mt-2 block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#1a1a1f]"
            />
          </label>
          <p className="text-xs text-muted">PDF ou code. Quatre fichiers maximum, 1,5 Mo chacun.</p>
          <button
            type="submit"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-[#1a1a1f]"
          >
            Publier le devoir
          </button>
        </form>
      ) : null}

      {assignments.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Aucun devoir pour l&apos;instant.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {assignments.map((assignment) => {
            const done = students.filter((student) => statusFor(assignment, student.clerkUserId) === "done").length;
            const mine = statusFor(assignment, viewerId);
            const late = isPastDue(assignment.dueOn);
            return (
              <li key={assignment.id} className="rounded-2xl border border-line bg-paper-elevated p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-medium text-ink">{assignment.title}</h3>
                  {isTeacher ? (
                    <form action={deleteAssignmentAction}>
                      <input type="hidden" name="classroomId" value={classroomId} />
                      <input type="hidden" name="assignmentId" value={assignment.id} />
                      <button type="submit" className="text-sm text-muted hover:text-tomato">
                        Retirer
                      </button>
                    </form>
                  ) : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{assignment.description}</p>
                <p className={`mt-3 text-sm ${late ? "text-tomato" : "text-muted"}`}>
                  Date limite : {formatDueDate(assignment.dueOn)}
                </p>
                {assignment.files.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {assignment.files.map((file) => (
                      <li key={file.id}>
                        <a
                          href={`/classes/${classroomId}/devoirs/${assignment.id}/fichiers/${file.id}`}
                          className="text-sm text-navy hover:underline"
                        >
                          {file.name}
                        </a>
                        <span className="ml-2 text-xs text-muted">{formatFileSize(file.sizeBytes)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {isTeacher ? (
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="text-sm text-muted">
                      {students.length === 0
                        ? "Aucun élève pour l'instant."
                        : `${done} sur ${students.length} ont marqué Fait`}
                    </p>
                    {students.length > 0 ? (
                      <ul className="mt-3 divide-y divide-line border-y border-line">
                        {students.map((student) => (
                          <li key={student.clerkUserId} className="flex items-center justify-between py-2 text-sm">
                            <span className="text-ink">{studentName(student)}</span>
                            <span className="text-muted">{statusLabel(statusFor(assignment, student.clerkUserId))}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : (
                  <form action={setAssignmentStatusAction} className="mt-5 flex gap-2">
                    <input type="hidden" name="classroomId" value={classroomId} />
                    <input type="hidden" name="assignmentId" value={assignment.id} />
                    {(["todo", "done"] as const).map((status) => (
                      <button
                        key={status}
                        type="submit"
                        name="status"
                        value={status}
                        aria-pressed={mine === status}
                        className={
                          mine === status
                            ? "rounded-full bg-navy px-3 py-1.5 text-sm font-medium text-[#1a1a1f]"
                            : "rounded-full border border-line px-3 py-1.5 text-sm text-ink"
                        }
                      >
                        {statusLabel(status)}
                      </button>
                    ))}
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
