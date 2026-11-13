import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorStatus, getAuthenticatedUser } from "@/lib/requestAuth";

type RouteContext = { params: Promise<{ storyId: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to bookmark a story." },
      { status: authErrorStatus(auth.error) }
    );
  }

  try {
    const { storyId } = await params;
    const story = await prisma.story.findFirst({
      where: { id: storyId, isDraft: false },
      select: { id: true },
    });
    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    await prisma.bookmark.upsert({
      where: { storyId_userId: { storyId, userId: auth.profile.id } },
      create: { storyId, userId: auth.profile.id },
      update: {},
    });
    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    console.error("Failed to bookmark story:", error);
    return NextResponse.json(
      { error: "Could not save this story." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to remove a bookmark." },
      { status: authErrorStatus(auth.error) }
    );
  }

  try {
    const { storyId } = await params;
    await prisma.bookmark.deleteMany({
      where: { storyId, userId: auth.profile.id },
    });
    return NextResponse.json({ bookmarked: false });
  } catch (error) {
    console.error("Failed to remove bookmark:", error);
    return NextResponse.json(
      { error: "Could not remove this bookmark." },
      { status: 500 }
    );
  }
}
