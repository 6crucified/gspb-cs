import { SignIn } from "@clerk/nextjs";
import { CLERK_APPEARANCE } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Utilisez l&apos;adresse de l&apos;établissement ou la vôtre. L&apos;accès à une classe se
          fait ensuite avec un lien d&apos;invitation.
        </p>
      </div>
      <SignIn appearance={CLERK_APPEARANCE} />
    </div>
  );
}
