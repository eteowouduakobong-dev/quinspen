"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
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
import { INITIAL_WHISPERS, generateRandomPenName } from "@/lib/quinspenData";
import { ambientSound } from "@/lib/ambientSound";
import { createClient } from "@/lib/supabase/client";

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
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup";
  isListenerModalOpen: boolean;

  // Actions
  setSelectedCircle: (circle: CircleSlug | "all") => void;
  setSelectedMood: (mood: MoodType | "all") => void;
  setSearchQuery: (query: string) => void;
  setAmbientTrack: (track: "none" | "rain" | "fire" | "wind") => void;
  openAuthModal: (mode: "signin" | "signup") => void;
  closeAuthModal: () => void;
  openListenerModal: () => void;
  closeListenerModal: () => void;

  signUpWithEmail: (
    email: string,
    password: string,
    penName: string,
    bio?: string
  ) => Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  updatePenProfile: (updates: Partial<AnonymousPenIdentity>) => void;
  generateNewPenIdentity: () => void;

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
      | "authorPenName"
      | "authorAvatarIcon"
      | "authorAvatarColor"
    >
  ) => Promise<StoryItem>;
  deleteStory: (storyId: string) => void;
  toggleReaction: (storyId: string, reactionType: ReactionType) => Promise<void>;
  addComment: (storyId: string, content: string) => Promise<StoryComment>;
  toggleBookmark: (storyId: string) => void;

  sendWhisperRequest: (
    storyId: string,
    storyTitle: string,
    recipientId: string,
    initialNote: string
  ) => WhisperConnectionItem;
  respondToWhisper: (connectionId: string, status: "ACCEPTED" | "DECLINED") => void;
  sendWhisperMessage: (connectionId: string, content: string) => void;
  markWhisperAsRead: (connectionId: string) => void;
}

const QuinspenContext = createContext<QuinspenContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WHISPERS: "quinspen_whispers_v2",
  BOOKMARKS: "quinspen_bookmarks_v2",
};

function identityFromAuthUser(user: SupabaseUser): AnonymousPenIdentity {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || "",
    penName:
      typeof metadata.penName === "string" ? metadata.penName : "Anonymous Scribe",
    penTag:
      typeof metadata.penTag === "string"
        ? metadata.penTag
        : `scribe_${user.id.slice(0, 8)}`,
    avatarIcon: metadata.avatarIcon || "feather",
    avatarColor: metadata.avatarColor || "amber",
    bio: metadata.bio || "A traveler in the world of untold memories.",
    createdAt: user.created_at,
  };
}

