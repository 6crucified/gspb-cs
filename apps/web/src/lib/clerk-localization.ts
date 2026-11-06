import { frFR } from "@clerk/localizations";

/** Name shown in Clerk's "pour continuer vers …" lines. */
export const CLERK_APP_NAME = "GSPB";

/**
 * Clerk substitutes `{{applicationName}}` from the instance display name.
 * A development instance keeps the default "My Application" until that name
 * is changed in the Clerk Dashboard, independent of our env vars.
 */
export function withApplicationName<T>(value: T, applicationName = CLERK_APP_NAME): T {
  if (typeof value === "string") {
    return value.replaceAll("{{applicationName}}", applicationName) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => withApplicationName(item, applicationName)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, withApplicationName(item, applicationName)]),
    ) as T;
  }
  return value;
}

export const clerkLocalization = structuredClone(withApplicationName(frFR));
