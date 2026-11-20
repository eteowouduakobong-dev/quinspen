import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getAuthenticatedUser } from "@/lib/requestAuth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ invitationId: string }> }
) {
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

    const { invitationId } = await params;
    const client = await clerkClient();

    const result = await client.invitations.getInvitationList({
      query: invitationId,
      limit: 10,
    });

    const invitation = result.data.find(
      (item) => item.id === invitationId
    );

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found." },
        { status: 404 }
      );
    }

    if (invitation.publicMetadata?.role !== "listener") {
      return NextResponse.json(
        { error: "This is not a listener invitation." },
        { status: 403 }
      );
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending invitations can be revoked." },
        { status: 409 }
      );
    }

    await client.invitations.revokeInvitation(invitationId);

    return NextResponse.json({
      success: true,
      message: "Listener invitation revoked successfully.",
    });
  } catch (error) {
    console.error("Invitation revocation error:", error);

    return NextResponse.json(
      { error: "Could not revoke listener invitation." },
      { status: 500 }
    );
  }
}
