import type { WebhookEvent } from "@clerk/backend";
import { prisma, AccountStatus } from "@gspb-cs/database";

export type ClerkUserPayload = {
  id: string;
  email_addresses?: Array<{ email_address?: string }>;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
};

function displayNameFromUser(user: ClerkUserPayload) {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  if (parts.length > 0) return parts.join(" ").trim();
  if (user.username?.trim()) return user.username.trim();
  return null;
}

function primaryEmail(user: ClerkUserPayload) {
  const email = user.email_addresses?.[0]?.email_address?.trim();
  return email || "";
}

export async function applyClerkUserCreated(user: ClerkUserPayload) {
  const clerkUserId = user.id;
  const email = primaryEmail(user);
  if (!email) {
    throw new Error(`Clerk user ${clerkUserId} has no email`);
  }

  await prisma.userProfile.upsert({
    where: { clerkUserId },
    create: {
      clerkUserId,
      email,
      displayName: displayNameFromUser(user),
      accountStatus: AccountStatus.active,
    },
    update: {},
  });
}

export async function applyClerkUserUpdated(user: ClerkUserPayload) {
  const clerkUserId = user.id;
  const email = primaryEmail(user);
  const existing = await prisma.userProfile.findUnique({ where: { clerkUserId } });
  if (!existing) {
    await applyClerkUserCreated(user);
    return;
  }

  await prisma.userProfile.update({
    where: { clerkUserId },
    data: {
      ...(email ? { email } : {}),
      displayName: displayNameFromUser(user) ?? existing.displayName,
    },
  });
}

export async function applyClerkUserDeleted(user: ClerkUserPayload) {
  const clerkUserId = user.id;
  const existing = await prisma.userProfile.findUnique({ where: { clerkUserId } });
  if (!existing) return;

  await prisma.userProfile.update({
    where: { clerkUserId },
    data: { accountStatus: AccountStatus.deleted },
  });
}

export async function processClerkWebhookEvent(event: WebhookEvent) {
  const userPayload = event.data as unknown as ClerkUserPayload;

  switch (event.type) {
    case "user.created":
      await applyClerkUserCreated(userPayload);
      break;
    case "user.updated":
      await applyClerkUserUpdated(userPayload);
      break;
    case "user.deleted":
      await applyClerkUserDeleted(userPayload);
      break;
    default:
      return { ignored: true as const };
  }

  return { ignored: false as const };
}
