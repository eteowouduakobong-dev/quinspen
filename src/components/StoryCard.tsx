"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Feather,
  Clock,
  Bookmark,
  MessageSquare,
  MessageCircle,
  Share2,
  Check,
  Sparkles,
} from "lucide-react";
import { StoryItem, ReactionType } from "@/types/quinspen";
import { useQuinspen } from "@/context/QuinspenContext";
import { STORY_CIRCLES } from "@/lib/quinspenData";

interface StoryCardProps {
  story: StoryItem;
  onWhisperClick?: (story: StoryItem) => void;
}

const REACTION_CONFIG: {
  type: ReactionType;
  emoji: string;
  label: string;
  color: string;
}[] = [
  { type: "FELT_THIS", emoji: "🕯️", label: "Felt This", color: "hover:text-amber-400" },
  { type: "VIRTUAL_HUG", emoji: "🫂", label: "Hug", color: "hover:text-rose-400" },
  { type: "INSPIRED", emoji: "💫", label: "Inspired", color: "hover:text-yellow-400" },
  { type: "CATHARTIC", emoji: "🌊", label: "Cathartic", color: "hover:text-cyan-400" },
  { type: "POETIC", emoji: "🖋️", label: "Poetic", color: "hover:text-purple-400" },
];

export function StoryCard({ story, onWhisperClick }: StoryCardProps) {
  const { toggleReaction, userReactions, toggleBookmark, bookmarkedIds } = useQuinspen();
  const [copied, setCopied] = useState(false);
  const [interactionError, setInteractionError] = useState<string | null>(null);

  const isBookmarked = bookmarkedIds.includes(story.id);
  const userStoryReactions = userReactions[story.id] || [];

  const circle = STORY_CIRCLES.find((c) => c.slug === story.circleCategory);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/story/${story.slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <article className="group relative rounded-2xl bg-stone-900/70 border border-stone-800/90 hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between overflow-hidden">
      {/* Top subtle glow bar */}
      <div className="h-1 w-full bg-gradient-to-r from-stone-800 via-amber-500/30 to-stone-800 group-hover:from-amber-500/50 group-hover:via-amber-400 group-hover:to-amber-500/50 transition-all duration-500" />

      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        {/* Header Tags: Circle & Mood */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2 flex-wrap">
            {circle && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-800/90 text-stone-300 border border-stone-700/60">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>{circle.name}</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {story.mood}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-stone-500 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{story.readTimeMinutes} min</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/story/${story.slug}`} className="block group-hover:text-amber-200 transition-colors">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 leading-snug line-clamp-2 mb-2.5">
            {story.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-stone-400 line-clamp-3 leading-relaxed mb-4 flex-1">
          {story.excerpt}
        </p>

        {/* Author Anonymous Persona Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-800/70 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
              <Feather className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-200">
                {story.authorPenName}
              </p>
              <p className="text-[10px] text-stone-500">
                {new Date(story.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Bookmark & Whisper Action Buttons */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => toggleBookmark(story.id)}
              className={`p-1.5 rounded-lg border transition-all ${
                isBookmarked
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-stone-800/60 text-stone-400 border-stone-700/60 hover:text-stone-200"
              }`}
              title={isBookmarked ? "Remove from chronicle" : "Bookmark to chronicle"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400" : ""}`} />
            </button>

            {onWhisperClick && (
              <button
                onClick={() => onWhisperClick(story)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-medium transition-all"
                title="Send anonymous whisper to author"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Whisper</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-stone-800/60 text-stone-400 border border-stone-700/60 hover:text-stone-200 transition-all"
              title="Copy anonymous link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Interactive Emotional Resonances Bar */}
        <div className="flex items-center justify-between gap-1 pt-2 border-t border-stone-800/50">
          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-wrap">
            {REACTION_CONFIG.map((react) => {
              const count = story.reactions[react.type] || 0;
              const hasReacted = userStoryReactions.includes(react.type);

              return (
                <button
                  key={react.type}
                  onClick={(e) => {
                    e.preventDefault();
                    setInteractionError(null);
                    void toggleReaction(story.id, react.type).catch((error: unknown) => {
                      setInteractionError(
                        error instanceof Error
                          ? error.message
                          : "Could not save your reaction."
                      );
                    });
                  }}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
                    hasReacted
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10 scale-105"
                      : "bg-stone-800/40 border-stone-800 text-stone-400 hover:bg-stone-800 hover:border-stone-700"
                  }`}
                  title={react.label}
                >
                  <span className="text-xs">{react.emoji}</span>
                  {count > 0 && <span className="text-[11px] font-mono">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Reflections/Comments link */}
          <Link
            href={`/story/${story.slug}#reflections`}
            className="flex items-center space-x-1 text-xs text-stone-500 hover:text-stone-300 transition-colors py-1 px-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-mono">{story.commentsCount}</span>
          </Link>
        </div>
        {interactionError && (
          <p role="alert" className="pt-2 text-[11px] text-rose-300">
            {interactionError}
          </p>
        )}
      </div>
    </article>
  );
}
