"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AnonymousPenIdentity,
  StoryItem,
  ReactionType,
  StoryComment,
  WhisperConnectionItem,
  WhisperMessageItem,
  CircleSlug,
  MoodType,
} from "@/types/quinspen";
import {
  INITIAL_STORIES,
  INITIAL_WHISPERS,
  DEMO_DEFAULT_USER,
  generateRandomPenName,
} from "@/lib/quinspenData";
import { ambientSound } from "@/lib/ambientSound";

interface QuinspenContextType {
  currentUser: AnonymousPenIdentity | null;
  isLoggedIn: boolean;
  stories: StoryItem[];
  whispers: WhisperConnectionItem[];
  bookmarkedIds: string[];
  userReactions: { [storyId: string]: ReactionType[] };
  selectedCircle: CircleSlug | "all";
  selectedMood: MoodType | "all";
  searchQuery: string;
  ambientTrack: "none" | "rain" | "fire" | "wind";
  unreadWhispersCount: number;
  isAuthModalOpen: boolean;

  // Actions
  setSelectedCircle: (circle: CircleSlug | "all") => void;
  setSelectedMood: (mood: MoodType | "all") => void;
  setSearchQuery: (query: string) => void;
  setAmbientTrack: (track: "none" | "rain" | "fire" | "wind") => void;
  setIsAuthModalOpen: (open: boolean) => void;

  loginOrSignup: (email: string, penName?: string, bio?: string) => AnonymousPenIdentity;
  logout: () => void;
  updatePenProfile: (updates: Partial<AnonymousPenIdentity>) => void;
  generateNewPenIdentity: () => void;

  publishStory: (story: Omit<StoryItem, "id" | "slug" | "viewCount" | "reactions" | "commentsCount" | "createdAt" | "updatedAt" | "authorId" | "authorPenName" | "authorAvatarIcon" | "authorAvatarColor">) => StoryItem;
  deleteStory: (storyId: string) => void;
  toggleReaction: (storyId: string, reactionType: ReactionType) => void;
  addComment: (storyId: string, content: string) => StoryComment;
  toggleBookmark: (storyId: string) => void;

  sendWhisperRequest: (storyId: string, storyTitle: string, recipientId: string, initialNote: string) => WhisperConnectionItem;
  respondToWhisper: (connectionId: string, status: "ACCEPTED" | "DECLINED") => void;
  sendWhisperMessage: (connectionId: string, content: string) => void;
  markWhisperAsRead: (connectionId: string) => void;
}

const QuinspenContext = createContext<QuinspenContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "quinspen_user_identity_v1",
  STORIES: "quinspen_stories_catalog_v1",
  WHISPERS: "quinspen_whispers_v1",
  BOOKMARKS: "quinspen_bookmarks_v1",
  REACTIONS: "quinspen_reactions_v1",
  COMMENTS: "quinspen_comments_cache_v1",
};

