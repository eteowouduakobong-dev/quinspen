"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Feather,
  Clock,
  Bookmark,
  Share2,
  Check,
  MessageCircle,
  Sparkles,
  ArrowLeft,
  Volume2,
  VolumeX,
  ShieldCheck,
  Send,
  HeartHandshake,
} from "lucide-react";
import { useQuinspen } from "@/context/QuinspenContext";
import { STORY_CIRCLES } from "@/lib/quinspenData";
import { WhisperModal } from "@/components/WhisperModal";
import { ReactionType, StoryComment } from "@/types/quinspen";

const REACTION_CONFIG: {
  type: ReactionType;
  emoji: string;
  label: string;
  description: string;
}[] = [
  { type: "FELT_THIS", emoji: "🕯️", label: "Felt This", description: "Deeply understood" },
  { type: "VIRTUAL_HUG", emoji: "🫂", label: "Virtual Hug", description: "Warm embrace" },
  { type: "INSPIRED", emoji: "💫", label: "Inspired", description: "Spark of hope" },
  { type: "CATHARTIC", emoji: "🌊", label: "Cathartic", description: "Emotional release" },
  { type: "POETIC", emoji: "🖋️", label: "Poetic", description: "Beautifully penned" },
];

export function StoryReaderClient({ slug }: { slug: string }) {
  const {
    stories,
    currentUser,
    userReactions,
    toggleReaction,
    bookmarkedIds,
    toggleBookmark,
    addComment,
    ambientTrack,
    setAmbientTrack,
  } = useQuinspen();

  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("lg");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<StoryComment[]>([]);
  const [isWhisperModalOpen, setIsWhisperModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Find story
  const story = stories.find((s) => s.slug === slug);

  if (!story) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Feather className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-stone-200 mb-2">
            Story Not Found
          </h2>
          <p className="text-sm text-stone-400 mb-6">
            This anonymous memory may have been removed or placed in a private sanctuary.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-semibold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sanctuary</span>
          </Link>
        </div>
      </div>
    );
  }

  const circle = STORY_CIRCLES.find((c) => c.slug === story.circleCategory);
  const isBookmarked = bookmarkedIds.includes(story.id);
  const userStoryReactions = userReactions[story.id] || [];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = addComment(story.id, commentText.trim());
    setLocalComments((prev) => [newComment, ...prev]);
    setCommentText("");
  };

  const fontSizeClasses = {
    base: "text-base sm:text-lg leading-relaxed",
    lg: "text-lg sm:text-xl leading-relaxed",
    xl: "text-xl sm:text-2xl leading-loose",
  };

  return (
    <div
      className={`min-h-screen bg-stone-950 text-stone-100 transition-all ${
        isFocusMode ? "py-6" : "py-10"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Reader Controls */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-stone-800/80">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-stone-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stories</span>
          </Link>

          {/* Reader Preferences Bar */}
          <div className="flex items-center space-x-2">
            {/* Ambient Sound Quick Toggle */}
            <button
              onClick={() =>
                setAmbientTrack(ambientTrack === "rain" ? "none" : "rain")
              }
              className={`p-2 rounded-lg border text-xs flex items-center space-x-1.5 transition-colors ${
                ambientTrack !== "none"
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
              }`}
              title="Toggle rain ambience for deep reading"
            >
              {ambientTrack !== "none" ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {ambientTrack !== "none" ? "Rain On" : "Rain"}
              </span>
            </button>

            {/* Font Size Selector */}
            <div className="flex items-center p-1 rounded-lg bg-stone-900 border border-stone-800 text-xs">
              <button
                onClick={() => setFontSize("base")}
                className={`px-2 py-1 rounded font-serif ${
                  fontSize === "base" ? "bg-stone-800 text-amber-300 font-bold" : "text-stone-400"
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("lg")}
                className={`px-2 py-1 rounded font-serif text-sm ${
                  fontSize === "lg" ? "bg-stone-800 text-amber-300 font-bold" : "text-stone-400"
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("xl")}
                className={`px-2 py-1 rounded font-serif text-base ${
                  fontSize === "xl" ? "bg-stone-800 text-amber-300 font-bold" : "text-stone-400"
                }`}
              >
                A
              </button>
            </div>

            {/* Focus Mode */}
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isFocusMode
                  ? "bg-amber-500 text-stone-950 border-amber-400 font-semibold"
                  : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
              }`}
            >
              {isFocusMode ? "Exit Focus" : "Focus Mode"}
            </button>
          </div>
        </div>

        {/* Story Header */}
        <header className="mb-10 text-center max-w-3xl mx-auto">
          {/* Metadata pills */}
          <div className="flex items-center justify-center space-x-2 flex-wrap mb-4">
            {circle && (
              <Link
                href={`/circles`}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-900 border border-stone-800 text-stone-300 hover:border-amber-500/30 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{circle.name}</span>
              </Link>
            )}
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {story.mood}
            </span>
            <span className="flex items-center space-x-1 text-xs text-stone-500 pl-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{story.readTimeMinutes} min read</span>
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-bold text-stone-100 leading-tight mb-6">
            {story.title}
          </h1>

          {/* Author Pen Identity Box */}
          <div className="inline-flex items-center space-x-3 p-2 px-4 rounded-2xl bg-stone-900/80 border border-stone-800">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Feather className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-stone-200">
                  {story.authorPenName}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>Masked Identity</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-400 italic">
                {story.authorBio || "An anonymous traveler sharing fragments of truth."}
              </p>
            </div>
          </div>
        </header>

        {/* Story Body */}
        <article className="max-w-2xl mx-auto">
          <div
            className={`font-serif text-stone-200 ${fontSizeClasses[fontSize]} whitespace-pre-line space-y-6 select-text`}
          >
            {story.content}
          </div>

          {/* Tags */}
          {story.tags.length > 0 && (
            <div className="flex items-center space-x-2 flex-wrap pt-8 mt-10 border-t border-stone-800/80">
              <span className="text-xs text-stone-500">Themes:</span>
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md bg-stone-900 text-stone-400 text-xs font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Emotional Resonance Bar */}
          <div className="mt-12 p-6 rounded-2xl bg-stone-900/80 border border-stone-800/90 shadow-xl">
            <div className="text-center mb-4">
              <h3 className="font-serif text-lg font-bold text-stone-200">
                How did this story resonate with you?
              </h3>
              <p className="text-xs text-stone-400">
                Send an anonymous ripple of emotion to the storyteller
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {REACTION_CONFIG.map((react) => {
                const count = story.reactions[react.type] || 0;
                const hasReacted = userStoryReactions.includes(react.type);

                return (
                  <button
                    key={react.type}
                    onClick={() => toggleReaction(story.id, react.type)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      hasReacted
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300 scale-105 shadow-md shadow-amber-500/10"
                        : "bg-stone-950/70 border-stone-800 text-stone-300 hover:bg-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <span className="text-2xl mb-1">{react.emoji}</span>
                    <span className="text-xs font-semibold">{react.label}</span>
                    <span className="text-[11px] font-mono text-stone-400 mt-0.5">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Actions: Bookmark & Share */}
            <div className="flex items-center justify-between pt-5 mt-5 border-t border-stone-800/70">
              <button
                onClick={() => toggleBookmark(story.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  isBookmarked
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-400" : ""}`} />
                <span>{isBookmarked ? "Saved in Chronicle" : "Save to Chronicle"}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs font-medium text-stone-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied Link</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share Anonymously</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Anonymous Peer Whisper Connection Banner */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-stone-900 to-indigo-950/50 border border-indigo-900/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center space-x-1.5 text-indigo-400 text-xs font-semibold mb-1">
                <HeartHandshake className="w-4 h-4" />
                <span>Private Peer Connection</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-stone-100">
                Whisper to {story.authorPenName}
              </h4>
              <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                Moved by these words? Send an anonymous note directly to the author. Both of your real emails and identities stay 100% masked.
              </p>
            </div>

            <button
              onClick={() => setIsWhisperModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 whitespace-nowrap transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Private Whisper</span>
            </button>
          </div>

          {/* Reflections & Comments Section */}
          <section id="reflections" className="mt-14 pt-8 border-t border-stone-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-100">
                  Anonymous Reflections
                </h3>
                <p className="text-xs text-stone-400">
                  Thoughts left by fellow souls who walked this path
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-xs font-mono text-amber-400">
                {story.commentsCount + localComments.length} reflections
              </span>
            </div>

            {/* Leave reflection form */}
            <form onSubmit={handlePostComment} className="mb-8 space-y-3">
              <div className="relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  placeholder={`Leave a compassionate reflection as ${
                    currentUser?.penName || "Anonymous Scribe"
                  }...`}
                  className="w-full rounded-xl bg-stone-900/90 border border-stone-800 p-4 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-500 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Posting under: <strong className="text-stone-300">{currentUser?.penName || "Anonymous Scribe"}</strong></span>
                </span>

                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Reflection</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {localComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 animate-fadeIn"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-stone-800 flex items-center justify-center text-amber-400 text-xs">
                        <Feather className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-semibold text-stone-200">
                        {comment.penNameSnapshot}
                      </span>
                      {comment.isAuthor && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Author
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500">Just now</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed pl-8">
                    {comment.content}
                  </p>
                </div>
              ))}

              {/* Sample thoughtful reflections for atmosphere */}
              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md bg-stone-800 flex items-center justify-center text-amber-400 text-xs">
                      <Feather className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-stone-200">
                      Wandering Horizon
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500">Yesterday</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed pl-8">
                  "Reading this made me pause my entire day. It takes extraordinary bravery to put words to feelings we spent years hiding in the dark. Thank you for this gift."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md bg-stone-800 flex items-center justify-center text-amber-400 text-xs">
                      <Feather className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-stone-200">
                      Solitary Lantern
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500">2 days ago</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed pl-8">
                  "I had a knot in my throat reading the final three paragraphs. You are not alone in having carried that weight."
                </p>
              </div>
            </div>
          </section>
        </article>
      </div>

      {/* Whisper Modal */}
      <WhisperModal
        story={story}
        isOpen={isWhisperModalOpen}
        onClose={() => setIsWhisperModalOpen(false)}
      />
    </div>
  );
}
