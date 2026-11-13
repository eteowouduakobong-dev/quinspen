import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorStatus, getAuthenticatedUser } from "@/lib/requestAuth";

type RouteContext = { params: Promise<{ connectionId: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to send a whisper." },
      { status: authErrorStatus(auth.error) }
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
        { error: "A whisper of up to 4,000 characters is required." },
        { status: 400 }
      );
    }

    const { connectionId } = await params;
    const connection = await prisma.whisperConnection.findUnique({
      where: { id: connectionId },
      select: {
        id: true,
        initiatorId: true,
        recipientId: true,
        status: true,
      },
    });
    if (
      !connection ||
      (connection.initiatorId !== auth.profile.id &&
        connection.recipientId !== auth.profile.id)
    ) {
      return NextResponse.json({ error: "Whisper not found." }, { status: 404 });
    }
    if (connection.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "This whisper conversation has not been accepted yet." },
        { status: 409 }
      );
    }

    const message = await prisma.whisperMessage.create({
      data: {
        connectionId,
        senderId: auth.profile.id,
        content: content.trim(),
      },
    });
    await prisma.whisperConnection.update({
      where: { id: connectionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      {
        id: message.id,
        connectionId: message.connectionId,
        senderId: message.senderId,
        senderPenName: auth.profile.penName,
        senderAvatarIcon: auth.profile.avatarIcon,
        senderAvatarColor: auth.profile.avatarColor,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to send whisper message:", error);
    return NextResponse.json(
      { error: "Could not send your whisper." },
      { status: 500 }
    );
  }
}
