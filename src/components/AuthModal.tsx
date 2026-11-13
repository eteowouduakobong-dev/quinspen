"use client";

import React, { useState } from "react";
import {
  Feather,
  ShieldCheck,
  Shuffle,
  Mail,
  Lock,
  X,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  UserCheck,
  LogIn,
} from "lucide-react";
import { useQuinspen } from "@/context/QuinspenContext";
import { generateRandomPenName } from "@/lib/quinspenData";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    signUpWithEmail,
    signInWithEmail,
  } = useQuinspen();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [penName, setPenName] = useState("Velvet Wanderer");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<{
    mode: "signin" | "signup";
    message: string;
  } | null>(null);
  const [successState, setSuccessState] = useState<{
    mode: "signin" | "signup";
    message: string;
  } | null>(null);

  const isSignUp = authModalMode === "signup";
  const errorMessage =
    errorState?.mode === authModalMode ? errorState.message : null;
  const successMessage =
    successState?.mode === authModalMode ? successState.message : null;
  const setErrorMessage = (message: string | null) => {
    setErrorState(message ? { mode: authModalMode, message } : null);
  };
  const setSuccessMessage = (message: string | null) => {
    setSuccessState(message ? { mode: authModalMode, message } : null);
  };

  if (!isAuthModalOpen) return null;

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
      if (isSignUp) {
        const res = await signUpWithEmail(email, password, penName, bio);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to create account.");
        } else if (res.confirmationRequired) {
          setSuccessMessage("Account created. Check your email to confirm it before signing in.");
        } else {
          setSuccessMessage("Account created successfully! Welcome to the sanctuary.");
          setTimeout(() => {
            closeAuthModal();
          }, 1200);
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to sign in. Please verify your credentials.");
        } else {
          setSuccessMessage("Welcome back to your chronicle.");
          setTimeout(() => {
            closeAuthModal();
          }, 1000);
        }
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Ambient atmospheric backdrop glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-100">
                QUINSPEN Sanctuary
              </h3>
              <p className="text-[11px] text-stone-400">
                Connected to Supabase · 100% Identity Shield
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs (Sign Up vs Sign In) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-stone-950 border border-stone-800/80 mt-5 mb-5 text-xs">
          <button
            type="button"
            onClick={() => openAuthModal("signup")}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg font-semibold transition-all ${
              isSignUp
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Sign Up (New)</span>
          </button>
          <button
            type="button"
            onClick={() => openAuthModal("signin")}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg font-semibold transition-all ${
              !isSignUp
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In (Existing)</span>
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 flex items-start space-x-2 text-rose-300 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-start space-x-2 text-emerald-300 text-xs animate-fadeIn">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
                className="w-full rounded-xl bg-stone-950 border border-stone-800 pl-9 pr-3 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              Used strictly for login & records. Never displayed or shared.
            </p>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full rounded-xl bg-stone-950 border border-stone-800 pl-9 pr-3 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Anonymous Pen Name & Mask (for sign up mode) */}
          {isSignUp && (
            <div className="pt-2 border-t border-stone-800/80 animate-fadeIn space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-amber-300 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Choose Anonymous Pen Name</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizePenName}
                    className="flex items-center space-x-1 text-[11px] text-stone-400 hover:text-amber-300 transition-colors"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Randomize</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={penName}
                  onChange={(e) => setPenName(e.target.value)}
                  required
                  placeholder="e.g. Midnight Scribe"
                  className="w-full rounded-xl bg-stone-950 border border-amber-500/30 px-3.5 py-2.5 text-sm text-stone-100 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">
                  Anonymous Bio / Tagline (Optional)
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. A soul sharing fragments between train stops..."
                  className="w-full rounded-xl bg-stone-950 border border-stone-800 px-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Shield confirmation banner */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-stone-300 leading-relaxed">
              <strong className="text-emerald-300">Identity Protection Active: </strong>
              Your account links to your Supabase record so you can maintain stories, drafts, and whispers, while keeping your real identity disconnected from public view.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs tracking-wide uppercase transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Supabase...</span>
              </>
            ) : isSignUp ? (
              <>
                <span>Create Anonymous Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In to Chronicle</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Switcher text */}
          <div className="text-center pt-2 text-xs text-stone-400">
            {isSignUp ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  className="text-amber-400 hover:underline font-bold"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                New to QUINSPEN?{" "}
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="text-amber-400 hover:underline font-bold"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
