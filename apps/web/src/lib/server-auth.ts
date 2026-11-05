import { auth } from "@clerk/nextjs/server";
import {
  requireAuthenticatedUser,
  type AuthenticatedContext,
} from "@gspb-cs/auth";

export async function getAuthenticatedContext(): Promise<AuthenticatedContext | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    return await requireAuthenticatedUser(userId);
  } catch {
    return null;
  }
}

export async function requireAuthContext(): Promise<AuthenticatedContext> {
  const { userId } = await auth();
  return requireAuthenticatedUser(userId);
}
