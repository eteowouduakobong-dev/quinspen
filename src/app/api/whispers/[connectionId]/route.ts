import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorStatus, getAuthenticatedUser } from "@/lib/requestAuth";
import { toWhisperItem, WHISPER_INCLUDE } from "@/lib/whisperDto";

type RouteContext = { params: Promise<{ connectionId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to update this whisper." },
      { status: authErrorStatus(auth.error) }
    );
  }

  try {
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

    const body: unknown = await request.json();
    const data = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

    if (data.markRead === true) {
      await prisma.whisperMessage.updateMany({
        where: {
          connectionId,
          senderId: { not: auth.profile.id },
          isRead: false,
        },
        data: { isRead: true },
      });
      return NextResponse.json({ ok: true });
    }

    const status = data.status;
    if (status !== "ACCEPTED" && status !== "DECLINED") {
      return NextResponse.json({ error: "Invalid whisper status." }, { status: 400 });
    }
    if (connection.recipientId !== auth.profile.id) {
      return NextResponse.json(
        { error: "Only the recipient can respond to this whisper." },
        { status: 403 }
      );
    }
    if (connection.status !== "PENDING") {
      return NextResponse.json(
        { error: "This whisper has already been answered." },
        { status: 409 }
      );
    }

    const updated = await prisma.whisperConnection.update({
      where: { id: connectionId },
      data: { status },
      include: WHISPER_INCLUDE,
    });
    return NextResponse.json(toWhisperItem(updated, auth.profile.id));
  } catch (error) {
    console.error("Failed to update whisper:", error);
    return NextResponse.json(
      { error: "Could not update this whisper." },
      { status: 500 }
    );
  }
}
