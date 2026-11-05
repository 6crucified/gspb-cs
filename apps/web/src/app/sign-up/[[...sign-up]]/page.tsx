import { SignUp } from "@clerk/nextjs";
import { CLERK_APPEARANCE } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Créer un compte</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Créer un compte n&apos;inscrit pas encore dans une classe. Le lien d&apos;invitation de
          l&apos;enseignant ouvre l&apos;accès.
        </p>
      </div>
      <SignUp appearance={CLERK_APPEARANCE} />
    </div>
  );
}
