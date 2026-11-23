import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getAuthenticatedUser } from "@/lib/requestAuth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ listenerId: string }> }
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

    const { listenerId } = await params;
    const body = await request.json();
    const action = body.action;

    const validActions = ["activate", "deactivate", "promote", "demote"];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action." },
        { status: 400 }
      );
    }

    if (action === "demote" && auth.user.id === listenerId) {
      return NextResponse.json(
        { error: "You cannot demote your own administrator account." },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const targetUser = await client.users.getUser(listenerId);
    const currentRole = targetUser.publicMetadata?.role;

    if (action === "activate" || action === "deactivate") {
      if (currentRole !== "listener") {
        return NextResponse.json(
          { error: "This account is not a registered listener." },
          { status: 404 }
        );
      }

      const listenerStatus =
        action === "deactivate" ? "inactive" : "active";

      const updatedUser = await client.users.updateUserMetadata(listenerId, {
        publicMetadata: {
          ...targetUser.publicMetadata,
          listenerStatus,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          action === "deactivate"
            ? "Listener deactivated successfully."
            : "Listener activated successfully.",
        listener: {
          id: updatedUser.id,
          role: updatedUser.publicMetadata.role,
          listenerStatus: updatedUser.publicMetadata.listenerStatus,
        },
      });
    }

    if (action === "promote") {
      if (currentRole !== "listener") {
        return NextResponse.json(
          { error: "Only registered listeners can be promoted." },
          { status: 400 }
        );
      }

      const updatedUser = await client.users.updateUserMetadata(listenerId, {
        publicMetadata: {
          ...targetUser.publicMetadata,
          role: "admin",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Listener promoted to administrator successfully.",
        listener: {
          id: updatedUser.id,
          role: updatedUser.publicMetadata.role,
        },
      });
    }

    if (currentRole !== "admin") {
      return NextResponse.json(
        { error: "This account is not an administrator." },
        { status: 400 }
      );
    }

    const updatedUser = await client.users.updateUserMetadata(listenerId, {
      publicMetadata: {
        ...targetUser.publicMetadata,
        role: "listener",
        listenerStatus: "active",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Administrator demoted to listener successfully.",
      listener: {
        id: updatedUser.id,
        role: updatedUser.publicMetadata.role,
        listenerStatus: updatedUser.publicMetadata.listenerStatus,
      },
    });
  } catch (error) {
    console.error("Listener role/status update error:", error);

    return NextResponse.json(
      { error: "Could not update account permissions." },
      { status: 500 }
    );
  }
}
