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

    const result = await client.invitations.getInvitationList({
      limit: 100,
      orderBy: "-created_at",
    });

    const invitations = result.data
      .filter(
        (invitation) =>
          invitation.publicMetadata?.role === "listener"
      )
      .map((invitation) => ({
        id: invitation.id,
        emailAddress: invitation.emailAddress,
        status: invitation.status,
        createdAt: invitation.createdAt,
        revoked: invitation.revoked ?? false,
      }));

    return NextResponse.json({
      success: true,
      totalCount: invitations.length,
      invitations,
    });
  } catch (error) {
    console.error("Admin invitation list error:", error);

    return NextResponse.json(
      { error: "Could not retrieve listener invitations." },
      { status: 500 }
    );
  }
}
