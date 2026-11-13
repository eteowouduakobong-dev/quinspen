import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { UserJSON } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generatePenIdentity } from "@/lib/penIdentity";
import { uniquePenTag } from "@/lib/requestAuth";

function emailFromUser(user: UserJSON): string | null {
  const primary = user.email_addresses.find(
    (email) => email.id === user.primary_email_address_id
  );
  return primary?.email_address ?? user.email_addresses[0]?.email_address ?? null;
}

async function syncUser(user: UserJSON) {
  const email = emailFromUser(user);
  if (!email) return;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { clerkId: user.id },
        { email: { equals: email, mode: "insensitive" } },
      ],
    },
  });
  if (existing) {
    if (existing.clerkId && existing.clerkId !== user.id) {
      throw new Error("Email is already linked to another Clerk account.");
    }
    await prisma.user.update({
      where: { id: existing.id },
      data: { clerkId: user.id, email },
    });
    return;
  }

  const metal = user.unsafe_metadata ?? {};
  const generated = generatePenIdentity();
  await prisma.user.create({
    data: {
      clerkId: user.id,
      email,
      penName:
        typeof metal.penName === "string" && metal.penName.trim()
          ? metal.penName.trim().slice(0, 80)
          : generated.penName,
      penTag: await uniquePenTag(),
      bio:
        typeof metal.bio === "string" && metal.bio.trim()
          ? metal.bio.trim().slice(0, 280)
          : null,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await syncUser(event.data);
        break;
      case "user.deleted":
        if (event.data.id) {
          await prisma.user.deleteMany({ where: { clerkId: event.data.id } });
        }
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook verification or processing failed:", error);
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
}
