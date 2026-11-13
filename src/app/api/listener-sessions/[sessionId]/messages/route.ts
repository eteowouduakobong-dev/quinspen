import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authErrorStatus,
  ensureDatabaseProfile,
  getAuthenticatedUser,
  isListenerStaff,
} from "@/lib/requestAuth";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in before sending a listener message." },
      { status: authErrorStatus(auth.error) }
    );
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "The listener service is not configured." },
      { status: 503 }
    );
  }

  try {
    const body: unknown = await request.json();
    const content =
      body && typeof body === "object" && "content" in body
        ? body.content
        : undefined;
    if (typeof content !== "string" || !content.trim() || content.length > 4000) {
      return NextResponse.json(
        { error: "A message of up to 4,000 characters is required." },
        { status: 400 }
      );
    }

    const { sessionId } = await params;
    const session = await prisma.listenerSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        status: true,
        assignedStaffId: true,
        penName: true,
      },
    });
    if (!session) {
      return NextResponse.json({ error: "Listener session not found." }, { status: 404 });
    }

    const staffView = isListenerStaff(auth.user.email);
    const isOwner = session.userId === auth.user.id;
    if (
      (!isOwner &&
        (!staffView || session.assignedStaffId !== auth.user.id)) ||
      session.status === "CLOSED" ||
      (staffView && !isOwner && session.status !== "ACTIVE")
    ) {
      return NextResponse.json({ error: "Listener session not found." }, { status: 404 });
    }

    let senderName = "Quinspen Human Listener";
    let senderRole = "STAFF";
    if (isOwner) {
      const profile = await ensureDatabaseProfile(auth.user);
      senderName = profile.penName;
      senderRole = "USER";
    }

    const message = await prisma.listenerMessage.create({
      data: {
        sessionId,
        senderId: auth.user.id,
        senderRole,
        senderName,
        content: content.trim(),
      },
    });
    await prisma.listenerSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      {
        id: message.id,
        senderRole: message.senderRole,
        senderName: message.senderName,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to send listener message:", error);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 }
    );
  }
}
