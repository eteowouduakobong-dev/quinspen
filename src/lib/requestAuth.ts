import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type AuthResult =
  | { user: SupabaseUser; error: null }
  | { user: null; error: "not-configured" | "unauthenticated" };

export async function getAuthenticatedUser(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { user: null, error: "not-configured" };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Failed to verify the Supabase session:", error);
  }
  if (error || !data.user) {
    return { user: null, error: "unauthenticated" };
  }

  return { user: data.user, error: null };
}

export function isListenerStaff(email: string | undefined): boolean {
  if (!email) return false;
  const staffEmails = (process.env.LISTENER_STAFF_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return staffEmails.includes(email.toLowerCase());
}

export function authErrorStatus(error: "not-configured" | "unauthenticated"): number {
  return error === "not-configured" ? 503 : 401;
}

export async function ensureDatabaseProfile(user: SupabaseUser) {
  if (!process.env.DATABASE_URL) {
    throw new Error("The database is not configured.");
  }

  const { prisma } = await import("@/lib/prisma");
  const metadata = user.user_metadata || {};
  const penName =
    typeof metadata.penName === "string" && metadata.penName.trim()
      ? metadata.penName.trim()
      : "Anonymous Scribe";

  return prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email || "",
      penName,
      penTag:
        typeof metadata.penTag === "string"
          ? metadata.penTag
          : `scribe_${user.id.slice(0, 8)}`,
      avatarIcon:
        typeof metadata.avatarIcon === "string" ? metadata.avatarIcon : "feather",
      avatarColor:
        typeof metadata.avatarColor === "string" ? metadata.avatarColor : "amber",
      bio: typeof metadata.bio === "string" ? metadata.bio : null,
    },
    update: { email: user.email || "" },
  });
}