export function QuinspenProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AnonymousPenIdentity | null>(null);
  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);
  const [whispers, setWhispers] = useState<WhisperConnectionItem[]>(INITIAL_WHISPERS);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [userReactions, setUserReactions] = useState<{ [storyId: string]: ReactionType[] }>({});
  const [selectedCircle, setSelectedCircle] = useState<CircleSlug | "all">("all");
  const [selectedMood, setSelectedMood] = useState<MoodType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ambientTrack, setAmbientTrackState] = useState<"none" | "rain" | "fire" | "wind">("none");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        // Default demo user so testing is seamless out of the box
        setCurrentUser(DEMO_DEFAULT_USER);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_DEFAULT_USER));
      }

      const savedStories = localStorage.getItem(STORAGE_KEYS.STORIES);
      if (savedStories) {
        const parsed = JSON.parse(savedStories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStories(parsed);
        }
      }

      const savedWhispers = localStorage.getItem(STORAGE_KEYS.WHISPERS);
      if (savedWhispers) {
        const parsed = JSON.parse(savedWhispers);
        if (Array.isArray(parsed)) {
          setWhispers(parsed);
        }
      }

      const savedBookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (savedBookmarks) {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      }

      const savedReactions = localStorage.getItem(STORAGE_KEYS.REACTIONS);
      if (savedReactions) {
        setUserReactions(JSON.parse(savedReactions));
      }
    } catch {
      // In case localStorage is blocked
    }
    setIsInitialized(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch {}
  }, [currentUser, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
    } catch {}
  }, [stories, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.WHISPERS, JSON.stringify(whispers));
    } catch {}
  }, [whispers, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedIds));
    } catch {}
  }, [bookmarkedIds, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.REACTIONS, JSON.stringify(userReactions));
    } catch {}
  }, [userReactions, isInitialized]);

  // Ambient sound controller
  const setAmbientTrack = (track: "none" | "rain" | "fire" | "wind") => {
    setAmbientTrackState(track);
    ambientSound.play(track);
  };

  // Auth & Profile
  const loginOrSignup = (email: string, customPenName?: string, bio?: string): AnonymousPenIdentity => {
    const defaultAlias = generateRandomPenName();
    const newUser: AnonymousPenIdentity = {
      id: "user-" + Math.random().toString(36).substring(2, 9),
      email,
      penName: customPenName?.trim() || defaultAlias.penName,
      penTag: defaultAlias.penTag,
      avatarIcon: "feather",
      avatarColor: "amber",
      bio: bio || "A traveler in the world of untold memories.",
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updatePenProfile = (updates: Partial<AnonymousPenIdentity>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    // Update authorPenName on their existing stories
    setStories((prev) =>
      prev.map((s) => {
        if (s.authorId === currentUser.id) {
          return {
            ...s,
            authorPenName: updated.penName,
            authorAvatarIcon: updated.avatarIcon,
            authorAvatarColor: updated.avatarColor,
            authorBio: updated.bio,
          };
        }
        return s;
      })
    );
  };

  const generateNewPenIdentity = () => {
    if (!currentUser) return;
    const generated = generateRandomPenName();
    updatePenProfile({
      penName: generated.penName,
      penTag: generated.penTag,
    });
  };

  // Stories
  const publishStory = (
    storyData: Omit<
      StoryItem,
      | "id"
      | "slug"
      | "viewCount"
      | "reactions"
      | "commentsCount"
      | "createdAt"
      | "updatedAt"
      | "authorId"
      | "authorPenName"
      | "authorAvatarIcon"
      | "authorAvatarColor"
    >
  ): StoryItem => {
    const user = currentUser || DEMO_DEFAULT_USER;
    const id = "story-" + Date.now();
    const slugBase = storyData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const slug = `${slugBase || "untitled"}-${Math.floor(100 + Math.random() * 900)}`;

    const newStory: StoryItem = {
      ...storyData,
      id,
      slug,
      viewCount: 1,
      authorId: user.id,
      authorPenName: storyData.isGhostMode ? (storyData.ghostAlias || "Nameless Scribe") : user.penName,
      authorAvatarIcon: storyData.isGhostMode ? "mask" : user.avatarIcon,
      authorAvatarColor: storyData.isGhostMode ? "slate" : user.avatarColor,
      authorBio: storyData.isGhostMode ? "A temporary shadow passing through." : user.bio,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactions: {
        FELT_THIS: 0,
        VIRTUAL_HUG: 0,
        INSPIRED: 0,
        CATHARTIC: 0,
        POETIC: 0,
      },
      commentsCount: 0,
    };

    setStories((prev) => [newStory, ...prev]);
    return newStory;
  };

  const deleteStory = (storyId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
  };

  const toggleReaction = (storyId: string, reactionType: ReactionType) => {
    const currentList = userReactions[storyId] || [];
    const hasReacted = currentList.includes(reactionType);
    const updatedList = hasReacted
      ? currentList.filter((r) => r !== reactionType)
      : [...currentList, reactionType];

    setUserReactions((prev) => ({
      ...prev,
      [storyId]: updatedList,
    }));

    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        const countDiff = hasReacted ? -1 : 1;
        return {
          ...s,
          reactions: {
            ...s.reactions,
            [reactionType]: Math.max(0, (s.reactions[reactionType] || 0) + countDiff),
          },
        };
      })
    );
  };

  const addComment = (storyId: string, content: string): StoryComment => {
    const user = currentUser || DEMO_DEFAULT_USER;
    const newComment: StoryComment = {
      id: "comment-" + Date.now(),
      storyId,
      userId: user.id,
      content,
      penNameSnapshot: user.penName,
      avatarIcon: user.avatarIcon,
      avatarColor: user.avatarColor,
      isAuthor: false,
      createdAt: new Date().toISOString(),
    };

    // Update story commentsCount
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          const isAuth = s.authorId === user.id;
          newComment.isAuthor = isAuth;
          return {
            ...s,
            commentsCount: s.commentsCount + 1,
          };
        }
        return s;
      })
    );

    return newComment;
  };

  const toggleBookmark = (storyId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(storyId) ? prev.filter((id) => id !== storyId) : [...prev, storyId]
    );
  };

  // Whispers / Connections
  const sendWhisperRequest = (
    storyId: string,
    storyTitle: string,
    recipientId: string,
    initialNote: string
  ): WhisperConnectionItem => {
    const user = currentUser || DEMO_DEFAULT_USER;
    const connectionId = "whisper-conn-" + Date.now();
    const msgId = "msg-" + Date.now();

    const newMsg: WhisperMessageItem = {
      id: msgId,
      connectionId,
      senderId: user.id,
      senderPenName: user.penName,
      senderAvatarIcon: user.avatarIcon,
      senderAvatarColor: user.avatarColor,
      content: initialNote,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const newConnection: WhisperConnectionItem = {
      id: connectionId,
      storyId,
      storyTitle,
      initiatorId: user.id,
      initiatorPenName: user.penName,
      initiatorAvatarIcon: user.avatarIcon,
      initiatorAvatarColor: user.avatarColor,
      recipientId,
      recipientPenName: "Author Scribe",
      recipientAvatarIcon: "feather",
      recipientAvatarColor: "amber",
      status: "PENDING",
      initialNote,
      lastMessage: initialNote,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [newMsg],
    };

    setWhispers((prev) => [newConnection, ...prev]);
    return newConnection;
  };

  const respondToWhisper = (connectionId: string, status: "ACCEPTED" | "DECLINED") => {
    setWhispers((prev) =>
      prev.map((w) => (w.id === connectionId ? { ...w, status, updatedAt: new Date().toISOString() } : w))
    );
  };

  const sendWhisperMessage = (connectionId: string, content: string) => {
    const user = currentUser || DEMO_DEFAULT_USER;
    const msg: WhisperMessageItem = {
      id: "msg-" + Date.now(),
      connectionId,
      senderId: user.id,
      senderPenName: user.penName,
      senderAvatarIcon: user.avatarIcon,
      senderAvatarColor: user.avatarColor,
      content,
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    setWhispers((prev) =>
      prev.map((w) => {
        if (w.id !== connectionId) return w;
        return {
          ...w,
          lastMessage: content,
          lastMessageAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [...w.messages, msg],
        };
      })
    );
  };

  const markWhisperAsRead = (connectionId: string) => {
    setWhispers((prev) =>
      prev.map((w) => {
        if (w.id !== connectionId) return w;
        return {
          ...w,
          unreadCount: 0,
          messages: w.messages.map((m) => ({ ...m, isRead: true })),
        };
      })
    );
  };

  const unreadWhispersCount = whispers.filter(
    (w) =>
      w.recipientId === (currentUser?.id || DEMO_DEFAULT_USER.id) &&
      (w.status === "PENDING" || (w.unreadCount && w.unreadCount > 0))
  ).length;

  return (
    <QuinspenContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        stories,
        whispers,
        bookmarkedIds,
        userReactions,
        selectedCircle,
        selectedMood,
        searchQuery,
        ambientTrack,
        unreadWhispersCount,
        isAuthModalOpen,
        setSelectedCircle,
        setSelectedMood,
        setSearchQuery,
        setAmbientTrack,
        setIsAuthModalOpen,
        loginOrSignup,
        logout,
        updatePenProfile,
        generateNewPenIdentity,
        publishStory,
        deleteStory,
        toggleReaction,
        addComment,
        toggleBookmark,
        sendWhisperRequest,
        respondToWhisper,
        sendWhisperMessage,
        markWhisperAsRead,
      }}
    >
      {children}
    </QuinspenContext.Provider>
  );
}

export function useQuinspen() {
  const context = useContext(QuinspenContext);
  if (!context) {
    throw new Error("useQuinspen must be used within a QuinspenProvider");
  }
  return context;
}
