import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getAuthenticatedUser } from "@/lib/requestAuth";

type UserRole = "user" | "listener" | "admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params;
    const body = await request.json();
    const newRole = body.role as UserRole;

    const validRoles: UserRole[] = ["user", "listener", "admin"];

    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid role. Choose user, listener, or admin." },
        { status: 400 }
      );
    }

    if (auth.user.id === userId && newRole !== "admin") {
      return NextResponse.json(
        { error: "You cannot remove your own administrator privileges." },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const targetUser = await client.users.getUser(userId);

    const { listenerStatus: _previousListenerStatus, ...existingMetadata } =
      targetUser.publicMetadata;

    const updatedUser = await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...existingMetadata,
        role: newRole,
        ...(newRole === "listener"
          ? { listenerStatus: "active" }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Account role updated to ${newRole} successfully.`,
      user: {
        id: updatedUser.id,
        role: updatedUser.publicMetadata.role,
        listenerStatus:
          updatedUser.publicMetadata.listenerStatus ?? null,
      },
    });
  } catch (error) {
    console.error("Admin user role update error:", error);

    return NextResponse.json(
      { error: "Could not update account permissions." },
      { status: 500 }
    );
  }
}
