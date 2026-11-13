import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorStatus, getAuthenticatedUser } from "@/lib/requestAuth";
import { toWhisperItem, WHISPER_INCLUDE } from "@/lib/whisperDto";

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to view your whispers." },
      { status: authErrorStatus(auth.error) }
    );
  }

  try {
    const connections = await prisma.whisperConnection.findMany({
      where: {
        OR: [
          { initiatorId: auth.profile.id },
          { recipientId: auth.profile.id },
        ],
      },
      include: WHISPER_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      connections.map((connection) => toWhisperItem(connection, auth.profile.id))
    );
  } catch (error) {
    console.error("Failed to fetch whispers:", error);
    return NextResponse.json(
      { error: "Could not load your whispers." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in before sending a whisper." },
      { status: authErrorStatus(auth.error) }
    );
  }

  try {
    const body: unknown = await request.json();
    const data = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const { storyId, initialNote } = data;
    if (
      typeof storyId !== "string" ||
      typeof initialNote !== "string" ||
      !initialNote.trim() ||
      initialNote.trim().length > 4000
    ) {
      return NextResponse.json(
        { error: "A story and a whisper of up to 4,000 characters are required." },
        { status: 400 }
      );
    }

    const story = await prisma.story.findFirst({
      where: { id: storyId, isDraft: false },
      select: { id: true, authorId: true },
    });
    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }
    if (story.authorId === auth.profile.id) {
      return NextResponse.json(
        { error: "You cannot whisper to your own story." },
        { status: 400 }
      );
    }

    const existing = await prisma.whisperConnection.findFirst({
      where: {
        storyId,
        initiatorId: auth.profile.id,
        recipientId: story.authorId,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already have an open whisper conversation for this story." },
        { status: 409 }
      );
    }

    const connection = await prisma.whisperConnection.create({
      data: {
        storyId,
        initiatorId: auth.profile.id,
        recipientId: story.authorId,
        initialNote: initialNote.trim(),
        status: "PENDING",
        messages: {
          create: {
            senderId: auth.profile.id,
            content: initialNote.trim(),
          },
        },
      },
      include: WHISPER_INCLUDE,
    });

    return NextResponse.json(toWhisperItem(connection, auth.profile.id), {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create whisper:", error);
    return NextResponse.json(
      { error: "Could not send your whisper." },
      { status: 500 }
    );
  }
}
