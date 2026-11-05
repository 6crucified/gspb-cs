import {
  ForbiddenError,
  requireAuthenticatedUser,
  requireSchoolMembership,
} from "@gspb-cs/auth";
import { prisma } from "@gspb-cs/database";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ schoolId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { userId: clerkUserId } = await auth();
  const { schoolId } = await context.params;

  try {
    const { user } = await requireAuthenticatedUser(clerkUserId);
    await requireSchoolMembership({ userId: user.id, schoolId });

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: school.id,
      name: school.name,
      slug: school.slug,
    });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
