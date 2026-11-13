import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authErrorStatus,
  ensureDatabaseProfile,
  getAuthenticatedUser,
} from "@/lib/requestAuth";
import { STORY_CIRCLES } from "@/lib/quinspenData";
import { STORY_INCLUDE, toStoryItem } from "@/lib/storyDto";
import { randomUUID } from "crypto";

const MOODS = [
  "Vulnerable",
  "Nostalgic",
  "Confessional",
  "Hopeful",
  "Cathartic",
  "Poetic",
  "Bittersweet",
] as const;

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Please sign in to view community stories." },
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
    const { searchParams } = new URL(request.url);
    const circle = searchParams.get("circle");
    const mood = searchParams.get("mood");
    const stories = await prisma.story.findMany({
      where: {
        isDraft: false,
        ...(circle && circle !== "all" ? { circleCategory: circle } : {}),
        ...(mood && mood !== "all" ? { mood } : {}),
      },
      include: STORY_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(stories.map((story) => toStoryItem(story, auth.user.id)));
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return NextResponse.json(
      { error: "Could not load community stories." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in before publishing a story." },
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
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid story data." }, { status: 400 });
    }
    const data = body as Record<string, unknown>;
    const {
      title,
      content,
      circleCategory,
      mood,
      tags,
      isGhostMode,
      ghostAlias,
    } = data;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 180 ||
      typeof content !== "string" ||
      !content.trim() ||
      content.trim().length > 50000
    ) {
      return NextResponse.json(
        { error: "A title and story between 1 and 50,000 characters are required." },
        { status: 400 }
      );
    }

    const validCircle =
      typeof circleCategory === "string" &&
      STORY_CIRCLES.some((circle) => circle.slug === circleCategory);
    const validMood = typeof mood === "string" && MOODS.includes(mood as (typeof MOODS)[number]);
    if (!validCircle || !validMood) {
      return NextResponse.json(
        { error: "Choose a valid story circle and mood." },
        { status: 400 }
      );
    }

    const cleanTags = Array.isArray(tags)
      ? tags
          .filter((tag): tag is string => typeof tag === "string")
          .map((tag) => tag.trim().slice(0, 32))
          .filter(Boolean)
          .slice(0, 10)
      : [];
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + `-${randomUUID().slice(0, 8)}`;

    const words = content.trim().split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
    const author = await ensureDatabaseProfile(auth.user);
    const created = await prisma.story.create({
      data: {
        slug,
        title: title.trim(),
        content: content.trim(),
        excerpt: content.trim().slice(0, 180),
        circleCategory,
        mood,
        tags: cleanTags,
        coverTheme: "twilight-ink",
        readTimeMinutes,
        isGhostMode: isGhostMode === true,
        ghostAlias:
          isGhostMode === true && typeof ghostAlias === "string"
            ? ghostAlias.trim().slice(0, 60) || "Nameless Scribe"
            : null,
        authorId: author.id,
      },
      include: STORY_INCLUDE,
    });
    return NextResponse.json(toStoryItem(created, auth.user.id), { status: 201 });
  } catch (error) {
    console.error("Failed to create story:", error);
    return NextResponse.json(
      { error: "Could not publish the story. Please try again." },
      { status: 500 }
    );
  }
}
