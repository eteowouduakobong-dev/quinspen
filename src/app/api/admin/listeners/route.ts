import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getAuthenticatedUser } from "@/lib/requestAuth";

export async function GET() {
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
      .filter((user) => user.publicMetadata?.role === "listener")
      .map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddresses.find(
          (email) => email.id === user.primaryEmailAddressId
        )?.emailAddress ?? null,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        listenerStatus: user.publicMetadata?.listenerStatus === "inactive" ? "inactive" : "active",
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

