import React, { Suspense } from "react";
import { StoryReaderClient } from "@/components/StoryReaderClient";

// No generateStaticParams → route renders on every request (all stories are user-created at runtime)

const LoadingFallback = (
  <div className="min-h-screen bg-stone-950 flex items-center justify-center p-8 text-stone-400">
    <div className="animate-pulse flex flex-col items-center space-y-3">
      <div className="w-8 h-8 rounded-full bg-amber-500/30" />
      <p className="text-xs font-serif">Opening anonymous story...</p>
    </div>
  </div>
);

async function StoryLoader({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StoryReaderClient slug={slug} />;
}

export default function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={LoadingFallback}>
      <StoryLoader params={params} />
    </Suspense>
  );
}
