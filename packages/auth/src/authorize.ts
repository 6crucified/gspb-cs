import {
  prisma,
  AccountStatus,
  SchoolRole,
  SignupPolicy,
  type UserProfile,
  type SchoolMembership,
} from "@gspb-cs/database";
import { AuthError, ForbiddenError, NotFoundError } from "./errors";

export type AuthenticatedContext = {
  clerkUserId: string;
  user: UserProfile;
};

export async function requireAuthenticatedUser(
  clerkUserId: string | null | undefined,
): Promise<AuthenticatedContext> {
  if (!clerkUserId?.trim()) {
    throw new AuthError("Authentication required");
  }

  const user = await prisma.userProfile.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    throw new AuthError("User profile not provisioned");
  }

  if (user.accountStatus === AccountStatus.deleted) {
    throw new AuthError("Account deleted", 403);
  }

  if (user.accountStatus === AccountStatus.suspended) {
    throw new AuthError("Account suspended", 403);
  }

  return { clerkUserId, user };
}

export async function requireSchoolMembership(params: {
  userId: string;
  schoolId: string;
}): Promise<SchoolMembership> {
  const membership = await prisma.schoolMembership.findUnique({
    where: {
      userId_schoolId: {
        userId: params.userId,
        schoolId: params.schoolId,
      },
    },
  });

  if (!membership) {
    throw new ForbiddenError("No membership for this school");
  }

  return membership;
}

const roleRank: Record<SchoolRole, number> = {
  student: 1,
  teacher: 2,
  school_admin: 3,
  platform_admin: 4,
};

export async function requireSchoolRole(params: {
  userId: string;
  schoolId: string;
  minimumRole: SchoolRole;
}): Promise<SchoolMembership> {
  const membership = await requireSchoolMembership(params);

  if (roleRank[membership.role] < roleRank[params.minimumRole]) {
    throw new ForbiddenError("Insufficient role for this school");
  }

  return membership;
}

export async function requireClassAccess(_params: {
  userId: string;
  classId: string;
}): Promise<void> {
  throw new NotFoundError("Class authorization not implemented yet");
}

export async function requireWorkspaceAccess(_params: {
  userId: string;
  workspaceId: string;
}): Promise<void> {
  throw new NotFoundError("Workspace authorization not implemented yet");
}

export async function resolvePlatformSignupPolicy(): Promise<SignupPolicy> {
  const settings = await prisma.platformSettings.findUnique({ where: { id: 1 } });
  return settings?.signupPolicy ?? SignupPolicy.invite_only;
}

export async function assertSignupAllowedForSchool(params: {
  schoolId: string;
  hasInvitation: boolean;
}) {
  const platformPolicy = await resolvePlatformSignupPolicy();
  const school = await prisma.school.findUnique({ where: { id: params.schoolId } });
  if (!school) {
    throw new NotFoundError("School not found");
  }

  const effectivePolicy =
    school.signupPolicy === SignupPolicy.open
      ? platformPolicy
      : school.signupPolicy;

  if (effectivePolicy === SignupPolicy.admin_only) {
    throw new ForbiddenError("School enrollment requires administrator action");
  }

  if (effectivePolicy === SignupPolicy.invite_only && !params.hasInvitation) {
    throw new ForbiddenError("School enrollment requires an invitation");
  }
}

export async function listUserSchools(userId: string) {
  return prisma.schoolMembership.findMany({
    where: { userId },
    include: { school: true },
    orderBy: { createdAt: "asc" },
  });
}
