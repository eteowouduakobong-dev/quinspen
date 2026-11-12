"use client";

import React, { useState } from "react";
import { MessageCircle, ShieldCheck, Send, X, Feather } from "lucide-react";
import { StoryItem } from "@/types/quinspen";
import { useQuinspen } from "@/context/QuinspenContext";

interface WhisperModalProps {
  story: StoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WhisperModal({ story, isOpen, onClose }: WhisperModalProps) {
  const { currentUser, sendWhisperRequest } = useQuinspen();
  const [note, setNote] = useState("");
  const [isSent, setIsSent] = useState(false);

  if (!isOpen || !story) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    sendWhisperRequest(story.id, story.title, story.authorId, note.trim());
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setNote("");
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl p-6 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-100">
                Send an Anonymous Whisper
              </h3>
              <p className="text-xs text-stone-400">
                Direct resonance to <span className="text-amber-400 font-medium">{story.authorPenName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-xl font-bold text-stone-100">
              Whisper Delivered Anonymously
            </h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Your message was delivered safely to {story.authorPenName}. If they choose to respond, your conversation will appear in your Whispers inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="mt-4 space-y-4">
            {/* Story context */}
            <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                Story Anchor
              </p>
              <p className="text-xs font-serif font-medium text-stone-200 line-clamp-1">
                "{story.title}"
              </p>
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Your Opening Resonance Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                required
                placeholder="Share how this story resonated with you, an unspoken experience of your own, or a gentle word of comfort..."
                className="w-full rounded-xl bg-stone-950 border border-stone-800 p-3 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Privacy Shield Notice */}
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-stone-300 leading-relaxed">
                <span className="font-semibold text-indigo-300">Identity Protection Active: </span>
                You are connecting as{" "}
                <span className="font-bold text-amber-300">
                  {currentUser?.penName || "Anonymous Scribe"}
                </span>
                . Your real email, name, and identity are 100% hidden and unreachable.
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!note.trim()}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Whisper</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
