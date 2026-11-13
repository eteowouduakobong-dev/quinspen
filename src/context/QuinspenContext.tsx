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
  generateRandomPenName,
} from "@/lib/quinspenData";
import { ambientSound } from "@/lib/ambientSound";
import { createClient } from "@/lib/supabase/client";

interface QuinspenContextType {
  currentUser: AnonymousPenIdentity | null;
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
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
  ) => Promise<{ success: boolean; error?: string }>;
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
  toggleReaction: (storyId: string, reactionType: ReactionType) => void;
  addComment: (storyId: string, content: string) => StoryComment;
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
  USER: "quinspen_user_identity_v2",
  ACCOUNTS_DB: "quinspen_registered_accounts_v2",
  STORIES: "quinspen_stories_catalog_v2",
  WHISPERS: "quinspen_whispers_v2",
  BOOKMARKS: "quinspen_bookmarks_v2",
  REACTIONS: "quinspen_reactions_v2",
};

export function QuinspenProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AnonymousPenIdentity | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);
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
  const [isInitialized, setIsInitialized] = useState(false);

  const supabase = createClient();

  // Initialize Auth & Supabase Session
  useEffect(() => {
    async function initAuth() {
      try {
        if (supabase) {
          // Check active Supabase session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const penIdentity: AnonymousPenIdentity = {
              id: session.user.id,
              email: session.user.email || "",
              penName: meta.penName || "Anonymous Scribe",
              penTag: meta.penTag || `scribe_${Math.floor(100 + Math.random() * 900)}`,
              avatarIcon: meta.avatarIcon || "feather",
              avatarColor: meta.avatarColor || "amber",
              bio: meta.bio || "A traveler in the world of untold memories.",
              createdAt: session.user.created_at,
            };
            setCurrentUser(penIdentity);
          } else {
            // Check local persistence
            const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
            if (savedUser) {
              setCurrentUser(JSON.parse(savedUser));
            }
          }

          // Listen for Supabase auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
              if (session?.user) {
                const meta = session.user.user_metadata || {};
                const penIdentity: AnonymousPenIdentity = {
                  id: session.user.id,
                  email: session.user.email || "",
                  penName: meta.penName || "Anonymous Scribe",
                  penTag: meta.penTag || `scribe_${Math.floor(100 + Math.random() * 900)}`,
                  avatarIcon: meta.avatarIcon || "feather",
                  avatarColor: meta.avatarColor || "amber",
                  bio: meta.bio || "A traveler in the world of untold memories.",
                  createdAt: session.user.created_at,
                };
                setCurrentUser(penIdentity);
              } else {
                setCurrentUser(null);
              }
            }
          );

          return () => {
            subscription.unsubscribe();
          };
        } else {
          // If Supabase credentials are not yet set in .env, check localStorage
          const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
          if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
          }
        }

        // Load data cache
        const savedStories = localStorage.getItem(STORAGE_KEYS.STORIES);
        if (savedStories) {
          const parsed = JSON.parse(savedStories);
          if (Array.isArray(parsed) && parsed.length > 0) setStories(parsed);
        }

        const savedWhispers = localStorage.getItem(STORAGE_KEYS.WHISPERS);
        if (savedWhispers) {
          const parsed = JSON.parse(savedWhispers);
          if (Array.isArray(parsed)) setWhispers(parsed);
        }

        const savedBookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
        if (savedBookmarks) setBookmarkedIds(JSON.parse(savedBookmarks));

        const savedReactions = localStorage.getItem(STORAGE_KEYS.REACTIONS);
        if (savedReactions) setUserReactions(JSON.parse(savedReactions));
      } catch {
        // Fallback
      } finally {
        setIsLoadingAuth(false);
        setIsInitialized(true);
      }
    }

    initAuth();
  }, []);

  // Sync state to localStorage for offline / persistence
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
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPenName = penName.trim() || generateRandomPenName().penName;
    const penTag = `scribe_${Math.floor(100 + Math.random() * 900)}`;

    try {
      if (supabase) {
        // Supabase Auth sign up
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

        if (data.user) {
          const newUser: AnonymousPenIdentity = {
            id: data.user.id,
            email: cleanEmail,
            penName: cleanPenName,
            penTag,
            avatarIcon: "feather",
            avatarColor: "amber",
            bio: bio || "A traveler in the world of untold memories.",
            createdAt: data.user.created_at,
          };
          setCurrentUser(newUser);

          // Sync into public."User" table in Supabase
          try {
            await supabase.from("User").upsert({
              id: data.user.id,
              email: cleanEmail,
              penName: cleanPenName,
              penTag,
              avatarIcon: "feather",
              avatarColor: "amber",
              bio: bio || "A traveler in the world of untold memories.",
            });
          } catch {}

          setIsAuthModalOpen(false);
          return { success: true };
        }
      }

      // Local persistent accounts database if Supabase env is not configured yet
      const accountsRaw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_DB);
      const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};

      if (accounts[cleanEmail]) {
        return {
          success: false,
          error: "An account with this email already exists. Please Sign In instead.",
        };
      }

      const newId = "user-" + Math.random().toString(36).substring(2, 10);
      const newUser: AnonymousPenIdentity = {
        id: newId,
        email: cleanEmail,
        penName: cleanPenName,
        penTag,
        avatarIcon: "feather",
        avatarColor: "amber",
        bio: bio || "A quiet traveler carrying untold memories.",
        createdAt: new Date().toISOString(),
      };

      accounts[cleanEmail] = {
        user: newUser,
        password, // stored locally for client evaluation
      };
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS_DB, JSON.stringify(accounts));
      setCurrentUser(newUser);
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
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const meta = data.user.user_metadata || {};
          const identity: AnonymousPenIdentity = {
            id: data.user.id,
            email: cleanEmail,
            penName: meta.penName || "Anonymous Scribe",
            penTag: meta.penTag || `scribe_${Math.floor(100 + Math.random() * 900)}`,
            avatarIcon: meta.avatarIcon || "feather",
            avatarColor: meta.avatarColor || "amber",
            bio: meta.bio || "A traveler in the world of untold memories.",
            createdAt: data.user.created_at,
          };
          setCurrentUser(identity);
          setIsAuthModalOpen(false);
          return { success: true };
        }
      }

      // Local accounts database fallback
      const accountsRaw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_DB);
      const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};

      if (!accounts[cleanEmail]) {
        return {
          success: false,
          error: "No account found with this email. Please click Sign Up to create one.",
        };
      }

      if (accounts[cleanEmail].password !== password) {
        return { success: false, error: "Incorrect password. Please try again." };
      }

      setCurrentUser(accounts[cleanEmail].user);
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
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {}
    setCurrentUser(null);
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
      authorId: currentUser.id,
      authorPenName: storyData.isGhostMode
        ? storyData.ghostAlias || "Nameless Scribe"
        : currentUser.penName,
      authorAvatarIcon: storyData.isGhostMode ? "mask" : currentUser.avatarIcon,
      authorAvatarColor: storyData.isGhostMode ? "slate" : currentUser.avatarColor,
      authorBio: storyData.isGhostMode
        ? "A temporary shadow passing through."
        : currentUser.bio,
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

    // If Supabase is connected, write to Supabase
    if (supabase) {
      try {
        await supabase.from("Story").insert({
          id,
          slug,
          title: newStory.title,
          excerpt: newStory.excerpt,
          content: newStory.content,
          mood: newStory.mood,
          circleCategory: newStory.circleCategory,
          tags: newStory.tags,
          coverTheme: newStory.coverTheme,
          readTimeMinutes: newStory.readTimeMinutes,
          isDraft: newStory.isDraft,
          isGhostMode: newStory.isGhostMode,
          ghostAlias: newStory.ghostAlias || null,
          authorId: currentUser.id,
        });
      } catch {}
    }

    setStories((prev) => [newStory, ...prev]);
    return newStory;
  };

  const deleteStory = (storyId: string) => {
    if (supabase) {
      supabase.from("Story").delete().eq("id", storyId).then();
    }
    setStories((prev) => prev.filter((s) => s.id !== storyId));
  };

  const toggleReaction = (storyId: string, reactionType: ReactionType) => {
    if (!currentUser) {
      openAuthModal("signup");
      return;
    }

    const currentList = userReactions[storyId] || [];
    const hasReacted = currentList.includes(reactionType);
    const updatedList = hasReacted
      ? currentList.filter((r) => r !== reactionType)
      : [...currentList, reactionType];

    setUserReactions((prev) => ({
      ...prev,
      [storyId]: updatedList,
    }));

    if (supabase) {
      if (hasReacted) {
        supabase
          .from("Reaction")
          .delete()
          .match({ storyId, userId: currentUser.id, type: reactionType })
          .then();
      } else {
        supabase
          .from("Reaction")
          .insert({ storyId, userId: currentUser.id, type: reactionType })
          .then();
      }
    }

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
    if (!currentUser) {
      openAuthModal("signup");
      throw new Error("Please create an account to leave a reflection.");
    }

    const newComment: StoryComment = {
      id: "comment-" + Date.now(),
      storyId,
      userId: currentUser.id,
      content,
      penNameSnapshot: currentUser.penName,
      avatarIcon: currentUser.avatarIcon,
      avatarColor: currentUser.avatarColor,
      isAuthor: false,
      createdAt: new Date().toISOString(),
    };

    if (supabase) {
      supabase
        .from("Comment")
        .insert({
          id: newComment.id,
          storyId,
          userId: currentUser.id,
          content,
          penNameSnapshot: currentUser.penName,
          avatarIcon: currentUser.avatarIcon,
          avatarColor: currentUser.avatarColor,
        })
        .then();
    }

    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          newComment.isAuthor = s.authorId === currentUser.id;
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
