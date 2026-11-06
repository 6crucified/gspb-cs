"use client";

import { useState } from "react";
import { kickStudentAction } from "@/app/classes/membership-actions";

export function ConfirmKick({
  classroomId,
  studentId,
  studentName,
}: {
  classroomId: string;
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-tomato hover:underline">
        Retirer
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-line bg-paper-elevated p-6">
            <h2 className="text-lg font-medium text-ink">Retirer {studentName}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Cette personne sort de la classe. Ses fichiers et ses statuts de devoirs sont supprimés.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm text-ink">
                Annuler
              </button>
              <form action={kickStudentAction}>
                <input type="hidden" name="classroomId" value={classroomId} />
                <input type="hidden" name="studentId" value={studentId} />
                <button type="submit" className="rounded-full bg-tomato px-4 py-2 text-sm font-medium text-[#1a1a1f]">
                  Retirer
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
