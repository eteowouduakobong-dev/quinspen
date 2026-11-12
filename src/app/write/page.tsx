"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Feather,
  Sparkles,
  ShieldCheck,
  Eye,
  Edit3,
  Clock,
  Send,
  Save,
  HelpCircle,
  Ghost,
  User,
  Quote,
  SeparatorHorizontal,
} from "lucide-react";
import { useQuinspen } from "@/context/QuinspenContext";
import { STORY_CIRCLES } from "@/lib/quinspenData";
import { CircleSlug, MoodType } from "@/types/quinspen";

export default function WriteStoryPage() {
  const router = useRouter();
  const { currentUser, publishStory, setIsAuthModalOpen } = useQuinspen();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [circle, setCircle] = useState<CircleSlug>("midnight-confessions");
  const [mood, setMood] = useState<MoodType>("Vulnerable");
  const [tagsInput, setTagsInput] = useState("");
  const [coverTheme, setCoverTheme] = useState("twilight-ink");
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [ghostAlias, setGhostAlias] = useState("Nameless Scribe");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isPublishing, setIsPublishing] = useState(false);

  // Compute word count and reading time
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

  const moods: MoodType[] = [
    "Vulnerable",
    "Nostalgic",
    "Confessional",
    "Hopeful",
    "Cathartic",
    "Poetic",
    "Bittersweet",
  ];

  const handleInsertFormat = (formatType: "quote" | "divider") => {
    if (formatType === "quote") {
      setContent((prev) => prev + '\n\n"Insert poignant quotation here..."\n\n');
    } else {
      setContent((prev) => prev + "\n\n---\n\n");
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsPublishing(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const excerpt =
      content.length > 180 ? content.slice(0, 180).trim() + "..." : content.trim();

    const created = publishStory({
      title: title.trim(),
      excerpt,
      content: content.trim(),
      circleCategory: circle,
      mood,
      tags,
      coverTheme,
      readTimeMinutes,
      isDraft: false,
      isGhostMode,
      ghostAlias: isGhostMode ? ghostAlias.trim() || "Nameless Scribe" : undefined,
    });

    setTimeout(() => {
      setIsPublishing(false);
      router.push(`/story/${created.slug}`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-stone-800 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-medium mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anonymity Shield Active</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
              Story Studio
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Release what you have carried in silence into the sanctuary.
            </p>
          </div>

          {/* Tab Switcher: Write vs Preview */}
          <div className="flex items-center p-1 rounded-xl bg-stone-900 border border-stone-800 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "write"
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "preview"
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Identity & Persona Selector Card */}
        <div className="mb-8 p-5 rounded-2xl bg-stone-900/70 border border-stone-800/90 shadow-lg">
          <h3 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Author Persona & Anonymity Level</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Account Pen Name */}
            <div
              onClick={() => setIsGhostMode(false)}
              className={`cursor-pointer p-4 rounded-xl border transition-all ${
                !isGhostMode
                  ? "bg-amber-500/10 border-amber-500/40 text-stone-100"
                  : "bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <Feather className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-stone-200">
                    My Pen Identity
                  </span>
                </div>
                {!isGhostMode && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
              <p className="text-sm font-semibold text-amber-300">
                {currentUser?.penName || "Midnight Scribe"}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                Linked to your private account record so you can track views and whispers.
              </p>
            </div>

            {/* Total Ghost Mode */}
            <div
              onClick={() => setIsGhostMode(true)}
              className={`cursor-pointer p-4 rounded-xl border transition-all ${
                isGhostMode
                  ? "bg-indigo-500/10 border-indigo-500/40 text-stone-100"
                  : "bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <Ghost className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-stone-200">
                    Total Ghost Mode
                  </span>
                </div>
                {isGhostMode && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                )}
              </div>
              <p className="text-sm font-semibold text-indigo-300">
                Transient Shadow
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                Detaches even your Pen Name. Shows as a one-time anonymous alias.
              </p>
            </div>
          </div>

          {isGhostMode && (
            <div className="mt-4 pt-3 border-t border-stone-800/70 animate-fadeIn">
              <label className="block text-xs font-medium text-stone-400 mb-1">
                Custom Ghost Alias (Optional)
              </label>
              <input
                type="text"
                value={ghostAlias}
                onChange={(e) => setGhostAlias(e.target.value)}
                placeholder="e.g. A Passing Soul, Scribe #99"
                className="w-full sm:w-72 rounded-lg bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {activeTab === "write" ? (
          <form onSubmit={handlePublish} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Story Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Give your memory or confession a resonant title..."
                className="w-full rounded-2xl bg-stone-900/90 border border-stone-800 p-4 text-xl sm:text-2xl font-serif text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            {/* Categorization: Circle & Mood */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1.5">
                  Story Circle
                </label>
                <select
                  value={circle}
                  onChange={(e) => setCircle(e.target.value as CircleSlug)}
                  className="w-full rounded-xl bg-stone-900 border border-stone-800 p-3 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  {STORY_CIRCLES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1.5">
                  Primary Emotion / Mood
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as MoodType)}
                  className="w-full rounded-xl bg-stone-900 border border-stone-800 p-3 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  {moods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Formatting Helpers */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleInsertFormat("quote")}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-400 hover:text-amber-300 transition-colors"
                >
                  <Quote className="w-3 h-3" />
                  <span>Insert Quote</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat("divider")}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-400 hover:text-amber-300 transition-colors"
                >
                  <SeparatorHorizontal className="w-3 h-3" />
                  <span>Insert Section Break</span>
                </button>
              </div>

              <div className="flex items-center space-x-3 text-xs text-stone-500 font-mono">
                <span>{words} words</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>~{readTimeMinutes} min read</span>
                </span>
              </div>
            </div>

            {/* Main Content Area */}
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={14}
                placeholder="Begin your story here. Do not worry about perfection or consequence. Nobody knows who you are..."
                className="w-full rounded-2xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 font-serif text-base sm:text-lg text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-y leading-relaxed"
              />
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Thematic Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. rain, confession, regret, childhood, secret"
                className="w-full rounded-xl bg-stone-900 border border-stone-800 p-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Safety Guarantee Banner */}
            <div className="p-4 rounded-xl bg-stone-900/50 border border-stone-800/80 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-400 leading-relaxed">
                <strong className="text-stone-200">Anonymity Certified: </strong>
                Your story will be published without IP addresses, real names, or emails. Other users will be able to read, resonate, and send you masked whispers safely.
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-5 py-2.5 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
              >
                Discard
              </button>

              <button
                type="submit"
                disabled={isPublishing || !title.trim() || !content.trim()}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isPublishing ? "Publishing to Sanctuary..." : "Publish Anonymously"}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Live Preview Mode */
          <div className="p-6 sm:p-10 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold uppercase">
                  {mood}
                </span>
                <span className="text-stone-500">•</span>
                <span className="text-stone-400 font-medium">
                  {STORY_CIRCLES.find((c) => c.slug === circle)?.name}
                </span>
                <span className="text-stone-500">•</span>
                <span className="text-stone-500">{readTimeMinutes} min read</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
                {title || "Untitled Anonymous Story"}
              </h1>

              <div className="flex items-center space-x-2 py-3 border-y border-stone-800 text-xs text-stone-400">
                <Feather className="w-4 h-4 text-amber-400" />
                <span>
                  By{" "}
                  <strong className="text-stone-200">
                    {isGhostMode ? ghostAlias || "Nameless Scribe" : currentUser?.penName || "Midnight Scribe"}
                  </strong>
                </span>
                <span>•</span>
                <span>Just now</span>
              </div>

              <div className="font-serif text-stone-200 text-lg leading-relaxed whitespace-pre-line space-y-4">
                {content || "Your written paragraphs will appear formatted here in preview mode."}
              </div>

              <div className="pt-6 border-t border-stone-800 flex justify-end">
                <button
                  onClick={() => setActiveTab("write")}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-stone-950 font-semibold text-xs"
                >
                  Return to Editing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
