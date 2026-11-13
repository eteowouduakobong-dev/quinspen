import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authErrorStatus,
  ensureDatabaseProfile,
  getAuthenticatedUser,
} from "@/lib/requestAuth";

type RouteContext = { params: Promise<{ storyId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to read community reflections." },
      { status: authErrorStatus(auth.error) }
    );
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "The story database is not configured." },
      { status: 503 }
    );
  }

  try {
    const { storyId } = await params;
    const story = await prisma.story.findFirst({
      where: { id: storyId, isDraft: false },
      select: { id: true, authorId: true },
    });
    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { storyId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      comments.map((comment) => ({
        id: comment.id,
        storyId: comment.storyId,
        content: comment.content,
        penNameSnapshot: comment.penNameSnapshot,
        avatarIcon: comment.avatarIcon,
        avatarColor: comment.avatarColor,
        isAuthor: comment.userId === story.authorId,
        createdAt: comment.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Failed to fetch story comments:", error);
    return NextResponse.json(
      { error: "Could not load reflections." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in before leaving a reflection." },
      { status: authErrorStatus(auth.error) }
    );
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "The story database is not configured." },
      { status: 503 }
    );
  }

  try {
    const body: unknown = await request.json();
    const content =
      body && typeof body === "object" && "content" in body
        ? body.content
        : undefined;
    if (typeof content !== "string" || !content.trim() || content.length > 2000) {
      return NextResponse.json(
        { error: "A reflection of up to 2,000 characters is required." },
        { status: 400 }
      );
    }

    const { storyId } = await params;
    const story = await prisma.story.findFirst({
      where: { id: storyId, isDraft: false },
      select: { id: true, authorId: true },
    });
    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    const profile = await ensureDatabaseProfile(auth.user);
    const comment = await prisma.comment.create({
      data: {
        storyId,
        userId: auth.user.id,
        content: content.trim(),
        penNameSnapshot: profile.penName,
        avatarIcon: profile.avatarIcon,
        avatarColor: profile.avatarColor,
      },
    });
    return NextResponse.json(
      {
        id: comment.id,
        storyId: comment.storyId,
        content: comment.content,
        penNameSnapshot: comment.penNameSnapshot,
        avatarIcon: comment.avatarIcon,
        avatarColor: comment.avatarColor,
        isAuthor: comment.userId === story.authorId,
        createdAt: comment.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create story reflection:", error);
    return NextResponse.json(
      { error: "Could not post your reflection. Please try again." },
      { status: 500 }
    );
  }
}
