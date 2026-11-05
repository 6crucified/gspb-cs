import { requireAuthContext } from "@/lib/server-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { user, clerkUserId } = await requireAuthContext();
    return NextResponse.json({
      clerkUserId,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    const status =
      error instanceof Error && "status" in error
        ? Number((error as { status?: number }).status) || 401
        : 401;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }
}
