export {
  AuthError,
  ForbiddenError,
  NotFoundError,
} from "./errors";
export {
  requireAuthenticatedUser,
  requireSchoolMembership,
  requireSchoolRole,
  requireClassAccess,
  requireWorkspaceAccess,
  resolvePlatformSignupPolicy,
  assertSignupAllowedForSchool,
  listUserSchools,
  type AuthenticatedContext,
} from "./authorize";
export {
  applyClerkUserCreated,
  applyClerkUserUpdated,
  applyClerkUserDeleted,
  processClerkWebhookEvent,
} from "./clerk-webhook";
