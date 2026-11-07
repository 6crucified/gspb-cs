"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-dvh bg-paper font-sans text-ink-soft antialiased">
        <main className="mx-auto flex max-w-lg flex-col gap-4 px-6 py-24">
          <h1 className="text-2xl font-semibold text-ink">Une erreur est survenue</h1>
          <p className="text-sm text-ink-muted">L&apos;incident a été enregistré. Réessayez ou rechargez la page.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="w-fit rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
