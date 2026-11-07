import { createAssignmentAction } from "@/app/classes/assignment-actions";

export function DevoirsPublishForm({ classroomId }: { classroomId: string }) {
  return (
    <form
      action={createAssignmentAction}
      encType="multipart/form-data"
      className="mt-8 space-y-4 rounded-2xl border border-line bg-paper-elevated p-6"
    >
      <h2 className="text-lg font-medium text-ink">Nouveau devoir</h2>
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
          className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-navy"
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
          className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-navy"
        />
      </label>
      <label className="block text-sm text-ink" htmlFor="dueOn">
        Date limite
        <input
          id="dueOn"
          name="dueOn"
          type="date"
          required
          className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-navy"
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
      <div className="flex flex-wrap gap-2 pt-2">
        <button type="submit" className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-[#1a1a1f]">
          Publier
        </button>
      </div>
    </form>
  );
}
