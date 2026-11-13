import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorStatus, getAuthenticatedUser } from "@/lib/requestAuth";

type RouteContext = { params: Promise<{ storyId: string }> };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to delete your story." },
      { status: authErrorStatus(auth.error) }
    );
  }

  try {
    const { storyId } = await params;
    const result = await prisma.story.deleteMany({
      where: { id: storyId, authorId: auth.profile.id },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete story:", error);
    return NextResponse.json(
      { error: "Could not delete this story." },
      { status: 500 }
    );
  }
}
