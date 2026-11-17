import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ensureLocalProfile,
  getAuthenticatedUser,
  isClerkConfigured,
  LOCAL_SESSION_COOKIE,
} from "@/lib/requestAuth";

export async function GET() {
  if (isClerkConfigured()) {
    return NextResponse.json({ clerkEnabled: true, signedIn: false, userId: null });
  }

  const auth = await getAuthenticatedUser();
  if (!auth.user) {
    return NextResponse.json({ clerkEnabled: false, signedIn: false, userId: null });
  }

  return NextResponse.json({
    clerkEnabled: false,
    signedIn: true,
    userId: auth.profile.id,
    email: auth.profile.email,
  });
}

export async function POST(request: Request) {
  if (isClerkConfigured()) {
    return NextResponse.json(
      { error: "Clerk authentication is active." },
      { status: 400 }
    );
  }

  try {
    const body: unknown = await request.json().catch(() => ({}));
    const data = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const action = typeof data.action === "string" ? data.action : "signin";
    const cookieStore = await cookies();

    if (action === "signout") {
      cookieStore.delete(LOCAL_SESSION_COOKIE);
      return NextResponse.json({ signedIn: false, userId: null });
    }

    const rawEmail = typeof data.email === "string" ? data.email.trim() : "";
    const email = rawEmail || "scribe@quinspen.local";
    const penName =
      typeof data.penName === "string" && data.penName.trim()
        ? data.penName.trim().slice(0, 80)
        : undefined;

    const profile = await ensureLocalProfile(email, penName);
    const payload = JSON.stringify({
      email: profile.email,
      penName: profile.penName,
      role: "user",
    });

    cookieStore.set(LOCAL_SESSION_COOKIE, payload, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      signedIn: true,
      userId: profile.id,
      email: profile.email,
    });
  } catch (error) {
    console.error("Failed to process local auth request:", error);
    return NextResponse.json(
      { error: "Could not complete authentication." },
      { status: 500 }
    );
  }
}
