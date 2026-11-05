import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { processClerkWebhookEvent } from "@gspb-cs/auth";
import { prisma } from "@gspb-cs/database";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim();
  if (!signingSecret) {
    return NextResponse.json(
      { error: "Webhook signing secret is not configured." },
      { status: 503 },
    );
  }

  let event;
  try {
    event = await verifyWebhook(request, { signingSecret });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const svixId = request.headers.get("svix-id")?.trim();
  if (svixId) {
    const duplicate = await prisma.processedWebhookEvent.findUnique({
      where: { id: svixId },
    });
    if (duplicate) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  try {
    const result = await processClerkWebhookEvent(event);
    if (svixId && !("ignored" in result && result.ignored)) {
      const clerkUserId =
        typeof (event.data as { id?: string }).id === "string"
          ? (event.data as { id: string }).id
          : undefined;
      const profile = clerkUserId
        ? await prisma.userProfile.findUnique({ where: { clerkUserId } })
        : null;

      await prisma.processedWebhookEvent.upsert({
        where: { id: svixId },
        create: {
          id: svixId,
          type: event.type,
          userId: profile?.id,
        },
        update: {},
      });
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[clerk/webhook]", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
