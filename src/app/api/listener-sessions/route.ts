import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authErrorStatus,
  ensureDatabaseProfile,
  getAuthenticatedUser,
  isListenerStaff,
} from "@/lib/requestAuth";

function sessionResponse(
  session: {
    id: string;
    penName: string;
    topic: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    messages: {
      id: string;
      senderRole: string;
      senderName: string;
      content: string;
      createdAt: Date;
    }[];
  },
  staffView: boolean
) {
  return {
    id: session.id,
    penName: staffView ? session.penName : undefined,
    topic: session.topic,
    status: session.status,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    messages: session.messages.map((message) => ({
      id: message.id,
      senderRole: message.senderRole,
      senderName: message.senderName,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to access listener sessions." },
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
    const isStaff = isListenerStaff(auth.user.email);
    const staffView = new URL(request.url).searchParams.get("view") === "staff";
    if (staffView && !isStaff) {
      return NextResponse.json({ error: "Listener staff access is required." }, { status: 403 });
    }

    const sessions = await prisma.listenerSession.findMany({
      where: staffView
        ? {
            OR: [
              { status: "WAITING" },
              { status: "ACTIVE", assignedStaffId: auth.user.id },
            ],
          }
        : { userId: auth.user.id, status: { not: "CLOSED" } },
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(sessions.map((session) => sessionResponse(session, staffView)));
  } catch (error) {
    console.error("Failed to fetch listener sessions:", error);
    return NextResponse.json(
      { error: "Could not load listener sessions." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in before requesting a human listener." },
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
    const topic =
      body && typeof body === "object" && "topic" in body ? body.topic : undefined;
    if (typeof topic !== "string" || !topic.trim() || topic.length > 120) {
      return NextResponse.json(
        { error: "Choose a topic of up to 120 characters." },
        { status: 400 }
      );
    }

    const profile = await ensureDatabaseProfile(auth.user);
    const session = await prisma.listenerSession.create({
      data: {
        userId: auth.user.id,
        penName: profile.penName,
        topic: topic.trim(),
      },
      include: { messages: true },
    });

    return NextResponse.json(sessionResponse(session, false), { status: 201 });
  } catch (error) {
    console.error("Failed to create listener session:", error);
    return NextResponse.json(
      { error: "Could not request a human listener." },
      { status: 500 }
    );
  }
}
