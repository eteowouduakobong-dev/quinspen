import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authErrorStatus,
  ensureDatabaseProfile,
  getAuthenticatedUser,
} from "@/lib/requestAuth";
import { isReactionType } from "@/lib/storyDto";
import { ReactionType } from "@/types/quinspen";

type RouteContext = { params: Promise<{ storyId: string }> };

const EMPTY_COUNTS: Record<ReactionType, number> = {
  FELT_THIS: 0,
  VIRTUAL_HUG: 0,
  INSPIRED: 0,
  CATHARTIC: 0,
  POETIC: 0,
};

async function updateReaction(
  request: Request,
  { params }: RouteContext,
  shouldAdd: boolean
) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in before reacting to a story." },
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
    const type =
      body && typeof body === "object" && "type" in body ? body.type : undefined;
    if (!isReactionType(type)) {
      return NextResponse.json({ error: "Choose a valid reaction." }, { status: 400 });
    }

    const { storyId } = await params;
    const story = await prisma.story.findFirst({
      where: { id: storyId, isDraft: false },
      select: { id: true },
    });
    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    await ensureDatabaseProfile(auth.user);
    const uniqueKey = {
      storyId_userId_type: { storyId, userId: auth.user.id, type },
    };
    if (shouldAdd) {
      await prisma.reaction.upsert({
        where: uniqueKey,
        create: { storyId, userId: auth.user.id, type },
        update: {},
      });
    } else {
      await prisma.reaction.deleteMany({
        where: { storyId, userId: auth.user.id, type },
      });
    }

    const [groups, userReactions] = await Promise.all([
      prisma.reaction.groupBy({
        by: ["type"],
        where: { storyId },
        _count: { _all: true },
      }),
      prisma.reaction.findMany({
        where: { storyId, userId: auth.user.id },
        select: { type: true },
      }),
    ]);

    const counts = { ...EMPTY_COUNTS };
    for (const group of groups) {
      if (isReactionType(group.type)) counts[group.type] = group._count._all;
    }

    return NextResponse.json({
      counts,
      userReactions: userReactions
        .map((reaction) => reaction.type)
        .filter(isReactionType),
    });
  } catch (error) {
    console.error("Failed to update story reaction:", error);
    return NextResponse.json(
      { error: "Could not save your reaction. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  return updateReaction(request, context, true);
}

export async function DELETE(request: Request, context: RouteContext) {
  return updateReaction(request, context, false);
}
