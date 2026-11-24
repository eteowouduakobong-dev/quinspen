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

    // Check whether this email already belongs to a Clerk account.
    const existingUsers = await client.users.getUserList({
      emailAddress: [emailAddress],
      limit: 10,
    });

    const existingUser = existingUsers.data.find((user) =>
      user.emailAddresses.some(
        (email) =>
          email.emailAddress.toLowerCase() === emailAddress
      )
    );

    if (existingUser) {
      const matchingEmail = existingUser.emailAddresses.find(
        (email) =>
          email.emailAddress.toLowerCase() === emailAddress
      );

      if (matchingEmail?.verification?.status !== "verified") {
        return NextResponse.json(
          {
            error:
              "This account exists, but the email address is not verified. The user must verify their email before receiving Listener access.",
          },
          { status: 409 }
        );
      }

      const currentRole = existingUser.publicMetadata?.role;

      if (currentRole === "listener") {
        return NextResponse.json(
          { error: "This account is already a Listener." },
          { status: 409 }
        );
      }

      if (currentRole === "admin") {
        return NextResponse.json(
          { error: "This account already has administrator privileges." },
          { status: 409 }
        );
      }

      if (currentRole !== undefined && currentRole !== "user") {
        return NextResponse.json(
          { error: "This account has an unsupported role and cannot be assigned Listener access automatically." },
          { status: 409 }
        );
      }

      const updatedUser = await client.users.updateUserMetadata(
        existingUser.id,
        {
          publicMetadata: {
            ...existingUser.publicMetadata,
            role: "listener",
            listenerStatus: "active",
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Existing account successfully granted Listener access.",
        accountType: "existing",
        listener: {
          id: updatedUser.id,
          emailAddress,
          role: updatedUser.publicMetadata.role,
          listenerStatus: updatedUser.publicMetadata.listenerStatus,
        },
      });
    }

    // No existing account: send the normal Clerk invitation.
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
        accountType: "new",
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
        error: "Could not process the Listener request. Please try again.",
      },
      { status: 500 }
    );
  }
}
