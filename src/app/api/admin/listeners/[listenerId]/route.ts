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

    if (body.action !== "activate" && body.action !== "deactivate") {
      return NextResponse.json(
        { error: "Action must be activate or deactivate." },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const listener = await client.users.getUser(listenerId);

    if (listener.publicMetadata?.role !== "listener") {
      return NextResponse.json(
        { error: "This account is not a registered listener." },
        { status: 404 }
      );
    }

    const listenerStatus =
      body.action === "deactivate" ? "inactive" : "active";

    const updatedUser = await client.users.updateUserMetadata(listenerId, {
      publicMetadata: {
        listenerStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        body.action === "deactivate"
          ? "Listener deactivated successfully."
          : "Listener activated successfully.",
      listener: {
        id: updatedUser.id,
        role: updatedUser.publicMetadata.role,
        listenerStatus: updatedUser.publicMetadata.listenerStatus,
      },
    });
  } catch (error) {
    console.error("Listener status update error:", error);

    return NextResponse.json(
      { error: "Could not update listener status." },
      { status: 500 }
    );
  }
}
