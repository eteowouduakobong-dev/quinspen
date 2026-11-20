import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getAuthenticatedUser } from "@/lib/requestAuth";

export async function POST(request: Request) {
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

    const body = await request.json();
    const emailAddress =
      typeof body.emailAddress === "string"
        ? body.emailAddress.trim().toLowerCase()
        : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    const invitation = await client.invitations.createInvitation({
      emailAddress,
      publicMetadata: { role: "listener" },
      notify: true,
      expiresInDays: 30,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Listener invitation created successfully.",
        invitation: {
          id: invitation.id,
          emailAddress: invitation.emailAddress,
          status: invitation.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Listener invitation error:", error);

    return NextResponse.json(
      {
        error: "Could not create the invitation. The email may already be registered or invited.",
      },
      { status: 500 }
    );
  }
}
