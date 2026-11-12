"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookMarked,
  Feather,
  Sparkles,
  ShieldCheck,
  Eye,
  Trash2,
  Bookmark,
  HeartHandshake,
  MessageCircle,
  Shuffle,
  Clock,
  ArrowRight,
  Settings,
  Check,
} from "lucide-react";
import { useQuinspen } from "@/context/QuinspenContext";
import { StoryItem } from "@/types/quinspen";

export default function MyChroniclePage() {
  const {
    currentUser,
    stories,
    bookmarkedIds,
    userReactions,
    whispers,
    deleteStory,
    toggleBookmark,
    updatePenProfile,
    generateNewPenIdentity,
    openAuthModal,
  } = useQuinspen();

  const [activeTab, setActiveTab] = useState<
    "stories" | "bookmarks" | "resonances" | "identity"
  >("stories");

  const [editPenName, setEditPenName] = useState(currentUser?.penName || "");
  const [editBio, setEditBio] = useState(currentUser?.bio || "");
  const [isSaved, setIsSaved] = useState(false);

  const currentUserId = currentUser?.id || "user-quinspen-demo";

  // Stories authored by user
  const myStories = stories.filter((s) => s.authorId === currentUserId);

  // Bookmarked stories
  const myBookmarkedStories = stories.filter((s) =>
    bookmarkedIds.includes(s.id)
  );

  // Stories user reacted to
  const myResonatedStories = stories.filter(
    (s) => userReactions[s.id] && userReactions[s.id].length > 0
  );

  // Metrics
  const totalReads = myStories.reduce((acc, s) => acc + s.viewCount, 0);
  const totalResonancesReceived = myStories.reduce(
    (acc, s) =>
      acc +
      Object.values(s.reactions).reduce((sum, v) => sum + (v || 0), 0),
    0
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPenName.trim()) return;
    updatePenProfile({
      penName: editPenName.trim(),
      bio: editBio.trim(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl">
          <BookMarked className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-stone-100 mb-2">
            Access Your Chronicle
          </h2>
          <p className="text-xs text-stone-400 mb-6 leading-relaxed">
            Your chronicle maintains the complete record of your penned stories, saved reflections, and whispers in 100% privacy. Please sign in or create an account with your email.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal("signup")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Sign Up (New User)
            </button>
            <button
              onClick={() => openAuthModal("signin")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-800 text-stone-200 font-semibold text-xs hover:bg-stone-700 transition-colors"
            >
              Sign In (Existing)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header / Identity Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-900 border border-stone-800 p-6 sm:p-8 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
                <Feather className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
                    {currentUser?.penName || "Midnight Scribe"}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    @{currentUser?.penTag || "scribe_742"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-400 italic mt-1 max-w-md">
                  "{currentUser?.bio || "A quiet traveler carrying untold memories in ink."}"
                </p>
                <div className="flex items-center space-x-2 mt-2 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Account Email: </span>
                  <span className="font-mono text-stone-400">
                    {currentUser?.email ? currentUser.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "private@quinspen.internal"}
                  </span>
                  <span>(100% Private)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={generateNewPenIdentity}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
                title="Generate new anonymous pen name"
              >
                <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Randomize Alias</span>
              </button>

              <Link
                href="/write"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                <Feather className="w-3.5 h-3.5" />
                <span>Pen New Story</span>
              </Link>
            </div>
          </div>

          {/* Record Summary Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-stone-800/80">
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <p className="text-2xl font-serif font-bold text-stone-100">
                {myStories.length}
              </p>
              <p className="text-xs text-stone-400">Penned Stories</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <p className="text-2xl font-serif font-bold text-amber-400">
                {totalResonancesReceived}
              </p>
              <p className="text-xs text-stone-400">Resonances Received</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <p className="text-2xl font-serif font-bold text-indigo-400">
                {whispers.length}
              </p>
              <p className="text-xs text-stone-400">Whisper Dialogues</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
              <p className="text-2xl font-serif font-bold text-stone-300">
                {totalReads}
              </p>
              <p className="text-xs text-stone-400">Lifetime Reads</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-stone-800 pb-2 mb-8 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab("stories")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === "stories"
                ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/10"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>My Penned Stories ({myStories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === "bookmarks"
                ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/10"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved in Chronicle ({myBookmarkedStories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("resonances")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === "resonances"
                ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/10"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Stories I Resonated With ({myResonatedStories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("identity")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === "identity"
                ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/10"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pen Identity & Privacy</span>
          </button>
        </div>

        {/* Tab 1: My Penned Stories */}
        {activeTab === "stories" && (
          <div className="space-y-4">
            {myStories.length > 0 ? (
              myStories.map((story) => (
                <div
                  key={story.id}
                  className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-700 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-300">
                        {story.mood}
                      </span>
                      <span className="text-xs text-stone-500">
                        Penned {new Date(story.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link
                      href={`/story/${story.slug}`}
                      className="font-serif text-lg font-bold text-stone-100 hover:text-amber-300 transition-colors block"
                    >
                      {story.title}
                    </Link>

                    <div className="flex items-center space-x-4 text-xs text-stone-400 pt-1">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>{story.viewCount} reads</span>
                      </span>
                      <span>•</span>
                      <span>
                        {Object.values(story.reactions).reduce(
                          (sum, v) => sum + (v || 0),
                          0
                        )}{" "}
                        resonances
                      </span>
                      <span>•</span>
                      <span>{story.commentsCount} reflections</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/story/${story.slug}`}
                      className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-200 text-xs font-semibold hover:bg-stone-700 transition-colors"
                    >
                      View Story
                    </Link>
                    <button
                      onClick={() => deleteStory(story.id)}
                      className="p-2 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove from Chronicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center rounded-2xl bg-stone-900/40 border border-stone-800 p-8">
                <Feather className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-stone-200 mb-1">
                  You Haven't Penned Any Stories Yet
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto mb-5">
                  Your voice deserves to be heard without fear of exposure. Write your first story into the sanctuary.
                </p>
                <Link
                  href="/write"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  <Feather className="w-4 h-4" />
                  <span>Pen My First Story</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Bookmarked Stories */}
        {activeTab === "bookmarks" && (
          <div className="space-y-4">
            {myBookmarkedStories.length > 0 ? (
              myBookmarkedStories.map((story) => (
                <div
                  key={story.id}
                  className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <span className="text-[11px] text-stone-500">
                      By {story.authorPenName}
                    </span>
                    <Link
                      href={`/story/${story.slug}`}
                      className="font-serif text-lg font-bold text-stone-100 hover:text-amber-300 transition-colors block"
                    >
                      {story.title}
                    </Link>
                    <p className="text-xs text-stone-400 line-clamp-1">
                      {story.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/story/${story.slug}`}
                      className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-200 text-xs font-semibold hover:bg-stone-700 transition-colors"
                    >
                      Read
                    </Link>
                    <button
                      onClick={() => toggleBookmark(story.id)}
                      className="p-2 rounded-lg text-amber-400 hover:text-stone-400 transition-colors"
                      title="Remove bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center rounded-2xl bg-stone-900/40 border border-stone-800 p-8">
                <Bookmark className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-stone-200 mb-1">
                  No Saved Stories Yet
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto mb-5">
                  When you encounter a story that moves you, click the bookmark icon to preserve it in your chronicle.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-stone-800 text-stone-200 text-xs font-semibold"
                >
                  <span>Explore Stories</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Resonated Stories */}
        {activeTab === "resonances" && (
          <div className="space-y-4">
            {myResonatedStories.length > 0 ? (
              myResonatedStories.map((story) => (
                <div
                  key={story.id}
                  className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[11px] text-amber-400 font-semibold">
                        You felt this:
                      </span>
                      <div className="flex items-center space-x-1">
                        {(userReactions[story.id] || []).map((r) => (
                          <span
                            key={r}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={`/story/${story.slug}`}
                      className="font-serif text-base font-bold text-stone-100 hover:text-amber-300 transition-colors block"
                    >
                      {story.title}
                    </Link>
                  </div>

                  <Link
                    href={`/story/${story.slug}`}
                    className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-200 text-xs font-semibold hover:bg-stone-700 transition-colors whitespace-nowrap"
                  >
                    Re-read
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-16 text-center rounded-2xl bg-stone-900/40 border border-stone-800 p-8">
                <HeartHandshake className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-stone-200 mb-1">
                  No Resonances Left Yet
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Send emotional reactions (🕯️ Felt This, 🫂 Hug, 💫 Inspired) to storytellers as you browse.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Pen Identity & Security */}
        {activeTab === "identity" && (
          <div className="max-w-xl mx-auto space-y-6">
            <form
              onSubmit={handleSaveProfile}
              className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4"
            >
              <h3 className="font-serif text-lg font-bold text-stone-100">
                Customize Anonymous Pen Mask
              </h3>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">
                  Pen Name
                </label>
                <input
                  type="text"
                  value={editPenName}
                  onChange={(e) => setEditPenName(e.target.value)}
                  className="w-full rounded-xl bg-stone-950 border border-stone-800 px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">
                  Anonymous Bio / Tagline
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-stone-950 border border-stone-800 p-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{isSaved ? "Saved" : "Save Changes"}</span>
                </button>
              </div>
            </form>

            {/* Anonymity Audit Report Card */}
            <div className="p-6 rounded-2xl bg-stone-900/50 border border-emerald-900/40 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="font-serif font-bold text-sm text-stone-100">
                  QUINSPEN Security & Anonymity Audit
                </h4>
              </div>
              <ul className="text-xs text-stone-400 space-y-2 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Zero PII Exposure: </strong>Your email is never returned in story or whisper queries.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Encrypted Peer Whispers: </strong>Direct messages are conducted strictly under anonymous pseudonyms.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Persistent Personal Chronicle: </strong>Your account safely maintains the history of your contributions without exposing you to the public.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
