import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Throw a one-off error to confirm Sentry ingestion. Disable in production unless SENTRY_ENABLE_VERIFY=1. */
export async function GET() {
  const allowInProd = process.env.SENTRY_ENABLE_VERIFY === "1";
  if (process.env.NODE_ENV === "production" && !allowInProd) {
    return NextResponse.json({ ok: false, message: "Disabled in production" }, { status: 404 });
  }

  const error = new Error("Sentry verify — gspb-cs");
  Sentry.captureException(error);
  await Sentry.flush(2000);
  throw error;
}
