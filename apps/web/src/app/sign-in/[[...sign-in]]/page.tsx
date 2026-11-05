import { SignIn } from "@clerk/nextjs";
import { CLERK_APPEARANCE } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Use your school or personal email. School access is granted separately after sign-in.
        </p>
      </div>
      <SignIn appearance={CLERK_APPEARANCE} />
    </div>
  );
}
