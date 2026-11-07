import Link from "next/link";
import { deleteAssignmentAction, setAssignmentStatusAction } from "@/app/classes/assignment-actions";
import { DevoirsPublishForm } from "@/app/classes/[id]/devoirs-publish-form";
import {
  assignmentErrorMessage,
  formatDueDate,
  formatFileSize,
  formatSeenAt,
  isPastDue,
  statusLabel,
  type AssignmentStatus,
} from "@/lib/assignment-files";
import {
  listAssignments,
  recordStudentAssignmentViews,
  type AssignmentRecord,
  type AssignmentViewRecord,
} from "@/lib/assignments";
import type { ClassroomMemberRecord } from "@/lib/classrooms";

type Student = Pick<ClassroomMemberRecord, "clerkUserId" | "displayName" | "email">;

function statusFor(assignment: AssignmentRecord, clerkUserId: string): AssignmentStatus {
  return assignment.statuses.find((item) => item.clerkUserId === clerkUserId)?.status ?? "todo";
}

function viewFor(assignment: AssignmentRecord, clerkUserId: string): AssignmentViewRecord | undefined {
  return assignment.views.find((item) => item.clerkUserId === clerkUserId);
}

function studentName(student: Student) {
  return student.displayName || student.email;
}

function StatusPill({ status }: { status: AssignmentStatus }) {
  if (status === "done") {
    return (
      <span className="inline-flex rounded-full bg-[#2d5a3d]/25 px-2.5 py-0.5 text-xs font-medium text-[#8fd4a8]">
        Fait
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-line bg-paper px-2.5 py-0.5 text-xs font-medium text-muted">
      À faire
    </span>
  );
}

function SeenPill({ seen }: { seen: boolean }) {
  if (seen) {
    return (
      <span className="inline-flex rounded-full bg-navy/15 px-2.5 py-0.5 text-xs font-medium text-navy">Vu</span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-dashed border-line px-2.5 py-0.5 text-xs text-muted">
      Pas vu
    </span>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line/40">
        <div className="h-full rounded-full bg-[#6b9e7d]" style={{ width: `${pct}%` }} />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted">
        {done}/{total} fait
      </span>
    </div>
  );
}

export async function Devoirs({
  classroomId,
  isTeacher,
  students,
  viewerId,
  erreur,
  showPublish,
}: {
  classroomId: string;
  isTeacher: boolean;
  students: Student[];
  viewerId: string;
  erreur?: string;
  showPublish: boolean;
}) {
  if (!isTeacher) {
    await recordStudentAssignmentViews(classroomId, viewerId);
  }

  const assignments = await listAssignments(classroomId);
  const message = assignmentErrorMessage(erreur);
  const devoirsPath = `/classes/${classroomId}/devoirs`;

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-semibold text-ink">Devoirs</h1>
          <p className="mt-2 max-w-lg text-sm text-muted">
            {isTeacher
              ? "Suivez qui a consulté chaque devoir et le statut À faire / Fait de chaque élève."
              : "Marquez chaque devoir À faire ou Fait."}
          </p>
        </div>
        {isTeacher ? (
          showPublish ? (
            <Link href={devoirsPath} className="shrink-0 rounded-full border border-line px-4 py-2 text-sm text-ink">
              Annuler
            </Link>
          ) : (
            <Link
              href={`${devoirsPath}?publier=1`}
              className="shrink-0 rounded-full bg-navy px-4 py-2 text-sm font-medium text-[#1a1a1f]"
            >
              Publier un devoir
            </Link>
          )
        ) : null}
      </div>

      {message ? (
        <p className="mt-4 text-sm text-tomato" role="alert">
          {message}
        </p>
      ) : null}

      {isTeacher && showPublish ? <DevoirsPublishForm classroomId={classroomId} /> : null}

      {assignments.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-12">
          <h2 className="text-lg font-medium text-ink">Aucun devoir publié</h2>
          <p className="mt-2 text-sm text-muted">
            {isTeacher ? "Publiez le premier devoir de la section." : "L'enseignant n'a rien publié pour l'instant."}
          </p>
          {isTeacher && !showPublish ? (
            <Link
              href={`${devoirsPath}?publier=1`}
              className="mt-6 inline-flex rounded-full bg-navy px-4 py-2 text-sm font-medium text-[#1a1a1f]"
            >
              Publier un devoir
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {assignments.map((assignment) => {
            const done = students.filter((student) => statusFor(assignment, student.clerkUserId) === "done").length;
            const seen = students.filter((student) => viewFor(assignment, student.clerkUserId)).length;
            const mine = statusFor(assignment, viewerId);
            const late = isPastDue(assignment.dueOn);
            return (
              <li key={assignment.id} className="rounded-2xl border border-line bg-paper-elevated p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-medium text-ink">{assignment.title}</h3>
                    {isTeacher ? (
                      <p className="mt-2 text-xs text-muted">
                        {seen} sur {students.length} ont consulté · {done} sur {students.length} ont marqué Fait
                      </p>
                    ) : null}
                  </div>
                  {isTeacher ? (
                    <form action={deleteAssignmentAction}>
                      <input type="hidden" name="classroomId" value={classroomId} />
                      <input type="hidden" name="assignmentId" value={assignment.id} />
                      <button type="submit" className="shrink-0 text-sm text-muted hover:text-tomato">
                        Retirer
                      </button>
                    </form>
                  ) : null}
                </div>

                {isTeacher && students.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <ProgressBar done={done} total={students.length} />
                    <div className="flex gap-4 text-xs text-muted">
                      <span>
                        <span className="text-ink-soft">{seen}</span> vu{seen > 1 ? "s" : ""}
                      </span>
                      <span>
                        <span className="text-ink-soft">{students.length - seen}</span> pas encore vu
                        {students.length - seen > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ) : null}

                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{assignment.description}</p>
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
                    {students.length === 0 ? (
                      <p className="text-sm text-muted">Aucun élève inscrit pour l&apos;instant.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[320px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-line text-xs text-muted">
                              <th className="pb-2 pr-4 font-medium">Élève</th>
                              <th className="pb-2 pr-4 font-medium">Consultation</th>
                              <th className="pb-2 font-medium">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line">
                            {[...students]
                              .sort((a, b) => {
                                const aSeen = viewFor(assignment, a.clerkUserId) ? 1 : 0;
                                const bSeen = viewFor(assignment, b.clerkUserId) ? 1 : 0;
                                if (aSeen !== bSeen) return aSeen - bSeen;
                                const aDone = statusFor(assignment, a.clerkUserId) === "done" ? 1 : 0;
                                const bDone = statusFor(assignment, b.clerkUserId) === "done" ? 1 : 0;
                                return aDone - bDone;
                              })
                              .map((student) => {
                                const view = viewFor(assignment, student.clerkUserId);
                                const status = statusFor(assignment, student.clerkUserId);
                                return (
                                  <tr key={student.clerkUserId}>
                                    <td className="py-2.5 pr-4 text-ink">{studentName(student)}</td>
                                    <td className="py-2.5 pr-4">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <SeenPill seen={Boolean(view)} />
                                        {view ? (
                                          <span className="text-xs text-muted">{formatSeenAt(view.lastSeenAt)}</span>
                                        ) : null}
                                      </div>
                                    </td>
                                    <td className="py-2.5">
                                      <StatusPill status={status} />
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <form action={setAssignmentStatusAction} className="mt-5 flex flex-wrap gap-2">
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
    </>
  );
}
