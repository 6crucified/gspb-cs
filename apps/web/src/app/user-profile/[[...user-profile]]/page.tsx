import { UserProfile } from "@clerk/nextjs";
import { CLERK_APPEARANCE } from "@/lib/clerk-appearance";

export default function UserProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <UserProfile appearance={CLERK_APPEARANCE} />
    </div>
  );
}
