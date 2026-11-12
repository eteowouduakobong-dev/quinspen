"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Feather,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  BookMarked,
  Search,
  Filter,
  ArrowRight,
  Flame,
  Clock,
  HeartHandshake,
} from "lucide-react";
import { useQuinspen } from "@/context/QuinspenContext";
import { StoryCard } from "@/components/StoryCard";
import { WhisperModal } from "@/components/WhisperModal";
import { STORY_CIRCLES } from "@/lib/quinspenData";
import { StoryItem, CircleSlug, MoodType } from "@/types/quinspen";

export default function HomePage() {
  const {
    stories,
    selectedCircle,
    setSelectedCircle,
    selectedMood,
    setSelectedMood,
    searchQuery,
    setSearchQuery,
    currentUser,
    setIsAuthModalOpen,
  } = useQuinspen();

  const [activeStoryForWhisper, setActiveStoryForWhisper] = useState<StoryItem | null>(null);
  const [sortBy, setSortBy] = useState<"trending" | "latest" | "resonances">("trending");

  const moods: MoodType[] = [
    "Vulnerable",
    "Nostalgic",
    "Confessional",
    "Hopeful",
    "Cathartic",
    "Poetic",
    "Bittersweet",
  ];

  // Filter and sort stories
  const filteredStories = useMemo(() => {
    return stories
      .filter((story) => {
        if (selectedCircle !== "all" && story.circleCategory !== selectedCircle) {
          return false;
        }
        if (selectedMood !== "all" && story.mood !== selectedMood) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = story.title.toLowerCase().includes(q);
          const matchExcerpt = story.excerpt.toLowerCase().includes(q);
          const matchAuthor = story.authorPenName.toLowerCase().includes(q);
          const matchTags = story.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchExcerpt && !matchAuthor && !matchTags) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "latest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "resonances") {
          const totalA = Object.values(a.reactions).reduce((sum, v) => sum + (v || 0), 0);
          const totalB = Object.values(b.reactions).reduce((sum, v) => sum + (v || 0), 0);
          return totalB - totalA;
        }
        // Trending: views + resonances
        const scoreA =
          a.viewCount +
          Object.values(a.reactions).reduce((sum, v) => sum + (v || 0), 0) * 4;
        const scoreB =
          b.viewCount +
          Object.values(b.reactions).reduce((sum, v) => sum + (v || 0), 0) * 4;
        return scoreB - scoreA;
      });
  }, [stories, selectedCircle, selectedMood, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-stone-800/80 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-gradient-to-tr from-amber-500/10 via-amber-600/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Identity Shield Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium mb-6 animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Identity Shielded · Zero Real Name Exposure</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-100 leading-[1.1] mb-6">
            Untold Stories. <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Zero Exposure.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed mb-8">
            QUINSPEN is an anonymous storytelling sanctuary. Sign up to safely record your journey, release unspoken truths into thematic circles, and connect with other souls through masked peer whispers.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/write"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 group"
            >
              <Feather className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
              <span>Pen an Anonymous Story</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/circles"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-white text-sm font-medium transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Browse 7 Story Circles</span>
            </Link>

            {!currentUser && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-5 py-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-sm font-medium transition-all"
              >
                <span>Create Pen Account</span>
              </button>
            )}
          </div>

          {/* Quick Stats Ticker */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-stone-800/60 pt-8 max-w-4xl mx-auto">
            <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/40">
              <p className="text-xl sm:text-2xl font-serif font-bold text-amber-400">100%</p>
              <p className="text-xs text-stone-400">Identity Masked</p>
            </div>
            <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/40">
              <p className="text-xl sm:text-2xl font-serif font-bold text-stone-200">5,820+</p>
              <p className="text-xs text-stone-400">Stories Penned</p>
            </div>
            <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/40">
              <p className="text-xl sm:text-2xl font-serif font-bold text-indigo-400">19,400+</p>
              <p className="text-xs text-stone-400">Whispers Exchanged</p>
            </div>
            <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/40">
              <p className="text-xl sm:text-2xl font-serif font-bold text-rose-400">48,000+</p>
              <p className="text-xs text-stone-400">Tears & Hugs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feed Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Filter & Controls Toolbar */}
        <div className="space-y-4 mb-8">
          {/* Top Row: Search and Sort */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search untold stories, feelings, or tags..."
                className="w-full rounded-xl bg-stone-900/90 border border-stone-800 pl-10 pr-4 py-2.5 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 p-1 rounded-xl bg-stone-900 border border-stone-800 text-xs">
                <button
                  onClick={() => setSortBy("trending")}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    sortBy === "trending"
                      ? "bg-amber-500/20 text-amber-300 font-semibold"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Trending</span>
                </button>
                <button
                  onClick={() => setSortBy("resonances")}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    sortBy === "resonances"
                      ? "bg-amber-500/20 text-amber-300 font-semibold"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Deep Resonances</span>
                </button>
                <button
                  onClick={() => setSortBy("latest")}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    sortBy === "latest"
                      ? "bg-amber-500/20 text-amber-300 font-semibold"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Latest</span>
                </button>
              </div>
            </div>
          </div>

          {/* Circles Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCircle("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                selectedCircle === "all"
                  ? "bg-amber-500 text-stone-950 font-semibold border-amber-400 shadow-sm shadow-amber-500/20"
                  : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
              }`}
            >
              All Circles
            </button>
            {STORY_CIRCLES.map((circle) => {
              const isSelected = selectedCircle === circle.slug;
              return (
                <button
                  key={circle.slug}
                  onClick={() => setSelectedCircle(circle.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                    isSelected
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                      : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                  }`}
                >
                  {circle.name}
                </button>
              );
            })}
          </div>

          {/* Mood Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-stone-500 flex items-center space-x-1 pl-1">
              <Filter className="w-3 h-3" />
              <span>Mood:</span>
            </span>
            <button
              onClick={() => setSelectedMood("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedMood === "all"
                  ? "text-amber-300 font-semibold bg-stone-800"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              Any
            </button>
            {moods.map((mood) => {
              const isSelected = selectedMood === mood;
              return (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? "text-amber-300 font-semibold bg-stone-800"
                      : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stories Grid */}
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onWhisperClick={(st) => setActiveStoryForWhisper(st)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-2xl bg-stone-900/40 border border-stone-800/80 p-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-stone-800 flex items-center justify-center text-amber-400 mb-4">
              <Feather className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-200 mb-2">
              No Untold Stories Found
            </h3>
            <p className="text-sm text-stone-400 max-w-md mx-auto mb-6">
              No stories match your current filters. Be the first anonymous voice to break the silence in this circle.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => {
                  setSelectedCircle("all");
                  setSelectedMood("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-medium text-stone-300 hover:bg-stone-700 transition-colors"
              >
                Clear Filters
              </button>
              <Link
                href="/write"
                className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-semibold hover:bg-amber-400 transition-colors"
              >
                Pen the First Story
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Whisper Modal */}
      <WhisperModal
        story={activeStoryForWhisper}
        isOpen={!!activeStoryForWhisper}
        onClose={() => setActiveStoryForWhisper(null)}
      />
    </div>
  );
}
