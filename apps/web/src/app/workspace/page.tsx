import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePreview } from "@/components/marketing/workspace-preview";

export const metadata: Metadata = {
  title: "Workspace",
  description: "The GSPB editor, terminal, and files for a class.",
};

export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-semibold text-ink">Workspace</h1>
          <p className="mt-3 max-w-xl text-ink-soft">
            Files, an editor, and a terminal for the class you have open. This screen is the preview.
            A live session opens from a class once that class exists.
          </p>
        </div>
        <Link href="/classes" className="text-sm text-navy hover:underline">
          Back to classes
        </Link>
      </div>
      <div className="mt-10">
        <WorkspacePreview />
      </div>
    </div>
  );
}
