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

    const directoryUsers: Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      emailAddress: string | null;
      createdAt: number;
      lastSignInAt: number | null;
      role: "user" | "listener" | "admin";
      listenerStatus: "active" | "inactive" | null;
    }> = [];

    let offset = 0;
    const limit = 100;

    while (true) {
      const result = await client.users.getUserList({
        limit,
        offset,
        orderBy: "-created_at",
      });

      const pageUsers = result.data.map((user) => {
        const currentRole = user.publicMetadata?.role;

        const role: "user" | "listener" | "admin" =
          currentRole === "listener" || currentRole === "admin"
            ? currentRole
            : "user";

        const listenerStatus: "active" | "inactive" | null =
          role === "listener"
            ? user.publicMetadata?.listenerStatus === "inactive"
              ? "inactive"
              : "active"
            : null;

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress:
            user.emailAddresses.find(
              (email) => email.id === user.primaryEmailAddressId
            )?.emailAddress ?? null,
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
          role,
          listenerStatus,
        };
      });

      directoryUsers.push(...pageUsers);

      offset += result.data.length;

      if (
        result.data.length === 0 ||
        offset >= result.totalCount ||
        result.data.length < limit
      ) {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      totalCount: directoryUsers.length,
      users: directoryUsers,
    });
  } catch (error) {
    console.error("Admin user directory error:", error);

    return NextResponse.json(
      { error: "Could not retrieve the user directory." },
      { status: 500 }
    );
  }
}


