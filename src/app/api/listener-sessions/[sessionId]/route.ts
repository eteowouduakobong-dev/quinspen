import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authErrorStatus,
  getAuthenticatedUser,
} from "@/lib/requestAuth";

type RouteContext = { params: Promise<{ sessionId: string }> };

function sessionResponse(session: {
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
}) {
  return {
    id: session.id,
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

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to view this listener session." },
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
    const { sessionId } = await params;
    const session = await prisma.listenerSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!session) {
      return NextResponse.json({ error: "Listener session not found." }, { status: 404 });
    }

    const staffView = auth.isListener;
    const ownsSession = session.userId === auth.profile.id;
    if (
      !ownsSession &&
      (!staffView ||
        (session.status === "ACTIVE" && session.assignedStaffId !== auth.profile.id))
    ) {
      return NextResponse.json({ error: "Listener session not found." }, { status: 404 });
    }

    return NextResponse.json(sessionResponse(session));
  } catch (error) {
    console.error("Failed to fetch listener session:", error);
    return NextResponse.json(
      { error: "Could not load this listener session." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to update this listener session." },
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
    const status =
      body && typeof body === "object" && "status" in body ? body.status : undefined;
    if (status !== "ACTIVE" && status !== "CLOSED") {
      return NextResponse.json({ error: "Invalid listener session status." }, { status: 400 });
    }

    const { sessionId } = await params;
    const session = await prisma.listenerSession.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true, status: true, assignedStaffId: true },
    });
    if (!session) {
      return NextResponse.json({ error: "Listener session not found." }, { status: 404 });
    }

    const staffView = auth.isListener;
    const ownsSession = session.userId === auth.profile.id;
    if (status === "ACTIVE") {
      if (!staffView) {
        return NextResponse.json({ error: "Only listener staff can accept sessions." }, { status: 403 });
      }
      if (
        session.status !== "WAITING" &&
        !(session.status === "ACTIVE" && session.assignedStaffId === auth.profile.id)
      ) {
        return NextResponse.json(
          { error: "This session is already assigned to another listener." },
          { status: 409 }
        );
      }

      if (session.status === "WAITING") {
        const claimed = await prisma.listenerSession.updateMany({
          where: { id: session.id, status: "WAITING" },
          data: { status: "ACTIVE", assignedStaffId: auth.profile.id },
        });
        if (claimed.count !== 1) {
          return NextResponse.json(
            { error: "Another listener accepted this session first." },
            { status: 409 }
          );
        }
      }
    } else {
      if (
        !ownsSession &&
        (!staffView || session.assignedStaffId !== auth.profile.id)
      ) {
        return NextResponse.json({ error: "Listener session not found." }, { status: 404 });
      }
      await prisma.listenerSession.update({
        where: { id: session.id },
        data: { status: "CLOSED" },
      });
    }

    return NextResponse.json({ status });
  } catch (error) {
    console.error("Failed to update listener session:", error);
    return NextResponse.json(
      { error: "Could not update this listener session." },
      { status: 500 }
    );
  }
}
