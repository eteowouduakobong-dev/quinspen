"use client";

import React, { useState } from "react";
import {
  Feather,
  ShieldCheck,
  Shuffle,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  UserCheck,
  LogIn,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useQuinspen } from "@/context/QuinspenContext";
import { generateRandomPenName } from "@/lib/quinspenData";

export function SanctuaryEntryGate() {
  const {
    currentUser,
    isLoadingAuth,
    signUpWithEmail,
    signInWithEmail,
  } = useQuinspen();

  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [penName, setPenName] = useState("Velvet Wanderer");
  const [bio, setBio] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in or checking session, don't show gate
  if (isLoadingAuth || currentUser) {
    return null;
  }

  const handleRandomizePenName = () => {
    const generated = generateRandomPenName();
    setPenName(generated.penName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        const res = await signUpWithEmail(email, password, penName, bio);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to create account.");
        } else if (res.confirmationRequired) {
          setSuccessMessage("Account created. Check your email to confirm it before signing in.");
        } else {
          setSuccessMessage("Account created successfully! Entering the sanctuary...");
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (!res.success) {
          setErrorMessage(res.error || "Sign in failed. Please check your credentials.");
        } else {
          setSuccessMessage("Welcome back to your chronicle!");
        }
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/95 backdrop-blur-xl overflow-y-auto animate-fadeIn">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-gradient-to-tr from-amber-500/10 via-amber-600/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl p-6 sm:p-9 my-8 overflow-hidden z-10">
        {/* Top Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sanctuary Entry Gate · Connected to Supabase</span>
          </div>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-400 p-[1.5px] shadow-xl shadow-amber-500/20 mb-4">
            <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center">
              <Feather className="w-7 h-7 text-amber-400" />
            </div>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100 tracking-tight">
            Welcome to QUINSPEN
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-md mx-auto leading-relaxed">
            A sanctuary where human hearts share raw stories anonymously. To protect the community and maintain a record of your contributions, please create an account or sign in.
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-stone-950 border border-stone-800 mb-6 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold transition-all ${
              mode === "signup"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/15"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Create Account (New User)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold transition-all ${
              mode === "signin"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/15"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In (Existing User)</span>
          </button>
        </div>

        {/* Error / Success feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start space-x-2 text-rose-300 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start space-x-2 text-emerald-300 text-xs animate-fadeIn">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
                className="w-full rounded-xl bg-stone-950 border border-stone-800 pl-10 pr-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Used strictly for authentication and your private record. Never exposed publicly.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full rounded-xl bg-stone-950 border border-stone-800 pl-10 pr-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {/* New User: Anonymous Pen Identity Generator */}
          {mode === "signup" && (
            <div className="pt-2 border-t border-stone-800/80 animate-fadeIn space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-amber-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Your Anonymous Pen Name</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizePenName}
                    className="flex items-center space-x-1 text-[11px] text-stone-400 hover:text-amber-300 transition-colors"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Randomize</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={penName}
                  onChange={(e) => setPenName(e.target.value)}
                  required
                  placeholder="e.g. Midnight Scribe"
                  className="w-full rounded-xl bg-stone-950 border border-amber-500/30 px-4 py-2.5 text-sm font-serif font-bold text-stone-100 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  This pseudonym is the only identity the world will ever see.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1">
                  Anonymous Bio (Optional)
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. A soul sharing fragments between train stops..."
                  className="w-full rounded-xl bg-stone-950 border border-stone-800 px-4 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Privacy Shield Commitment */}
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-start space-x-3 text-xs text-stone-400 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-200">Supabase Connected: </strong>
              All stories, reactions, and 1-on-1 whispers are stored under your anonymous pen identity.
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs tracking-wide uppercase transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Supabase...</span>
              </>
            ) : mode === "signup" ? (
              <>
                <span>Create Account & Enter Sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In to Your Chronicle</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Feature Highlights Footer */}
        <div className="mt-6 pt-5 border-t border-stone-800/60 grid grid-cols-3 gap-2 text-center text-[10px] text-stone-500">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mb-1" />
            <span>Zero Exposure</span>
          </div>
          <div className="flex flex-col items-center">
            <Heart className="w-3.5 h-3.5 text-rose-400 mb-1" />
            <span>Felt Resonances</span>
          </div>
          <div className="flex flex-col items-center">
            <MessageCircle className="w-3.5 h-3.5 text-indigo-400 mb-1" />
            <span>Masked Whispers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
