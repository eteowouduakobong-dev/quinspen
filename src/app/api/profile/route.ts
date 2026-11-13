import { NextResponse } from "next/server";
import type { User as DatabaseUser } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  authErrorStatus,
  getAuthenticatedUser,
  uniquePenTag,
} from "@/lib/requestAuth";
import { generatePenIdentity } from "@/lib/penIdentity";

const AVATAR_ICONS = [
  "feather",
  "moon",
  "star",
  "flame",
  "compass",
  "book",
  "mask",
  "sparkle",
] as const;

const AVATAR_COLORS = [
  "amber",
  "indigo",
  "emerald",
  "rose",
  "violet",
  "cyan",
  "slate",
] as const;

function profileResponse(profile: DatabaseUser) {
  return {
    id: profile.id,
    email: profile.email,
    penName: profile.penName,
    penTag: profile.penTag,
    avatarIcon: profile.avatarIcon,
    avatarColor: profile.avatarColor,
    bio: profile.bio,
    createdAt: profile.createdAt.toISOString(),
  };
}

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to access your profile." },
      { status: authErrorStatus(auth.error) }
    );
  }

  return NextResponse.json(profileResponse(auth.profile));
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json(
      { error: "Sign in to update your profile." },
      { status: authErrorStatus(auth.error) }
    );
  }

  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
    }
    const data = body as Record<string, unknown>;

    if (data.regenerateIdentity === true) {
      const generated = generatePenIdentity();
      const profile = await prisma.user.update({
        where: { id: auth.profile.id },
        data: {
          penName: generated.penName,
          penTag: await uniquePenTag(),
        },
      });
      return NextResponse.json(profileResponse(profile));
    }

    const updates: {
      penName?: string;
      bio?: string | null;
      avatarIcon?: string;
      avatarColor?: string;
    } = {};

    if ("penName" in data) {
      if (
        typeof data.penName !== "string" ||
        !data.penName.trim() ||
        data.penName.trim().length > 80
      ) {
        return NextResponse.json(
          { error: "Pen names must be between 1 and 80 characters." },
          { status: 400 }
        );
      }
      updates.penName = data.penName.trim();
    }

    if ("bio" in data) {
      if (typeof data.bio !== "string" || data.bio.length > 280) {
        return NextResponse.json(
          { error: "Bios must be 280 characters or fewer." },
          { status: 400 }
        );
      }
      updates.bio = data.bio.trim() || null;
    }

    if ("avatarIcon" in data) {
      if (
        typeof data.avatarIcon !== "string" ||
        !AVATAR_ICONS.includes(data.avatarIcon as (typeof AVATAR_ICONS)[number])
      ) {
        return NextResponse.json({ error: "Invalid avatar icon." }, { status: 400 });
      }
      updates.avatarIcon = data.avatarIcon;
    }

    if ("avatarColor" in data) {
      if (
        typeof data.avatarColor !== "string" ||
        !AVATAR_COLORS.includes(
          data.avatarColor as (typeof AVATAR_COLORS)[number]
        )
      ) {
        return NextResponse.json({ error: "Invalid avatar color." }, { status: 400 });
      }
      updates.avatarColor = data.avatarColor;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No profile changes were provided." }, { status: 400 });
    }

    const profile = await prisma.user.update({
      where: { id: auth.profile.id },
      data: updates,
    });
    return NextResponse.json(profileResponse(profile));
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Could not update your profile." },
      { status: 500 }
    );
  }
}
