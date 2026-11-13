import { auth, currentUser } from "@clerk/nextjs/server";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import type { User as DatabaseUser } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generatePenIdentity, generatePenTag } from "@/lib/penIdentity";

export type AuthError = "not-configured" | "unauthenticated";

export type AuthSuccess = {
  user: ClerkUser;
  profile: DatabaseUser;
  isListener: boolean;
  error: null;
};

export type AuthFailure = {
  user: null;
  profile: null;
  isListener: false;
  error: AuthError;
};

export type AuthResult = AuthSuccess | AuthFailure;

function clerkEmail(user: ClerkUser): string | null {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null
  );
}

export async function getAuthenticatedUser(): Promise<AuthResult> {
  if (
    !process.env.CLERK_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ) {
    return {
      user: null,
      profile: null,
      isListener: false,
      error: "not-configured",
    };
  }

  let user: ClerkUser | null = null;
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        user: null,
        profile: null,
        isListener: false,
        error: "unauthenticated",
      };
    }
    user = await currentUser();
  } catch (error) {
    console.error("Failed to verify the Clerk session:", error);
  }

  if (!user) {
    return {
      user: null,
      profile: null,
      isListener: false,
      error: "unauthenticated",
    };
  }

  const profile = await ensureDatabaseProfile(user);
  return {
    user,
    profile,
    isListener: isListenerStaff(user),
    error: null,
  };
}

export function isListenerStaff(user: ClerkUser): boolean {
  return user.publicMetadata?.role === "listener";
}

export function authErrorStatus(error: AuthError): number {
  return error === "not-configured" ? 503 : 401;
}

export async function uniquePenTag(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const penTag = generatePenTag();
    const existing = await prisma.user.findUnique({
      where: { penTag },
      select: { id: true },
    });
    if (!existing) return penTag;
  }
  throw new Error("Could not allocate a unique pen tag.");
}

export async function ensureDatabaseProfile(user: ClerkUser) {
  if (!process.env.DATABASE_URL) {
    throw new Error("The database is not configured.");
  }

  const email = clerkEmail(user);
  if (!email) {
    throw new Error("Your Clerk account does not have an email address.");
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { clerkId: user.id },
        { email: { equals: email, mode: "insensitive" } },
      ],
    },
  });

  if (existing) {
    if (existing.clerkId && existing.clerkId !== user.id) {
      throw new Error("This email is already linked to another account.");
    }
    return prisma.user.update({
      where: { id: existing.id },
      data: { clerkId: user.id, email },
    });
  }

  const metadata = user.unsafeMetadata ?? {};
  const generated = generatePenIdentity();
  const penName =
    typeof metadata.penName === "string" && metadata.penName.trim()
      ? metadata.penName.trim().slice(0, 80)
      : generated.penName;
  const bio =
    typeof metadata.bio === "string" && metadata.bio.trim()
      ? metadata.bio.trim().slice(0, 280)
      : null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.user.create({
        data: {
          clerkId: user.id,
          email,
          penName,
          penTag: await uniquePenTag(),
          avatarIcon:
            typeof metadata.avatarIcon === "string"
              ? metadata.avatarIcon
              : "feather",
          avatarColor:
            typeof metadata.avatarColor === "string"
              ? metadata.avatarColor
              : "amber",
          bio,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const raced = await prisma.user.findFirst({
          where: {
            OR: [
              { clerkId: user.id },
              { email: { equals: email, mode: "insensitive" } },
            ],
          },
        });
        if (raced) {
          return prisma.user.update({
            where: { id: raced.id },
            data: { clerkId: user.id, email },
          });
        }
        continue;
      }
      throw error;
    }
  }

  throw new Error("Could not create your anonymous profile.");
}
