import { Prisma } from "@prisma/client";
import {
  MoodType,
  ReactionType,
  CircleSlug,
  StoryItem,
} from "@/types/quinspen";

export const STORY_INCLUDE = {
  author: {
    select: {
      penName: true,
      avatarIcon: true,
      avatarColor: true,
      bio: true,
    },
  },
  reactions: true,
  _count: { select: { comments: true } },
} satisfies Prisma.StoryInclude;

export type StoryRecord = Prisma.StoryGetPayload<{
  include: typeof STORY_INCLUDE;
}>;

const REACTION_TYPES: ReactionType[] = [
  "FELT_THIS",
  "VIRTUAL_HUG",
  "INSPIRED",
  "CATHARTIC",
  "POETIC",
];

const MOODS: MoodType[] = [
  "Vulnerable",
  "Nostalgic",
  "Confessional",
  "Hopeful",
  "Cathartic",
  "Poetic",
  "Bittersweet",
];

const CIRCLES: CircleSlug[] = [
  "midnight-confessions",
  "unspoken-love",
  "healing-grief",
  "career-burnout",
  "secret-dreams",
  "family-ties",
  "late-musings",
];

export function isReactionType(value: unknown): value is ReactionType {
  return typeof value === "string" && REACTION_TYPES.includes(value as ReactionType);
}

export function toStoryItem(
  story: StoryRecord,
  currentUserId: string
): StoryItem {
  const reactions = {
    FELT_THIS: 0,
    VIRTUAL_HUG: 0,
    INSPIRED: 0,
    CATHARTIC: 0,
    POETIC: 0,
    userReacted: {} as Partial<Record<ReactionType, boolean>>,
  };

  for (const reaction of story.reactions) {
    if (!isReactionType(reaction.type)) continue;
    reactions[reaction.type] += 1;
    if (reaction.userId === currentUserId) {
      reactions.userReacted[reaction.type] = true;
    }
  }

  const isGhostMode = story.isGhostMode;
  const isOwner = story.authorId === currentUserId;

  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    excerpt: story.excerpt,
    content: story.content,
    mood: MOODS.includes(story.mood as MoodType)
      ? (story.mood as MoodType)
      : "Vulnerable",
    circleCategory: CIRCLES.includes(story.circleCategory as CircleSlug)
      ? (story.circleCategory as CircleSlug)
      : "midnight-confessions",
    tags: story.tags,
    coverTheme: story.coverTheme,
    readTimeMinutes: story.readTimeMinutes,
    isDraft: story.isDraft,
    isGhostMode,
    ghostAlias: story.ghostAlias || undefined,
    viewCount: story.viewCount,
    authorId: isGhostMode && !isOwner ? "" : story.authorId,
    isOwner,
    authorPenName: isGhostMode
      ? story.ghostAlias || "Nameless Scribe"
      : story.author.penName,
    authorAvatarIcon: isGhostMode ? "mask" : story.author.avatarIcon,
    authorAvatarColor: isGhostMode ? "slate" : story.author.avatarColor,
    authorBio: isGhostMode ? undefined : story.author.bio || undefined,
    createdAt: story.createdAt.toISOString(),
    updatedAt: story.updatedAt.toISOString(),
    reactions,
    commentsCount: story._count.comments,
  };
}
