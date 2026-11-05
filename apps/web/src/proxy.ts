import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing",
  "/docs(.*)",
  "/lessons",
  "/guides",
  "/about",
  "/feedback",
  "/classes",
  "/join(.*)",
  "/workspace",
  "/terms",
  "/privacy",
  "/api",
  "/api/webhooks/clerk(.*)",
  "/api/health(.*)",
]);

const isIgnoredRoute = createRouteMatcher([
  "/_next(.*)",
  "/favicon.ico",
  "/icon.svg",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isIgnoredRoute(request)) {
    return NextResponse.next();
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
