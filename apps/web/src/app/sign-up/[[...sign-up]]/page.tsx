import { SignUp } from "@clerk/nextjs";
import { CLERK_APPEARANCE } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Creating an account does not enroll you in a school. Your administrator or invitation
          link controls school access.
        </p>
      </div>
      <SignUp appearance={CLERK_APPEARANCE} />
    </div>
  );
}
