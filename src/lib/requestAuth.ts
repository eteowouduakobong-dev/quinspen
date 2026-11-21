import { auth, currentUser } from "@clerk/nextjs/server";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import type { User as DatabaseUser } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { isPrismaMocked, prisma } from "@/lib/prisma";
import { generatePenIdentity, generatePenTag } from "@/lib/penIdentity";

export const LOCAL_SESSION_COOKIE = "quinspen_local_session";

export type AuthError = "not-configured" | "unauthenticated";

export type AuthSuccess = {
  user: ClerkUser;
  profile: DatabaseUser;
  isListener: boolean;
  isAdmin: boolean;
  error: null;
};

export type AuthFailure = {
  user: null;
  profile: null;
  isListener: false;
  isAdmin: false;
  error: AuthError;
};

export type AuthResult = AuthSuccess | AuthFailure;

export function isClerkConfigured(): boolean {
  return Boolean(
    process.env.CLERK_SECRET_KEY &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );
}

function clerkEmail(user: ClerkUser): string | null {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null
  );
}

interface LocalSessionPayload {
  email: string;
  penName?: string;
  role?: string;
}

export async function ensureLocalProfile(
  email: string,
  preferredPenName?: string
): Promise<DatabaseUser> {
  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    return existing;
  }

  const generated = generatePenIdentity();
  const penName = preferredPenName?.trim()
    ? preferredPenName.trim().slice(0, 80)
    : generated.penName;

  return prisma.user.create({
    data: {
      clerkId: `local_${email.toLowerCase()}`,
      email,
      penName,
      penTag: await uniquePenTag(),
      avatarIcon: "feather",
      avatarColor: "amber",
      bio: null,
    },
  });
}

async function getLocalAuthenticatedUser(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(LOCAL_SESSION_COOKIE)?.value;
    if (!raw) {
      return {
        user: null,
        profile: null,
        isListener: false,
        isAdmin: false,
        error: "unauthenticated",
      };
    }

    const parsed = JSON.parse(raw) as Partial<LocalSessionPayload>;
    if (!parsed || typeof parsed.email !== "string" || !parsed.email.trim()) {
      return {
        user: null,
        profile: null,
        isListener: false,
        isAdmin: false,
        error: "unauthenticated",
      };
    }

    const profile = await ensureLocalProfile(
      parsed.email.trim(),
      typeof parsed.penName === "string" ? parsed.penName : undefined
    );
    const isListener = false;

    return {
      user: {
        id: profile.clerkId ?? profile.id,
        publicMetadata: { role: isListener ? "listener" : "user" },
      } as unknown as ClerkUser,
      profile,
      isListener,
      isAdmin: false,
      error: null,
    };
  } catch (error) {
    console.error("Failed to verify local session:", error);
    return {
      user: null,
      profile: null,
      isListener: false,
      isAdmin: false,
      error: "unauthenticated",
    };
  }
}

export async function getAuthenticatedUser(): Promise<AuthResult> {
  if (!isClerkConfigured()) {
    return getLocalAuthenticatedUser();
  }

  let user: ClerkUser | null = null;
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        user: null,
        profile: null,
        isListener: false,
        isAdmin: false,
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
      isAdmin: false,
      error: "unauthenticated",
    };
  }

  const profile = await ensureDatabaseProfile(user);
  return {
    user,
    profile,
    isListener: isListenerStaff(user),
    isAdmin: isAdminStaff(user),
    error: null,
  };
}

export function isListenerStaff(user: ClerkUser): boolean {
  return user.publicMetadata?.role === "listener" && user.publicMetadata?.listenerStatus !== "inactive";
}
export function isAdminStaff(user: ClerkUser): boolean {
  return user.publicMetadata?.role === "admin";
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
  if (!process.env.DATABASE_URL && !isPrismaMocked) {
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

