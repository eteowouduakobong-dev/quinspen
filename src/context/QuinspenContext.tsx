"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
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
import { ambientSound } from "@/lib/ambientSound";

interface QuinspenContextType {
  currentUser: AnonymousPenIdentity | null;
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
  isLoadingStories: boolean;
  storiesError: string | null;
  stories: StoryItem[];
  whispers: WhisperConnectionItem[];
  bookmarkedIds: string[];
  userReactions: { [storyId: string]: ReactionType[] };
  selectedCircle: CircleSlug | "all";
  selectedMood: MoodType | "all";
  searchQuery: string;
  ambientTrack: "none" | "rain" | "fire" | "wind";
  unreadWhispersCount: number;
  isListenerModalOpen: boolean;

  setSelectedCircle: (circle: CircleSlug | "all") => void;
  setSelectedMood: (mood: MoodType | "all") => void;
  setSearchQuery: (query: string) => void;
  setAmbientTrack: (track: "none" | "rain" | "fire" | "wind") => void;
  openAuthModal: (mode: "signin" | "signup") => void;
  openListenerModal: () => void;
  closeListenerModal: () => void;

  signOut: () => Promise<void>;
  updatePenProfile: (updates: Partial<AnonymousPenIdentity>) => Promise<void>;
  generateNewPenIdentity: () => Promise<void>;

  publishStory: (
    story: Omit<
      StoryItem,
      | "id"
      | "slug"
      | "viewCount"
      | "reactions"
      | "commentsCount"
      | "createdAt"
      | "updatedAt"
      | "authorId"
      | "isOwner"
      | "authorPenName"
      | "authorAvatarIcon"
      | "authorAvatarColor"
    >
  ) => Promise<StoryItem>;
  deleteStory: (storyId: string) => Promise<void>;
  toggleReaction: (storyId: string, reactionType: ReactionType) => Promise<void>;
  addComment: (storyId: string, content: string) => Promise<StoryComment>;
  toggleBookmark: (storyId: string) => Promise<void>;

  sendWhisperRequest: (
    storyId: string,
    initialNote: string
  ) => Promise<WhisperConnectionItem>;
  respondToWhisper: (
    connectionId: string,
    status: "ACCEPTED" | "DECLINED"
  ) => Promise<void>;
  sendWhisperMessage: (
    connectionId: string,
    content: string
  ) => Promise<WhisperMessageItem>;
  markWhisperAsRead: (connectionId: string) => Promise<void>;
}

const QuinspenContext = createContext<QuinspenContextType | undefined>(undefined);

async function errorMessage(response: Response, fallback: string): Promise<string> {
  const result: unknown = await response.json().catch(() => null);
  if (
    result &&
    typeof result === "object" &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    return result.error;
  }
  return fallback;
}

