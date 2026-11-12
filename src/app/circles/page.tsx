"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Feather,
  Moon,
  HeartHandshake,
  Compass,
  Star,
  BookOpen,
  ArrowRight,
  PenLine,
} from "lucide-react";
import { STORY_CIRCLES } from "@/lib/quinspenData";
import { useQuinspen } from "@/context/QuinspenContext";
import { CircleSlug } from "@/types/quinspen";

const ICON_MAP: Record<string, React.ElementType> = {
  Moon: Moon,
  HeartHandshake: HeartHandshake,
  Sparkles: Sparkles,
  Compass: Compass,
  Star: Star,
  Feather: Feather,
  BookOpen: BookOpen,
};

export default function CirclesPage() {
  const router = useRouter();
  const { stories, setSelectedCircle } = useQuinspen();

  const handleSelectCircle = (slug: CircleSlug) => {
    setSelectedCircle(slug);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Thematic Story Sanctuaries</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-100 mb-4">
            Explore Story Circles
          </h1>
          <p className="text-sm sm:text-base text-stone-400 leading-relaxed">
            Every human heart carries different frequencies of silence. Choose a circle to enter spaces dedicated to specific depths of human experience.
          </p>
        </div>

        {/* Circles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STORY_CIRCLES.map((circle) => {
            const Icon = ICON_MAP[circle.icon] || Sparkles;
            const count = stories.filter((s) => s.circleCategory === circle.slug).length;

            return (
              <div
                key={circle.slug}
                className="group relative rounded-2xl bg-stone-900/80 border border-stone-800/90 hover:border-amber-500/40 p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/60"
              >
                {/* Glow layer */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`}
                  style={{ backgroundColor: circle.accentColor }}
                />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner"
                      style={{
                        backgroundColor: `${circle.accentColor}15`,
                        borderColor: `${circle.accentColor}40`,
                        color: circle.accentColor,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-400">
                      {count} stories
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-stone-100 mb-2 group-hover:text-amber-200 transition-colors">
                    {circle.name}
                  </h3>

                  <p
                    className="text-xs font-medium italic mb-3"
                    style={{ color: circle.accentColor }}
                  >
                    "{circle.tagline}"
                  </p>

                  <p className="text-xs text-stone-400 leading-relaxed">
                    {circle.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-5 border-t border-stone-800/80 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleSelectCircle(circle.slug)}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-200 text-xs font-semibold transition-all group-hover:bg-stone-800"
                  >
                    <span>Read Circle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/write`}
                    className="p-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 hover:text-amber-300 hover:border-amber-500/40 transition-all"
                    title="Write a story in this circle"
                  >
                    <PenLine className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
