"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Feather, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

interface LocalAuthFormProps {
  mode: "signin" | "signup";
}

export function LocalAuthForm({ mode }: LocalAuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [penName, setPenName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAuth = async (targetEmail: string, targetPenName?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          email: targetEmail,
          penName: targetPenName,
        }),
      });
      if (!response.ok) {
        const result: unknown = await response.json().catch(() => null);
        const msg =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Could not sign in.";
        throw new Error(msg);
      }
      window.dispatchEvent(new Event("quinspen-auth-changed"));
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    void submitAuth(email.trim(), mode === "signup" ? penName.trim() : undefined);
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900/90 p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-400">
          <Feather className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-stone-100">
          {mode === "signup" ? "Create Your Anonymous Sanctuary" : "Enter the Sanctuary"}
        </h1>
        <p className="mt-1.5 text-xs text-stone-400">
          Your email stays private. Community stories always display your masked pen identity.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-rose-800/60 bg-rose-950/30 p-3 text-xs text-rose-200"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="local-auth-email"
            className="mb-1.5 block text-xs font-semibold text-stone-300"
          >
            Private Email
          </label>
          <input
            id="local-auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="scribe@example.com"
            className="w-full rounded-xl border border-stone-800 bg-stone-950 px-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {mode === "signup" && (
          <div>
            <label
              htmlFor="local-auth-penname"
              className="mb-1.5 block text-xs font-semibold text-stone-300"
            >
              Preferred Pen Name (optional)
            </label>
            <input
              id="local-auth-penname"
              type="text"
              maxLength={80}
              value={penName}
              onChange={(e) => setPenName(e.target.value)}
              placeholder="Leave blank for an evocative random alias"
              className="w-full rounded-xl border border-stone-800 bg-stone-950 px-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:border-amber-500 focus:outline-none"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400 disabled:opacity-50"
        >
          <span>
            {isSubmitting
              ? "Entering Sanctuary..."
              : mode === "signup"
                ? "Create Anonymous Account"
                : "Sign In"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-800" />
        <span className="text-[11px] text-stone-500">or</span>
        <div className="h-px flex-1 bg-stone-800" />
      </div>

      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => void submitAuth("scribe@quinspen.local", "Midnight Scribe")}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-xs font-medium text-stone-200 transition-colors hover:border-amber-500/40 hover:text-amber-200 disabled:opacity-50"
      >
        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        <span>Continue with Demo Scribe Account</span>
      </button>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>Identity shielded · Local session active</span>
      </div>

      <p className="mt-4 text-center text-xs text-stone-400">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-amber-400 hover:underline">
              Sign In
            </Link>
          </>
        ) : (
          <>
            New to Quinspen?{" "}
            <Link href="/sign-up" className="font-semibold text-amber-400 hover:underline">
              Sign Up
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
