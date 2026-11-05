import { auth } from "@clerk/nextjs/server";
import { listUserSchools } from "@gspb-cs/auth";
import { requireAuthContext } from "@/lib/server-auth";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p>Unauthorized</p>
        <Link href="/sign-in" className="text-[var(--accent)]">
          Sign in
        </Link>
      </div>
    );
  }

  let user;
  try {
    ({ user } = await requireAuthContext());
  } catch {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-16">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[var(--muted)]">
          Your Clerk session is active, but your application profile is not synced yet. Ensure
          Clerk webhooks are configured for <code className="text-xs">user.created</code>.
        </p>
      </div>
    );
  }

  const memberships = await listUserSchools(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Signed in as {user.email}. Clerk ID is stored as the external identity reference.
        </p>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-medium">Your schools</h2>
        {memberships.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No school memberships yet. Ask your administrator for an invitation.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {memberships.map((membership) => (
              <li
                key={membership.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3 text-sm"
              >
                <span>{membership.school.name}</span>
                <span className="text-[var(--muted)]">{membership.role}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
