"use client";

import { useState } from "react";
import { requestLeaveAction } from "@/app/classes/membership-actions";

export function ConfirmLeave({ classroomId, className }: { classroomId: string; className: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-line px-3 py-2 text-sm text-ink"
      >
        Demander à quitter
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-line bg-paper-elevated p-6">
            <h2 className="text-lg font-medium text-ink">Quitter la classe</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Voulez-vous demander à quitter « {className} » ? L&apos;enseignant doit accepter. Vos
              fichiers et vos devoirs seront alors supprimés.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm text-ink">
                Annuler
              </button>
              <form action={requestLeaveAction}>
                <input type="hidden" name="classroomId" value={classroomId} />
                <button type="submit" className="rounded-full bg-tomato px-4 py-2 text-sm font-medium text-[#1a1a1f]">
                  Confirmer
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
