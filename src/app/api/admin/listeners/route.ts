import { NextResponse, connection } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getAuthenticatedUser } from "@/lib/requestAuth";

export async function GET() {
  await connection();

  try {
    const auth = await getAuthenticatedUser();

    if (!auth.user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (!auth.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const client = await clerkClient();

    const result = await client.users.getUserList({
      limit: 100,
      orderBy: "-created_at",
    });

    const listeners = result.data
      .filter((user) =>
        ["listener", "admin"].includes(
          String(user.publicMetadata?.role)
        )
      )
      .map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress:
          user.emailAddresses.find(
            (email) => email.id === user.primaryEmailAddressId
          )?.emailAddress ?? null,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        role: user.publicMetadata?.role,
        listenerStatus:
          user.publicMetadata?.role === "listener"
            ? user.publicMetadata?.listenerStatus === "inactive"
              ? "inactive"
              : "active"
            : null,
      }));

    return NextResponse.json({
      success: true,
      totalCount: listeners.length,
      listeners,
    });
  } catch (error) {
    console.error("Admin listener list error:", error);

    return NextResponse.json(
      { error: "Could not retrieve listeners." },
      { status: 500 }
    );
  }
}
