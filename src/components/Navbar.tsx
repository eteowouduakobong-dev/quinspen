"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Feather,
  Compass,
  PenLine,
  MessageCircle,
  BookMarked,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  UserCheck,
  LogIn,
  ChevronDown,
  LogOut,
  Flame,
  CloudRain,
  Wind,
  Shuffle,
} from "lucide-react";
import { useQuinspen } from "@/context/QuinspenContext";

export function Navbar() {
  const pathname = usePathname();
  const {
    currentUser,
    unreadWhispersCount,
    ambientTrack,
    setAmbientTrack,
    openAuthModal,
    generateNewPenIdentity,
    signOut,
  } = useQuinspen();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);

  const navLinks = [
    { label: "Explore", href: "/", icon: Compass },
    { label: "Circles", href: "/circles", icon: Sparkles },
    { label: "Write", href: "/write", icon: PenLine },
    {
      label: "Whispers",
      href: "/whispers",
      icon: MessageCircle,
      badge: unreadWhispersCount > 0 ? unreadWhispersCount : null,
    },
    { label: "My Chronicle", href: "/journal", icon: BookMarked },
  ];

  const audioOptions: { id: "none" | "rain" | "fire" | "wind"; label: string; icon: typeof Volume2 }[] = [
    { id: "none", label: "Mute Ambience", icon: VolumeX },
    { id: "rain", label: "Gentle Rain", icon: CloudRain },
    { id: "fire", label: "Midnight Fire", icon: Flame },
    { id: "wind", label: "Night Wind", icon: Wind },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-400 p-[1px] shadow-lg shadow-amber-500/10 group-hover:shadow-amber-500/25 transition-all">
              <div className="w-full h-full bg-stone-950 rounded-[11px] flex items-center justify-center">
                <Feather className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif text-xl font-bold tracking-wider text-stone-100 group-hover:text-amber-300 transition-colors">
                  QUINSPEN
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-medium tracking-tight rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  ANONYMOUS
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-sans tracking-tight hidden sm:block">
                The Quill of Untold Stories
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                      : "text-stone-300 hover:text-stone-100 hover:bg-stone-900/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Ambient Sound & Distinct Auth Buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Ambient Sound Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  ambientTrack !== "none"
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10 animate-pulse"
                    : "bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                }`}
                title="Toggle ambient background sounds"
              >
                {ambientTrack === "none" ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="capitalize hidden lg:inline">
                  {ambientTrack === "none" ? "Ambience" : ambientTrack}
                </span>
              </button>

              {isAudioMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-stone-900 border border-stone-800 shadow-2xl p-1.5 z-50 animate-fadeIn"
                  onMouseLeave={() => setIsAudioMenuOpen(false)}
                >
                  <p className="px-2.5 py-1 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Soundscapes
                  </p>
                  {audioOptions.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = ambientTrack === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setAmbientTrack(opt.id);
                          setIsAudioMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-amber-500/20 text-amber-300 font-semibold"
                            : "text-stone-300 hover:bg-stone-800/80 hover:text-white"
                        }`}
                      >
                        <OptIcon className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Profile / Distinct Sign In & Sign Up Buttons */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/30 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Feather className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium text-stone-200 leading-tight">
                      {currentUser.penName}
                    </p>
                    <p className="text-[10px] text-amber-400/80 font-mono leading-none">
                      @{currentUser.penTag}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500 hidden sm:block" />
                </button>

                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-stone-900 border border-stone-800 shadow-2xl p-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="p-2 border-b border-stone-800/80 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-200">
                          {currentUser.penName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Identity Masked</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        @{currentUser.penTag}
                      </p>
                      <p className="text-[11px] text-stone-400 italic mt-1 line-clamp-1">
                        &ldquo;{currentUser.bio || "Untold reflections"}&rdquo;
                      </p>
                    </div>

                    <Link
                      href="/journal"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
                    >
                      <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                      <span>My Chronicle & Records</span>
                    </Link>

                    <button
                      onClick={() => {
                        generateNewPenIdentity();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Randomize Pen Name</span>
                    </button>

                    <button
                      onClick={() => {
                        signOut();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-stone-800/80 mt-1 pt-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Sign In Button (Existing Users) */}
                <button
                  onClick={() => openAuthModal("signin")}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900/90 text-stone-300 hover:text-white hover:border-amber-500/40 font-medium text-xs transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-stone-400" />
                  <span>Sign In</span>
                </button>

                {/* Sign Up Button (New Users) */}
                <button
                  onClick={() => openAuthModal("signup")}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-stone-800/60 bg-stone-950/95 px-2 py-1.5 flex justify-around">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                isActive ? "text-amber-400" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {link.badge && (
                  <span className="absolute -top-1 -right-2 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
