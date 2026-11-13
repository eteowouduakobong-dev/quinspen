import { Prisma } from "@prisma/client";
import type { WhisperConnectionItem } from "@/types/quinspen";

export const WHISPER_INCLUDE = {
  story: { select: { title: true } },
  initiator: {
    select: { id: true, penName: true, avatarIcon: true, avatarColor: true },
  },
  recipient: {
    select: { id: true, penName: true, avatarIcon: true, avatarColor: true },
  },
  messages: {
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, penName: true, avatarIcon: true, avatarColor: true },
      },
    },
  },
} satisfies Prisma.WhisperConnectionInclude;

export type WhisperRecord = Prisma.WhisperConnectionGetPayload<{
  include: typeof WHISPER_INCLUDE;
}>;

export function toWhisperItem(
  connection: WhisperRecord,
  currentUserId: string
): WhisperConnectionItem {
  const messages = connection.messages.map((message) => ({
    id: message.id,
    connectionId: message.connectionId,
    senderId: message.senderId,
    senderPenName: message.sender.penName,
    senderAvatarIcon: message.sender.avatarIcon,
    senderAvatarColor: message.sender.avatarColor,
    content: message.content,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
  }));
  const lastMessage = messages[messages.length - 1];

  return {
    id: connection.id,
    storyId: connection.storyId ?? undefined,
    storyTitle: connection.story?.title,
    initiatorId: connection.initiator.id,
    initiatorPenName: connection.initiator.penName,
    initiatorAvatarIcon: connection.initiator.avatarIcon,
    initiatorAvatarColor: connection.initiator.avatarColor,
    recipientId: connection.recipient.id,
    recipientPenName: connection.recipient.penName,
    recipientAvatarIcon: connection.recipient.avatarIcon,
    recipientAvatarColor: connection.recipient.avatarColor,
    status: connection.status as WhisperConnectionItem["status"],
    initialNote: connection.initialNote,
    lastMessage: lastMessage?.content,
    lastMessageAt: lastMessage?.createdAt,
    unreadCount: connection.messages.filter(
      (message) => message.senderId !== currentUserId && !message.isRead
    ).length,
    createdAt: connection.createdAt.toISOString(),
    updatedAt: connection.updatedAt.toISOString(),
    messages,
  };
}