export function QuinspenProvider({ children }: { children: React.ReactNode }) {
  const hasAuthConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [currentUser, setCurrentUser] = useState<AnonymousPenIdentity | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(hasAuthConfig);
  const [isLoadingStories, setIsLoadingStories] = useState(hasAuthConfig);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [whispers, setWhispers] = useState<WhisperConnectionItem[]>(INITIAL_WHISPERS);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [userReactions, setUserReactions] = useState<{ [storyId: string]: ReactionType[] }>({});
  const [selectedCircle, setSelectedCircle] = useState<CircleSlug | "all">("all");
  const [selectedMood, setSelectedMood] = useState<MoodType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ambientTrack, setAmbientTrackState] = useState<"none" | "rain" | "fire" | "wind">("none");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signup");
  const [isListenerModalOpen, setIsListenerModalOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const currentUserId = currentUser?.id;

  // Initialize Auth & Supabase Session
  useEffect(() => {
    if (!supabase) return;

    let active = true;
    const updateAuthState = (user: SupabaseUser | null) => {
      if (!active) return;
      setCurrentUser(user ? identityFromAuthUser(user) : null);
      setIsLoadingAuth(false);
      setIsLoadingStories(Boolean(user));
      setStoriesError(null);
      if (!user) {
        setStories([]);
        setUserReactions({});
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        updateAuthState(session?.user || null);
      }
    );

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("Could not restore the Supabase session:", error);
      updateAuthState(data.session?.user || null);
    }).catch((error: unknown) => {
      console.error("Could not restore the Supabase session:", error);
      updateAuthState(null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    try {
      for (const key of [
        "quinspen_user_identity_v2",
        "quinspen_registered_accounts_v2",
        "quinspen_stories_catalog_v2",
        "quinspen_reactions_v2",
      ]) {
        localStorage.removeItem(key);
      }
      const savedWhispers = localStorage.getItem(STORAGE_KEYS.WHISPERS);
      const savedBookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      const parsedWhispers: unknown = savedWhispers ? JSON.parse(savedWhispers) : null;
      const parsedBookmarks: unknown = savedBookmarks ? JSON.parse(savedBookmarks) : null;
      queueMicrotask(() => {
        if (Array.isArray(parsedWhispers)) {
          setWhispers(parsedWhispers as WhisperConnectionItem[]);
        }
        if (
          Array.isArray(parsedBookmarks) &&
          parsedBookmarks.every((bookmark) => typeof bookmark === "string")
        ) {
          setBookmarkedIds(parsedBookmarks);
        }
      });
    } catch (error) {
      console.error("Could not restore local preferences:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WHISPERS, JSON.stringify(whispers));
    } catch (error) {
      console.error("Could not save local whispers:", error);
    }
  }, [whispers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedIds));
    } catch (error) {
      console.error("Could not save local bookmarks:", error);
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    if (!currentUserId) return;

    let active = true;
    void fetch("/api/stories", { cache: "no-store" })
      .then(async (response) => {
        const result: unknown = await response.json();
        if (!response.ok) {
          const message =
            result && typeof result === "object" && "error" in result &&
            typeof result.error === "string"
              ? result.error
              : "Could not load community stories.";
          throw new Error(message);
        }
        if (!Array.isArray(result)) {
          throw new Error("The story service returned an invalid response.");
        }
        return result as StoryItem[];
      })
      .then((loadedStories) => {
        if (!active) return;
        setStories(loadedStories);
        setIsLoadingStories(false);
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
        if (active) {
          setStories([]);
          setIsLoadingStories(false);
          setStoriesError(
            error instanceof Error ? error.message : "Could not load community stories."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [currentUserId]);

  // Ambient sound controller
  const setAmbientTrack = (track: "none" | "rain" | "fire" | "wind") => {
    setAmbientTrackState(track);
    ambientSound.play(track);
  };

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openListenerModal = () => setIsListenerModalOpen(true);
  const closeListenerModal = () => setIsListenerModalOpen(false);

  // Sign Up with Email primarily
  const signUpWithEmail = async (
    email: string,
    password: string,
    penName: string,
    bio?: string
  ): Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPenName = penName.trim() || generateRandomPenName().penName;
    const penTag = `scribe_${Math.floor(100 + Math.random() * 900)}`;

    try {
      if (!supabase) {
        return {
          success: false,
          error: "Account services are not configured. Please contact the site administrator.",
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            penName: cleanPenName,
            penTag,
            avatarIcon: "feather",
            avatarColor: "amber",
            bio: bio || "A traveler in the world of untold memories.",
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Account creation did not return a user." };
      }

      if (!data.session) {
        return { success: true, confirmationRequired: true };
      }

      setCurrentUser(identityFromAuthUser(data.user));
      setIsLoadingStories(true);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create account.",
      };
    }
  };

  // Sign In with Email
  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (!supabase) {
        return {
          success: false,
          error: "Account services are not configured. Please contact the site administrator.",
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user || !data.session) {
        return { success: false, error: "Sign in did not establish an active session." };
      }

      setCurrentUser(identityFromAuthUser(data.user));
      setIsLoadingStories(true);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Sign in failed.",
      };
    }
  };

  // Sign Out
  const signOut = async () => {
    if (!supabase) {
      throw new Error("Account services are not configured.");
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setCurrentUser(null);
    setStories([]);
    setUserReactions({});
    setIsLoadingStories(false);
  };

  const updatePenProfile = (updates: Partial<AnonymousPenIdentity>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    if (supabase) {
      supabase.from("User").update(updates).eq("id", currentUser.id).then();
    }

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
    const result: unknown = await response.json();
    if (!response.ok) {
      const message =
        result && typeof result === "object" && "error" in result &&
        typeof result.error === "string"
          ? result.error
          : "Could not publish the story.";
      throw new Error(message);
    }
    const newStory = result as StoryItem;
    setStories((prev) => [newStory, ...prev]);
    return newStory;
  };

  const deleteStory = (storyId: string) => {
    if (supabase) {
      supabase.from("Story").delete().eq("id", storyId).then();
    }
    setStories((prev) => prev.filter((s) => s.id !== storyId));
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
    const result: unknown = await response.json();
    if (!response.ok) {
      const message =
        result && typeof result === "object" && "error" in result &&
        typeof result.error === "string"
          ? result.error
          : "Could not save your reaction.";
      throw new Error(message);
    }

    const reactionResult = result as {
      counts: StoryItem["reactions"];
      userReactions: ReactionType[];
    };
    setUserReactions((previous) => ({
      ...previous,
      [storyId]: reactionResult.userReactions,
    }));
    setStories((prev) =>
      prev.map((story) =>
        story.id === storyId
          ? { ...story, reactions: reactionResult.counts }
          : story
      )
    );
  };

  const addComment = async (storyId: string, content: string): Promise<StoryComment> => {
    if (!currentUser) {
      openAuthModal("signup");
      throw new Error("Please create an account to leave a reflection.");
    }

    const response = await fetch(`/api/stories/${storyId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const result: unknown = await response.json();
    if (!response.ok) {
      const message =
        result && typeof result === "object" && "error" in result &&
        typeof result.error === "string"
          ? result.error
          : "Could not post your reflection.";
      throw new Error(message);
    }
    const newComment = result as StoryComment;

    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
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
    if (!currentUser) {
      openAuthModal("signup");
      return;
    }

    const isBookmarked = bookmarkedIds.includes(storyId);
    setBookmarkedIds((prev) =>
      isBookmarked ? prev.filter((id) => id !== storyId) : [...prev, storyId]
    );

    if (supabase) {
      if (isBookmarked) {
        supabase
          .from("Bookmark")
          .delete()
          .match({ storyId, userId: currentUser.id })
          .then();
      } else {
        supabase
          .from("Bookmark")
          .insert({ storyId, userId: currentUser.id })
          .then();
      }
    }
  };

  // Whispers / Connections
  const sendWhisperRequest = (
    storyId: string,
    storyTitle: string,
    recipientId: string,
    initialNote: string
  ): WhisperConnectionItem => {
    if (!currentUser) {
      openAuthModal("signup");
      throw new Error("Please create an account to whisper to an author.");
    }

    const connectionId = "whisper-conn-" + Date.now();
    const msgId = "msg-" + Date.now();

    const newMsg: WhisperMessageItem = {
      id: msgId,
      connectionId,
      senderId: currentUser.id,
      senderPenName: currentUser.penName,
      senderAvatarIcon: currentUser.avatarIcon,
      senderAvatarColor: currentUser.avatarColor,
      content: initialNote,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const newConnection: WhisperConnectionItem = {
      id: connectionId,
      storyId,
      storyTitle,
      initiatorId: currentUser.id,
      initiatorPenName: currentUser.penName,
      initiatorAvatarIcon: currentUser.avatarIcon,
      initiatorAvatarColor: currentUser.avatarColor,
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

    if (supabase) {
      supabase
        .from("WhisperConnection")
        .insert({
          id: connectionId,
          storyId,
          initiatorId: currentUser.id,
          recipientId,
          initialNote,
          status: "PENDING",
        })
        .then(() => {
          supabase.from("WhisperMessage").insert({
            id: msgId,
            connectionId,
            senderId: currentUser.id,
            content: initialNote,
          });
        });
    }

    setWhispers((prev) => [newConnection, ...prev]);
    return newConnection;
  };

  const respondToWhisper = (connectionId: string, status: "ACCEPTED" | "DECLINED") => {
    if (supabase) {
      supabase
        .from("WhisperConnection")
        .update({ status })
        .eq("id", connectionId)
        .then();
    }
    setWhispers((prev) =>
      prev.map((w) =>
        w.id === connectionId
          ? { ...w, status, updatedAt: new Date().toISOString() }
          : w
      )
    );
  };

  const sendWhisperMessage = (connectionId: string, content: string) => {
    if (!currentUser) return;

    const msg: WhisperMessageItem = {
      id: "msg-" + Date.now(),
      connectionId,
      senderId: currentUser.id,
      senderPenName: currentUser.penName,
      senderAvatarIcon: currentUser.avatarIcon,
      senderAvatarColor: currentUser.avatarColor,
      content,
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    if (supabase) {
      supabase.from("WhisperMessage").insert({
        id: msg.id,
        connectionId,
        senderId: currentUser.id,
        content,
      }).then();
    }

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

  const unreadWhispersCount = currentUser
    ? whispers.filter(
        (w) =>
          w.recipientId === currentUser.id &&
          (w.status === "PENDING" || (w.unreadCount && w.unreadCount > 0))
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
        isAuthModalOpen,
        authModalMode,
        isListenerModalOpen,
        setSelectedCircle,
        setSelectedMood,
        setSearchQuery,
        setAmbientTrack,
        openAuthModal,
        closeAuthModal,
        openListenerModal,
        closeListenerModal,
        signUpWithEmail,
        signInWithEmail,
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
