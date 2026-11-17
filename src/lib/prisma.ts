import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

interface MockUser {
  id: string;
  clerkId: string | null;
  email: string;
  penName: string;
  penTag: string;
  avatarIcon: string;
  avatarColor: string;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockStory {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  mood: string;
  circleCategory: string;
  tags: string[];
  coverTheme: string;
  readTimeMinutes: number;
  isDraft: boolean;
  isGhostMode: boolean;
  ghostAlias: string | null;
  viewCount: number;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockReaction {
  id: string;
  storyId: string;
  userId: string;
  type: string;
  createdAt: Date;
}

interface MockComment {
  id: string;
  storyId: string;
  userId: string;
  content: string;
  penNameSnapshot: string;
  avatarIcon: string;
  avatarColor: string;
  isAuthor: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MockBookmark {
  id: string;
  storyId: string;
  userId: string;
  createdAt: Date;
}

interface MockWhisperConnection {
  id: string;
  storyId: string | null;
  initiatorId: string;
  recipientId: string;
  status: string;
  initialNote: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockWhisperMessage {
  id: string;
  connectionId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

interface MockListenerSession {
  id: string;
  userId: string;
  penName: string;
  topic: string;
  status: string;
  assignedStaffId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockListenerMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  content: string;
  createdAt: Date;
}

interface MockStore {
  users: MockUser[];
  stories: MockStory[];
  reactions: MockReaction[];
  comments: MockComment[];
  bookmarks: MockBookmark[];
  whisperConnections: MockWhisperConnection[];
  whisperMessages: MockWhisperMessage[];
  listenerSessions: MockListenerSession[];
  listenerMessages: MockListenerMessage[];
}

function createInitialMockStore(): MockStore {
  const now = new Date();
  const earlier1 = new Date(now.getTime() - 1000 * 60 * 60 * 5);
  const earlier2 = new Date(now.getTime() - 1000 * 60 * 60 * 18);
  const earlier3 = new Date(now.getTime() - 1000 * 60 * 60 * 36);

  const author1: MockUser = {
    id: "mock-author-1",
    clerkId: null,
    email: "velvet@quinspen.internal",
    penName: "Velvet Lantern",
    penTag: "scribe_204119",
    avatarIcon: "moon",
    avatarColor: "indigo",
    bio: "Collecting quiet truths after midnight.",
    createdAt: earlier3,
    updatedAt: earlier3,
  };

  const author2: MockUser = {
    id: "mock-author-2",
    clerkId: null,
    email: "cobalt@quinspen.internal",
    penName: "Cobalt Voyager",
    penTag: "scribe_583902",
    avatarIcon: "compass",
    avatarColor: "amber",
    bio: "Writing letters I never knew how to mail.",
    createdAt: earlier3,
    updatedAt: earlier3,
  };

  const stories: MockStory[] = [
    {
      id: "story-seed-1",
      slug: "the-train-platform-goodbye-i-never-said",
      title: "The Train Platform Goodbye I Never Said",
      excerpt:
        "We stood beneath the flickering yellow station lamp for eleven minutes while the rain turned our coats dark, rehearsing every safe phrase except the one that mattered.",
      content:
        "We stood beneath the flickering yellow station lamp for eleven minutes while the rain turned our coats dark, rehearsing every safe phrase except the one that mattered.\n\nYou asked if I had enough change for the transfer at Union. I nodded, adjusted my scarf, and stared at the wet timetable bolted to the brick pillar. Inside my coat pocket, my hand was closed around an unmailed postcard I had written three Thursdays earlier.\n\n---\n\n\"Sometimes silence is not the absence of feeling, only the fear of what happens once it is spoken aloud.\"\n\n---\n\nWhen the doors hissed shut, you raised two fingers to the glass. I stood there long after the red tail lights vanished into the fog, finally realizing that letting someone go gently still leaves an echo that lasts for years.",
      mood: "Bittersweet",
      circleCategory: "unspoken-love",
      tags: ["farewell", "rain", "unspoken"],
      coverTheme: "twilight-ink",
      readTimeMinutes: 2,
      isDraft: false,
      isGhostMode: false,
      ghostAlias: null,
      viewCount: 48,
      authorId: author1.id,
      createdAt: earlier1,
      updatedAt: earlier1,
    },
    {
      id: "story-seed-2",
      slug: "handing-back-the-corner-office-keycard",
      title: "Handing Back the Corner Office Keycard",
      excerpt:
        "Everyone congratulated me on the promotion, not knowing I spent Sunday evenings staring at my ceiling wondering when I stopped recognizing my own voice.",
      content:
        "Everyone congratulated me on the promotion, not knowing I spent Sunday evenings staring at my ceiling wondering when I stopped recognizing my own voice.\n\nFor six years I measured my worth in quarter-end decks, late Slack pings, and the quiet pride of never missing a deadline. When I finally slid my badge across the security desk on a rainy Tuesday, the guard barely looked up.\n\nWalking out into the noon sun with a single cardboard box, I felt terrified—and for the first time in half a decade, completely awake.",
      mood: "Cathartic",
      circleCategory: "career-burnout",
      tags: ["burnout", "escape", "new-beginnings"],
      coverTheme: "twilight-ink",
      readTimeMinutes: 2,
      isDraft: false,
      isGhostMode: false,
      ghostAlias: null,
      viewCount: 72,
      authorId: author2.id,
      createdAt: earlier2,
      updatedAt: earlier2,
    },
    {
      id: "story-seed-3",
      slug: "what-the-kitchen-light-knows-at-2am",
      title: "What the Kitchen Light Knows at 2 AM",
      excerpt:
        "There is a specific honesty that only arrives when the refrigerator hums alone and the rest of the neighborhood is asleep.",
      content:
        "There is a specific honesty that only arrives when the refrigerator hums alone and the rest of the neighborhood is asleep.\n\nIn the daytime we wear armor made of errands and polite smiles. At two in the morning, with a chipped ceramic mug between both palms, the armor dissolves. We finally admit what we miss, what we hope for, and who we are still learning to forgive—starting with ourselves.",
      mood: "Poetic",
      circleCategory: "late-musings",
      tags: ["3am", "solitude", "healing"],
      coverTheme: "twilight-ink",
      readTimeMinutes: 1,
      isDraft: false,
      isGhostMode: true,
      ghostAlias: "Nameless Scribe",
      viewCount: 35,
      authorId: author1.id,
      createdAt: earlier3,
      updatedAt: earlier3,
    },
  ];

  const reactions: MockReaction[] = [
    { id: "rx-1", storyId: "story-seed-1", userId: author2.id, type: "FELT_THIS", createdAt: earlier1 },
    { id: "rx-2", storyId: "story-seed-1", userId: author2.id, type: "POETIC", createdAt: earlier1 },
    { id: "rx-3", storyId: "story-seed-2", userId: author1.id, type: "CATHARTIC", createdAt: earlier2 },
    { id: "rx-4", storyId: "story-seed-2", userId: author1.id, type: "INSPIRED", createdAt: earlier2 },
  ];

  const comments: MockComment[] = [
    {
      id: "cmt-1",
      storyId: "story-seed-1",
      userId: author2.id,
      content: "That line about the unmailed postcard stayed with me all evening. Thank you for writing this.",
      penNameSnapshot: author2.penName,
      avatarIcon: author2.avatarIcon,
      avatarColor: author2.avatarColor,
      isAuthor: false,
      createdAt: earlier1,
      updatedAt: earlier1,
    },
  ];

  return {
    users: [author1, author2],
    stories,
    reactions,
    comments,
    bookmarks: [],
    whisperConnections: [],
    whisperMessages: [],
    listenerSessions: [],
    listenerMessages: [],
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  mockStore: MockStore | undefined;
};

function getMockStore(): MockStore {
  if (!globalForPrisma.mockStore) {
    globalForPrisma.mockStore = createInitialMockStore();
  }
  return globalForPrisma.mockStore;
}

function hydrateStory(store: MockStore, story: MockStory) {
  const author = store.users.find((u) => u.id === story.authorId) ?? {
    penName: "Midnight Scribe",
    avatarIcon: "feather",
    avatarColor: "amber",
    bio: null,
  };
  const reactions = store.reactions.filter((r) => r.storyId === story.id);
  const commentsCount = store.comments.filter((c) => c.storyId === story.id).length;

  return {
    ...story,
    author: {
      penName: author.penName,
      avatarIcon: author.avatarIcon,
      avatarColor: author.avatarColor,
      bio: author.bio,
    },
    reactions,
    _count: { comments: commentsCount },
  };
}

function hydrateWhisper(store: MockStore, conn: MockWhisperConnection) {
  const story = conn.storyId
    ? store.stories.find((s) => s.id === conn.storyId) ?? null
    : null;
  const initiator = store.users.find((u) => u.id === conn.initiatorId);
  const recipient = store.users.find((u) => u.id === conn.recipientId);
  const messages = store.whisperMessages
    .filter((m) => m.connectionId === conn.id)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((m) => {
      const sender = store.users.find((u) => u.id === m.senderId);
      return {
        ...m,
        sender: {
          id: sender?.id ?? m.senderId,
          penName: sender?.penName ?? "Anonymous Scribe",
          avatarIcon: sender?.avatarIcon ?? "feather",
          avatarColor: sender?.avatarColor ?? "amber",
        },
      };
    });

  return {
    ...conn,
    story: story ? { title: story.title } : null,
    initiator: {
      id: initiator?.id ?? conn.initiatorId,
      penName: initiator?.penName ?? "Anonymous Scribe",
      avatarIcon: initiator?.avatarIcon ?? "feather",
      avatarColor: initiator?.avatarColor ?? "amber",
    },
    recipient: {
      id: recipient?.id ?? conn.recipientId,
      penName: recipient?.penName ?? "Anonymous Scribe",
      avatarIcon: recipient?.avatarIcon ?? "feather",
      avatarColor: recipient?.avatarColor ?? "amber",
    },
    messages,
  };
}

function createMockPrismaClient(): PrismaClient {
  const store = getMockStore();

  const mock = {
    user: {
      findUnique: async ({ where }: { where: { id?: string; clerkId?: string; email?: string; penTag?: string } }) => {
        return (
          store.users.find(
            (u) =>
              (where.id && u.id === where.id) ||
              (where.clerkId && u.clerkId === where.clerkId) ||
              (where.email && u.email.toLowerCase() === where.email.toLowerCase()) ||
              (where.penTag && u.penTag === where.penTag)
          ) ?? null
        );
      },
      findFirst: async ({
        where,
      }: {
        where?: {
          clerkId?: string;
          email?: string | { equals: string; mode?: string };
          OR?: Array<{ clerkId?: string; email?: string | { equals: string; mode?: string } }>;
        };
      }) => {
        const match = (u: MockUser, cond: NonNullable<typeof where>): boolean => {
          if (cond.clerkId && u.clerkId === cond.clerkId) return true;
          if (cond.email) {
            const target = typeof cond.email === "string" ? cond.email : cond.email.equals;
            if (u.email.toLowerCase() === target.toLowerCase()) return true;
          }
          if (cond.OR) {
            return cond.OR.some((sub): boolean => match(u, sub));
          }
          return false;
        };
        if (!where) return store.users[0] ?? null;
        return store.users.find((u) => match(u, where)) ?? null;
      },
      create: async ({ data }: { data: Partial<MockUser> & { email: string; penName: string; penTag: string } }) => {
        const now = new Date();
        const user: MockUser = {
          id: data.id ?? randomUUID(),
          clerkId: data.clerkId ?? null,
          email: data.email,
          penName: data.penName,
          penTag: data.penTag,
          avatarIcon: data.avatarIcon ?? "feather",
          avatarColor: data.avatarColor ?? "amber",
          bio: data.bio ?? null,
          createdAt: now,
          updatedAt: now,
        };
        store.users.push(user);
        return user;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<MockUser> }) => {
        const idx = store.users.findIndex((u) => u.id === where.id);
        if (idx === -1) throw new Error("User not found");
        store.users[idx] = {
          ...store.users[idx],
          ...data,
          updatedAt: new Date(),
        };
        return store.users[idx];
      },
      deleteMany: async ({ where }: { where: { clerkId?: string } }) => {
        const before = store.users.length;
        store.users = store.users.filter((u) => !(where.clerkId && u.clerkId === where.clerkId));
        return { count: before - store.users.length };
      },
    },
    story: {
      findMany: async ({
        where,
      }: {
        where?: { isDraft?: boolean; circleCategory?: string; mood?: string };
      } = {}) => {
        return store.stories
          .filter((s) => {
            if (where?.isDraft !== undefined && s.isDraft !== where.isDraft) return false;
            if (where?.circleCategory && s.circleCategory !== where.circleCategory) return false;
            if (where?.mood && s.mood !== where.mood) return false;
            return true;
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((s) => hydrateStory(store, s));
      },
      findFirst: async ({
        where,
      }: {
        where: { id?: string; slug?: string; isDraft?: boolean };
      }) => {
        const found = store.stories.find((s) => {
          if (where.id && s.id !== where.id) return false;
          if (where.slug && s.slug !== where.slug) return false;
          if (where.isDraft !== undefined && s.isDraft !== where.isDraft) return false;
          return true;
        });
        return found ? hydrateStory(store, found) : null;
      },
      create: async ({
        data,
      }: {
        data: Omit<MockStory, "id" | "createdAt" | "updatedAt" | "viewCount" | "isDraft"> & {
          isDraft?: boolean;
        };
      }) => {
        const now = new Date();
        const story: MockStory = {
          ...data,
          id: randomUUID(),
          isDraft: data.isDraft ?? false,
          viewCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        store.stories.unshift(story);
        return hydrateStory(store, story);
      },
      deleteMany: async ({ where }: { where: { id?: string; authorId?: string } }) => {
        const before = store.stories.length;
        store.stories = store.stories.filter(
          (s) => !((!where.id || s.id === where.id) && (!where.authorId || s.authorId === where.authorId))
        );
        return { count: before - store.stories.length };
      },
    },
    reaction: {
      upsert: async ({
        where,
        create,
      }: {
        where: { storyId_userId_type: { storyId: string; userId: string; type: string } };
        create: { storyId: string; userId: string; type: string };
      }) => {
        const key = where.storyId_userId_type;
        const existing = store.reactions.find(
          (r) => r.storyId === key.storyId && r.userId === key.userId && r.type === key.type
        );
        if (existing) return existing;
        const created: MockReaction = {
          id: randomUUID(),
          storyId: create.storyId,
          userId: create.userId,
          type: create.type,
          createdAt: new Date(),
        };
        store.reactions.push(created);
        return created;
      },
      deleteMany: async ({ where }: { where: { storyId: string; userId: string; type: string } }) => {
        const before = store.reactions.length;
        store.reactions = store.reactions.filter(
          (r) => !(r.storyId === where.storyId && r.userId === where.userId && r.type === where.type)
        );
        return { count: before - store.reactions.length };
      },
      groupBy: async ({ where }: { where: { storyId: string } }) => {
        const counts = new Map<string, number>();
        for (const r of store.reactions) {
          if (r.storyId === where.storyId) {
            counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
          }
        }
        return Array.from(counts.entries()).map(([type, count]) => ({
          type,
          _count: { _all: count },
        }));
      },
      findMany: async ({ where }: { where: { storyId: string; userId: string } }) => {
        return store.reactions.filter(
          (r) => r.storyId === where.storyId && r.userId === where.userId
        );
      },
    },
    comment: {
      findMany: async ({ where }: { where: { storyId: string } }) => {
        return store.comments
          .filter((c) => c.storyId === where.storyId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },
      create: async ({
        data,
      }: {
        data: {
          storyId: string;
          userId: string;
          content: string;
          penNameSnapshot: string;
          avatarIcon: string;
          avatarColor: string;
        };
      }) => {
        const now = new Date();
        const comment: MockComment = {
          id: randomUUID(),
          ...data,
          isAuthor: false,
          createdAt: now,
          updatedAt: now,
        };
        store.comments.unshift(comment);
        return comment;
      },
    },
    bookmark: {
      findMany: async ({ where }: { where: { userId: string } }) => {
        return store.bookmarks
          .filter((b) => b.userId === where.userId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },
      upsert: async ({
        where,
        create,
      }: {
        where: { storyId_userId: { storyId: string; userId: string } };
        create: { storyId: string; userId: string };
      }) => {
        const key = where.storyId_userId;
        const existing = store.bookmarks.find(
          (b) => b.storyId === key.storyId && b.userId === key.userId
        );
        if (existing) return existing;
        const created: MockBookmark = {
          id: randomUUID(),
          storyId: create.storyId,
          userId: create.userId,
          createdAt: new Date(),
        };
        store.bookmarks.unshift(created);
        return created;
      },
      deleteMany: async ({ where }: { where: { storyId: string; userId: string } }) => {
        const before = store.bookmarks.length;
        store.bookmarks = store.bookmarks.filter(
          (b) => !(b.storyId === where.storyId && b.userId === where.userId)
        );
        return { count: before - store.bookmarks.length };
      },
    },
    whisperConnection: {
      findMany: async ({
        where,
      }: {
        where: { OR?: Array<{ initiatorId?: string; recipientId?: string }> };
      }) => {
        return store.whisperConnections
          .filter((c) =>
            where.OR
              ? where.OR.some(
                  (cond) =>
                    (cond.initiatorId && c.initiatorId === cond.initiatorId) ||
                    (cond.recipientId && c.recipientId === cond.recipientId)
                )
              : true
          )
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .map((c) => hydrateWhisper(store, c));
      },
      findFirst: async ({
        where,
      }: {
        where: {
          storyId?: string;
          initiatorId?: string;
          recipientId?: string;
          status?: { in: string[] };
        };
      }) => {
        return (
          store.whisperConnections.find((c) => {
            if (where.storyId && c.storyId !== where.storyId) return false;
            if (where.initiatorId && c.initiatorId !== where.initiatorId) return false;
            if (where.recipientId && c.recipientId !== where.recipientId) return false;
            if (where.status?.in && !where.status.in.includes(c.status)) return false;
            return true;
          }) ?? null
        );
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        return store.whisperConnections.find((c) => c.id === where.id) ?? null;
      },
      create: async ({
        data,
      }: {
        data: {
          storyId: string | null;
          initiatorId: string;
          recipientId: string;
          initialNote: string;
          status: string;
          messages?: { create: { senderId: string; content: string } };
        };
      }) => {
        const now = new Date();
        const conn: MockWhisperConnection = {
          id: randomUUID(),
          storyId: data.storyId,
          initiatorId: data.initiatorId,
          recipientId: data.recipientId,
          status: data.status,
          initialNote: data.initialNote,
          createdAt: now,
          updatedAt: now,
        };
        store.whisperConnections.unshift(conn);
        if (data.messages?.create) {
          store.whisperMessages.push({
            id: randomUUID(),
            connectionId: conn.id,
            senderId: data.messages.create.senderId,
            content: data.messages.create.content,
            isRead: false,
            createdAt: now,
          });
        }
        return hydrateWhisper(store, conn);
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<MockWhisperConnection> }) => {
        const idx = store.whisperConnections.findIndex((c) => c.id === where.id);
        if (idx === -1) throw new Error("Whisper connection not found");
        store.whisperConnections[idx] = {
          ...store.whisperConnections[idx],
          ...data,
          updatedAt: data.updatedAt ?? new Date(),
        };
        return hydrateWhisper(store, store.whisperConnections[idx]);
      },
    },
    whisperMessage: {
      updateMany: async ({
        where,
        data,
      }: {
        where: { connectionId: string; senderId?: { not: string }; isRead?: boolean };
        data: { isRead: boolean };
      }) => {
        let count = 0;
        for (const msg of store.whisperMessages) {
          if (
            msg.connectionId === where.connectionId &&
            (!where.senderId?.not || msg.senderId !== where.senderId.not) &&
            (where.isRead === undefined || msg.isRead === where.isRead)
          ) {
            msg.isRead = data.isRead;
            count += 1;
          }
        }
        return { count };
      },
      create: async ({
        data,
      }: {
        data: { connectionId: string; senderId: string; content: string };
      }) => {
        const msg: MockWhisperMessage = {
          id: randomUUID(),
          connectionId: data.connectionId,
          senderId: data.senderId,
          content: data.content,
          isRead: false,
          createdAt: new Date(),
        };
        store.whisperMessages.push(msg);
        return msg;
      },
    },
    listenerSession: {
      findMany: async ({
        where,
      }: {
        where?: {
          userId?: string;
          status?: string | { not: string };
          OR?: Array<{ status?: string; assignedStaffId?: string }>;
        };
      }) => {
        return store.listenerSessions
          .filter((s) => {
            if (where?.userId && s.userId !== where.userId) return false;
            if (where?.status) {
              if (typeof where.status === "string" && s.status !== where.status) return false;
              if (typeof where.status === "object" && where.status.not === s.status) return false;
            }
            if (where?.OR) {
              return where.OR.some(
                (cond) =>
                  (!cond.status || s.status === cond.status) &&
                  (!cond.assignedStaffId || s.assignedStaffId === cond.assignedStaffId)
              );
            }
            return true;
          })
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .map((s) => ({
            ...s,
            messages: store.listenerMessages
              .filter((m) => m.sessionId === s.id)
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
          }));
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        const session = store.listenerSessions.find((s) => s.id === where.id);
        if (!session) return null;
        return {
          ...session,
          messages: store.listenerMessages
            .filter((m) => m.sessionId === session.id)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
        };
      },
      create: async ({
        data,
      }: {
        data: { userId: string; penName: string; topic: string };
      }) => {
        const now = new Date();
        const session: MockListenerSession = {
          id: randomUUID(),
          userId: data.userId,
          penName: data.penName,
          topic: data.topic,
          status: "WAITING",
          assignedStaffId: null,
          createdAt: now,
          updatedAt: now,
        };
        store.listenerSessions.unshift(session);
        return { ...session, messages: [] };
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { id: string; status?: string };
        data: Partial<MockListenerSession>;
      }) => {
        let count = 0;
        for (let i = 0; i < store.listenerSessions.length; i += 1) {
          const s = store.listenerSessions[i];
          if (s.id === where.id && (!where.status || s.status === where.status)) {
            store.listenerSessions[i] = { ...s, ...data, updatedAt: new Date() };
            count += 1;
          }
        }
        return { count };
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<MockListenerSession>;
      }) => {
        const idx = store.listenerSessions.findIndex((s) => s.id === where.id);
        if (idx === -1) throw new Error("Listener session not found");
        store.listenerSessions[idx] = {
          ...store.listenerSessions[idx],
          ...data,
          updatedAt: data.updatedAt ?? new Date(),
        };
        return store.listenerSessions[idx];
      },
    },
    listenerMessage: {
      create: async ({
        data,
      }: {
        data: {
          sessionId: string;
          senderId: string;
          senderRole: string;
          senderName: string;
          content: string;
        };
      }) => {
        const msg: MockListenerMessage = {
          id: randomUUID(),
          ...data,
          createdAt: new Date(),
        };
        store.listenerMessages.push(msg);
        return msg;
      },
    },
  };

  return mock as unknown as PrismaClient;
}

let prisma: PrismaClient;
let isPrismaMocked = false;

if (process.env.DATABASE_URL) {
  try {
    prisma =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
  } catch {
    console.warn("[AI Studio] Database not connected — using in-memory mock");
    isPrismaMocked = true;
    prisma = createMockPrismaClient();
  }
} else {
  console.warn("[AI Studio] DATABASE_URL not configured — using in-memory mock");
  isPrismaMocked = true;
  prisma = createMockPrismaClient();
}

export { prisma, isPrismaMocked };
export default prisma;
