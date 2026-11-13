import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorStatus, getAuthenticatedUser } from "@/lib/requestAuth";

export async function GET() {
  await connection();
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to view your bookmarks." },
      { status: authErrorStatus(auth.error) }
    );
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: auth.profile.id },
      select: { storyId: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ storyIds: bookmarks.map((bookmark) => bookmark.storyId) });
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    return NextResponse.json(
      { error: "Could not load your bookmarks." },
      { status: 500 }
    );
  }
}
