export type ReactionType =
  | "FELT_THIS"
  | "VIRTUAL_HUG"
  | "INSPIRED"
  | "CATHARTIC"
  | "POETIC";

export interface AnonymousPenIdentity {
  id: string;
  email: string;
  penName: string;
  penTag: string;
  avatarIcon: "feather" | "moon" | "star" | "flame" | "compass" | "book" | "mask" | "sparkle";
  avatarColor: "amber" | "indigo" | "emerald" | "rose" | "violet" | "cyan" | "slate";
  bio?: string;
  createdAt: string;
}

export type CircleSlug =
  | "midnight-confessions"
  | "unspoken-love"
  | "healing-grief"
  | "career-burnout"
  | "secret-dreams"
  | "family-ties"
  | "late-musings";

export interface CircleInfo {
  slug: CircleSlug;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  gradient: string;
  accentColor: string;
}

export type MoodType =
  | "Vulnerable"
  | "Nostalgic"
  | "Confessional"
  | "Hopeful"
  | "Cathartic"
  | "Poetic"
  | "Bittersweet";

export interface StoryComment {
  id: string;
  storyId: string;
  userId: string;
  content: string;
  penNameSnapshot: string;
  avatarIcon: string;
  avatarColor: string;
  isAuthor: boolean;
  createdAt: string;
}

export interface StoryReactionSummary {
  FELT_THIS: number;
  VIRTUAL_HUG: number;
  INSPIRED: number;
  CATHARTIC: number;
  POETIC: number;
  userReacted?: { [key in ReactionType]?: boolean };
}

export interface StoryItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  mood: MoodType;
  circleCategory: CircleSlug;
  tags: string[];
  coverTheme: string;
  readTimeMinutes: number;
  isDraft: boolean;
  isGhostMode: boolean;
  ghostAlias?: string;
  viewCount: number;
  authorId: string;
  authorPenName: string;
  authorAvatarIcon: string;
  authorAvatarColor: string;
  authorBio?: string;
  createdAt: string;
  updatedAt: string;
  reactions: StoryReactionSummary;
  commentsCount: number;
  isBookmarked?: boolean;
}

export interface WhisperMessageItem {
  id: string;
  connectionId: string;
  senderId: string;
  senderPenName: string;
  senderAvatarIcon: string;
  senderAvatarColor: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface WhisperConnectionItem {
  id: string;
  storyId?: string;
  storyTitle?: string;
  initiatorId: string;
  initiatorPenName: string;
  initiatorAvatarIcon: string;
  initiatorAvatarColor: string;
  recipientId: string;
  recipientPenName: string;
  recipientAvatarIcon: string;
  recipientAvatarColor: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  initialNote: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
  messages: WhisperMessageItem[];
}

export interface UserChronicleRecord {
  user: AnonymousPenIdentity;
  publishedStories: StoryItem[];
  draftStories: StoryItem[];
  bookmarkedStories: StoryItem[];
  myComments: {
    id: string;
    storyId: string;
    storyTitle: string;
    storySlug: string;
    content: string;
    createdAt: string;
  }[];
  activeWhispersCount: number;
  totalReadsReceived: number;
  totalResonancesReceived: number;
}