export function QuinspenProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const [currentUser, setCurrentUser] = useState<AnonymousPenIdentity | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [whispers, setWhispers] = useState<WhisperConnectionItem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [userReactions, setUserReactions] = useState<{
    [storyId: string]: ReactionType[];
  }>({});
  const [selectedCircle, setSelectedCircle] = useState<CircleSlug | "all">("all");
  const [selectedMood, setSelectedMood] = useState<MoodType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ambientTrack, setAmbientTrackState] = useState<
    "none" | "rain" | "fire" | "wind"
  >("none");
  const [isListenerModalOpen, setIsListenerModalOpen] = useState(false);

  const clearAccountState = useCallback(() => {
    setCurrentUser(null);
    setStories([]);
    setWhispers([]);
    setBookmarkedIds([]);
    setUserReactions({});
    setStoriesError(null);
    setIsLoadingStories(false);
  }, []);

  const currentUserId = currentUser?.id;
  const clerkUserId = user?.id;

  useEffect(() => {
    if (!isLoaded) return;

    let active = true;
    if (!isSignedIn || !clerkUserId) {
      queueMicrotask(() => {
        clearAccountState();
        setIsLoadingAuth(false);
      });
      return;
    }

    queueMicrotask(() => {
      if (active) setIsLoadingAuth(true);
    });
    void fetch("/api/profile", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            await errorMessage(response, "Could not load your anonymous profile.")
          );
        }
        return (await response.json()) as AnonymousPenIdentity;
      })
      .then((profile) => {
        if (!active) return;
        setCurrentUser(profile);
        setStoriesError(null);
      })
      .catch((error: unknown) => {
        console.error("Could not load the Clerk-linked profile:", error);
        if (!active) return;
        setCurrentUser(null);
        setStoriesError(
          error instanceof Error ? error.message : "Could not load your profile."
        );
      })
      .finally(() => {
        if (active) setIsLoadingAuth(false);
      });

    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn, clerkUserId, clearAccountState]);

  useEffect(() => {
    if (!currentUserId) {
      queueMicrotask(() => {
        setStories([]);
        setWhispers([]);
        setBookmarkedIds([]);
        setUserReactions({});
        setIsLoadingStories(false);
      });
      return;
    }

    let active = true;
    queueMicrotask(() => {
      if (active) setIsLoadingStories(true);
    });

    void fetch("/api/stories", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            await errorMessage(response, "Could not load community stories.")
          );
        }
        const result: unknown = await response.json();
        if (!Array.isArray(result)) {
          throw new Error("The story service returned an invalid response.");
        }
        return result as StoryItem[];
      })
      .then((loadedStories) => {
        if (!active) return;
        setStories(loadedStories);
        setStoriesError(null);
        setUserReactions(
          Object.fromEntries(
            loadedStories.map((story) => [
              story.id,
              Object.entries(story.reactions.userReacted || {})
                .filter(([, reacted]) => reacted)
                .map(([type]) => type as ReactionType),
            ])
          )
        );
      })
      .catch((error: unknown) => {
        console.error("Could not load community stories:", error);
        if (!active) return;
        setStories([]);
        setStoriesError(
          error instanceof Error ? error.message : "Could not load community stories."
        );
      })
      .finally(() => {
        if (active) setIsLoadingStories(false);
      });

    void fetch("/api/bookmarks", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await errorMessage(response, "Could not load bookmarks."));
        }
        return (await response.json()) as { storyIds?: unknown };
      })
      .then((result) => {
        if (!active || !Array.isArray(result.storyIds)) return;
        setBookmarkedIds(
          result.storyIds.filter((id): id is string => typeof id === "string")
        );
      })
      .catch((error: unknown) => {
        console.error("Could not load bookmarks:", error);
      });

    void fetch("/api/whispers", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await errorMessage(response, "Could not load whispers."));
        }
        const result: unknown = await response.json();
        if (!Array.isArray(result)) {
          throw new Error("The whisper service returned an invalid response.");
        }
        return result as WhisperConnectionItem[];
      })
      .then((loadedWhispers) => {
        if (active) setWhispers(loadedWhispers);
      })
      .catch((error: unknown) => {
        console.error("Could not load whispers:", error);
      });

    return () => {
      active = false;
    };
  }, [currentUserId]);

  const setAmbientTrack = (track: "none" | "rain" | "fire" | "wind") => {
    setAmbientTrackState(track);
    ambientSound.play(track);
  };

  const openAuthModal = (mode: "signin" | "signup") => {
    router.push(mode === "signup" ? "/sign-up" : "/sign-in");
  };

  const openListenerModal = () => setIsListenerModalOpen(true);
  const closeListenerModal = () => setIsListenerModalOpen(false);

  const signOut = async () => {
    clearAccountState();
    setIsLoadingAuth(false);
    await clerkSignOut({ redirectUrl: "/" });
  };

  const applyProfile = (profile: AnonymousPenIdentity) => {
    setCurrentUser(profile);
    setStories((previous) =>
      previous.map((story) =>
        story.isOwner
          ? {
              ...story,
              authorPenName: profile.penName,
              authorAvatarIcon: profile.avatarIcon,
              authorAvatarColor: profile.avatarColor,
              authorBio: profile.bio,
            }
          : story
      )
    );
  };

  const updatePenProfile = async (updates: Partial<AnonymousPenIdentity>) => {
    if (!currentUser) return;
    const payload: Record<string, string> = {};
    if (typeof updates.penName === "string") payload.penName = updates.penName;
    if (typeof updates.bio === "string") payload.bio = updates.bio;
    if (typeof updates.avatarIcon === "string") payload.avatarIcon = updates.avatarIcon;
    if (typeof updates.avatarColor === "string") payload.avatarColor = updates.avatarColor;
    if (Object.keys(payload).length === 0) return;

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Could not update your profile."));
    }
    applyProfile((await response.json()) as AnonymousPenIdentity);
  };

  const generateNewPenIdentity = async () => {
    if (!currentUser) return;
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerateIdentity: true }),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Could not generate a new identity."));
    }
    applyProfile((await response.json()) as AnonymousPenIdentity);
  };

  const publishStory = async (
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
      | "isOwner"
      | "authorPenName"
      | "authorAvatarIcon"
      | "authorAvatarColor"
    >
  ): Promise<StoryItem> => {
    if (!currentUser) {
      openAuthModal("signup");
      throw new Error("You must create an account or sign in to publish a story.");
    }

    const response = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(storyData),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Could not publish the story."));
    }
    const newStory = (await response.json()) as StoryItem;
    setStories((previous) => [newStory, ...previous]);
    return newStory;
  };

  const deleteStory = async (storyId: string) => {
    if (!currentUser) {
      openAuthModal("signup");
      return;
    }
    const response = await fetch(`/api/stories/${storyId}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Could not delete this story."));
    }
    setStories((previous) => previous.filter((story) => story.id !== storyId));
    setBookmarkedIds((previous) => previous.filter((id) => id !== storyId));
  };

  const toggleReaction = async (storyId: string, reactionType: ReactionType) => {
    if (!currentUser) {
      openAuthModal("signup");
      return;
    }

    const currentList = userReactions[storyId] || [];
    const hasReacted = currentList.includes(reactionType);
    const response = await fetch(`/api/stories/${storyId}/reactions`, {
      method: hasReacted ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: reactionType }),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Could not save your reaction."));
    }

    const reactionResult = (await response.json()) as {
      counts: StoryItem["reactions"];
      userReactions: ReactionType[];
    };
    setUserReactions((previous) => ({
      ...previous,
      [storyId]: reactionResult.userReactions,
    }));
    setStories((previous) =>
      previous.map((story) =>
        story.id === storyId
          ? { ...story, reactions: reactionResult.counts }
          : story
      )
    );
  };

  const addComment = async (
    storyId: string,
    content: string
  ): Promise<StoryComment> => {
    if (!currentUser) {
      openAuthModal("signup");
      throw new Error("Please create an account to leave a reflection.");
    }

    const response = await fetch(`/api/stories/${storyId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Could not post your reflection."));
    }
    const newComment = (await response.json()) as StoryComment;

    setStories((previous) =>
      previous.map((story) =>
        story.id === storyId
          ? { ...story, commentsCount: story.commentsCount + 1 }
          : story
      )
    );

    return newComment;
  };

  const toggleBookmark = async (storyId: string) => {
    if (!currentUser) {
      openAuthModal("signup");
      return;
    }

    const isBookmarked = bookmarkedIds.includes(storyId);
    setBookmarkedIds((previous) =>
      isBookmarked
        ? previous.filter((id) => id !== storyId)
        : [storyId, ...previous]
    );

    const response = await fetch(`/api/stories/${storyId}/bookmark`, {
      method: isBookmarked ? "DELETE" : "POST",
    });
    if (!response.ok) {
      setBookmarkedIds((previous) =>
        isBookmarked
          ? [storyId, ...previous]
          : previous.filter((id) => id !== storyId)
      );
      throw new Error(await errorMessage(response, "Could not save this bookmark."));
    }
  };

  const sendWhisperRequest = async (
    storyId: string,
    initialNote: string
  ): Promise<WhisperConnectionItem> => {
    if (!currentUser) {
      openAuthModal("signup");
      throw new Error("Please create an account to whisper to an author.");
    }

    const response = await fetch("/api/whispers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId, initialNote }),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Could not send your whisper."));
    }
    const connection = (await response.json()) as WhisperConnectionItem;
    setWhispers((previous) => [connection, ...previous]);
    return connection;
  };

  const respondToWhisper = async (
    connectionId: string,
    status: "ACCEPTED" | "DECLINED"
  ) => {
    const response = await fetch(`/api/whispers/${connectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Could not update this whisper."));
    }
    const updated = (await response.json()) as WhisperConnectionItem;
    setWhispers((previous) =>
      previous.map((connection) =>
        connection.id === connectionId ? updated : connection
      )
    );
  };

  const sendWhisperMessage = async (
    connectionId: string,
    content: string
  ): Promise<WhisperMessageItem> => {
    const response = await fetch(`/api/whispers/${connectionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Could not send your whisper."));
    }
    const message = (await response.json()) as WhisperMessageItem;
    setWhispers((previous) =>
      previous.map((connection) =>
        connection.id === connectionId
          ? {
              ...connection,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
              updatedAt: message.createdAt,
              messages: [...connection.messages, message],
            }
          : connection
      )
    );
    return message;
  };

  const markWhisperAsRead = async (connectionId: string) => {
    const connection = whispers.find((item) => item.id === connectionId);
    if (!connection || !connection.unreadCount) return;

    const response = await fetch(`/api/whispers/${connectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markRead: true }),
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Could not mark whispers as read."));
    }
    setWhispers((previous) =>
      previous.map((item) =>
        item.id === connectionId
          ? {
              ...item,
              unreadCount: 0,
              messages: item.messages.map((message) => ({
                ...message,
                isRead: true,
              })),
            }
          : item
      )
    );
  };

  const unreadWhispersCount = currentUser
    ? whispers.filter(
        (connection) =>
          connection.recipientId === currentUser.id &&
          (connection.status === "PENDING" ||
            (connection.unreadCount ?? 0) > 0)
      ).length
    : 0;

  return (
    <QuinspenContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        isLoadingAuth,
        isLoadingStories,
        storiesError,
        stories,
        whispers,
        bookmarkedIds,
        userReactions,
        selectedCircle,
        selectedMood,
        searchQuery,
        ambientTrack,
        unreadWhispersCount,
        isListenerModalOpen,
        setSelectedCircle,
        setSelectedMood,
        setSearchQuery,
        setAmbientTrack,
        openAuthModal,
        openListenerModal,
        closeListenerModal,
        signOut,
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
