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
} from "lucide-react";
import { useQuinspen } from "@/context/QuinspenContext";
import { generateRandomPenName } from "@/lib/quinspenData";

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginOrSignup } = useQuinspen();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [penName, setPenName] = useState("Velvet Wanderer");
  const [bio, setBio] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(true);

  React.useEffect(() => {
    const generated = generateRandomPenName();
    setPenName(generated.penName);
  }, []);

  if (!isAuthModalOpen) return null;

  const handleRandomizePenName = () => {
    const generated = generateRandomPenName();
    setPenName(generated.penName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginOrSignup(email, penName, bio);
    setIsAuthModalOpen(false);
  };

  const handleQuickDemoLogin = () => {
    loginOrSignup("demo.scribe@quinspen.internal", "Midnight Scribe", "A quiet observer wandering through untold memories.");
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-100">
                {isSignUpMode ? "Create Anonymous Pen Account" : "Access Your Chronicle"}
              </h3>
              <p className="text-xs text-stone-400">
                Maintain a record of your stories & whispers safely
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Private Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@private.com"
                className="w-full rounded-xl bg-stone-950 border border-stone-800 pl-9 pr-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
                placeholder="••••••••••••"
                required
                className="w-full rounded-xl bg-stone-950 border border-stone-800 pl-9 pr-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Anonymous Pen Name & Mask (for sign up) */}
          {isSignUpMode && (
            <div className="pt-2 border-t border-stone-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-amber-300 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Your Anonymous Pen Name</span>
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
                className="w-full rounded-xl bg-stone-950 border border-amber-500/30 px-3 py-2.5 text-sm text-stone-100 font-medium focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                This is the only identity the world and other storytellers will ever see.
              </p>
            </div>
          )}

          {/* Shield confirmation banner */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-stone-300 leading-relaxed">
              <strong className="text-emerald-300">Absolute Anonymity Pledge: </strong>
              Your account keeps track of your drafts, published stories, bookmarks, and peer whispers, while keeping your real identity disconnected from public view.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs tracking-wide uppercase transition-all shadow-lg shadow-amber-500/20"
          >
            <span>{isSignUpMode ? "Enter the Sanctuary" : "Sign In to Chronicle"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Mode */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
            >
              Or enter as Quick Demo Scribe (Instant Test)
            </button>
          </div>

          {/* Toggle between Sign Up and Sign In */}
          <div className="text-center pt-1 border-t border-stone-800 text-xs text-stone-400">
            {isSignUpMode ? (
              <p>
                Already have a pen identity?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(false)}
                  className="text-amber-400 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Need to create your pen identity?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(true)}
                  className="text-amber-400 hover:underline font-medium"
                >
                  Create account
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
