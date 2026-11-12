import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_WHISPERS } from "@/lib/quinspenData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (process.env.DATABASE_URL && userId) {
      const connections = await prisma.whisperConnection.findMany({
        where: {
          OR: [{ initiatorId: userId }, { recipientId: userId }],
        },
        include: {
          initiator: {
            select: { penName: true, avatarIcon: true, avatarColor: true },
          },
          recipient: {
            select: { penName: true, avatarIcon: true, avatarColor: true },
          },
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      if (connections && connections.length > 0) {
        return NextResponse.json(connections);
      }
    }

    return NextResponse.json(INITIAL_WHISPERS);
  } catch (error) {
    console.error("Failed to fetch whispers:", error);
    return NextResponse.json(INITIAL_WHISPERS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storyId, initiatorId, recipientId, initialNote } = body;

    if (!initiatorId || !recipientId || !initialNote) {
      return NextResponse.json(
        { error: "Missing required parameters for whisper connection." },
        { status: 400 }
      );
    }

    if (process.env.DATABASE_URL) {
      const connection = await prisma.whisperConnection.create({
        data: {
          storyId: storyId || null,
          initiatorId,
          recipientId,
          initialNote,
          status: "PENDING",
          messages: {
            create: {
              senderId: initiatorId,
              content: initialNote,
            },
          },
        },
        include: {
          messages: true,
        },
      });
      return NextResponse.json(connection, { status: 201 });
    }

    return NextResponse.json(
      {
        id: "whisper-conn-" + Date.now(),
        storyId,
        initiatorId,
        recipientId,
        initialNote,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create whisper:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
