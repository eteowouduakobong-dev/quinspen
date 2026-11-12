import React, { Suspense } from "react";
import { StoryReaderClient } from "@/components/StoryReaderClient";
import { INITIAL_STORIES } from "@/lib/quinspenData";

export function generateStaticParams() {
  return INITIAL_STORIES.map((story) => ({
    slug: story.slug,
  }));
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center p-8 text-stone-400">
          <div className="animate-pulse flex flex-col items-center space-y-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/30" />
            <p className="text-xs font-serif">Opening anonymous story...</p>
          </div>
        </div>
      }
    >
      <StoryReaderClient slug={slug} />
    </Suspense>
  );
}
