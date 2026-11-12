import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_STORIES } from "@/lib/quinspenData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const circle = searchParams.get("circle");
    const mood = searchParams.get("mood");

    // Attempt Prisma query if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      const whereClause: Record<string, unknown> = { isDraft: false };
      if (circle && circle !== "all") whereClause.circleCategory = circle;
      if (mood && mood !== "all") whereClause.mood = mood;

      const dbStories = await prisma.story.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              penName: true,
              penTag: true,
              avatarIcon: true,
              avatarColor: true,
              bio: true,
            },
          },
          reactions: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbStories && dbStories.length > 0) {
        return NextResponse.json(dbStories);
      }
    }

    // Fallback to initial stories catalog
    let result = INITIAL_STORIES;
    if (circle && circle !== "all") {
      result = result.filter((s) => s.circleCategory === circle);
    }
    if (mood && mood !== "all") {
      result = result.filter((s) => s.mood === mood);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return NextResponse.json(INITIAL_STORIES);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      circleCategory,
      mood,
      tags,
      isGhostMode,
      ghostAlias,
      authorId,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + `-${Math.floor(100 + Math.random() * 900)}`;

    const words = content.trim().split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

    if (process.env.DATABASE_URL && authorId) {
      const created = await prisma.story.create({
        data: {
          slug,
          title,
          content,
          excerpt: excerpt || content.slice(0, 180) + "...",
          circleCategory: circleCategory || "midnight-confessions",
          mood: mood || "Vulnerable",
          tags: tags || [],
          coverTheme: "twilight-ink",
          readTimeMinutes,
          isGhostMode: !!isGhostMode,
          ghostAlias: ghostAlias || null,
          authorId,
        },
      });
      return NextResponse.json(created, { status: 201 });
    }

    return NextResponse.json(
      {
        id: "story-" + Date.now(),
        slug,
        title,
        content,
        excerpt: excerpt || content.slice(0, 180) + "...",
        circleCategory,
        mood,
        tags: tags || [],
        readTimeMinutes,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
