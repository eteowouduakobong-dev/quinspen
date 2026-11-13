"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useQuinspen } from "@/context/QuinspenContext";

export function SafeHavenButton() {
  const { isLoggedIn, openListenerModal, openAuthModal } = useQuinspen();

  const handleClick = () => {
    if (!isLoggedIn) {
      openAuthModal("signup");
      return;
    }
    openListenerModal();
  };

  return (
    <button
      onClick={handleClick}
      title="Talk to a compassionate listener — you are not alone"
      aria-label="Talk to a listener"
      className="
        fixed bottom-6 right-6 z-40
        flex items-center gap-2 px-4 py-3
        rounded-full shadow-2xl cursor-pointer
        bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500
        text-white font-semibold text-sm
        transition-all duration-300
        hover:scale-105 hover:shadow-rose-500/40
        focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-stone-950
        animate-pulse-gentle
      "
      style={{
        animation: "gentle-pulse 3s ease-in-out infinite",
      }}
    >
      <Heart className="w-4 h-4 fill-current" />
      <span className="hidden sm:inline">Talk to Someone</span>
    </button>
  );
}
