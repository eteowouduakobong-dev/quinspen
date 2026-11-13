"use client";

import React, { useState } from "react";
import {
  Heart,
  ShieldCheck,
  Send,
  X,
  Phone,
  Sparkles,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Feather,
} from "lucide-react";
import { AVAILABLE_LISTENERS } from "@/lib/quinspenData";
import { AvailableListener, ListenerChatMessage } from "@/types/quinspen";
import { useQuinspen } from "@/context/QuinspenContext";

interface ListenerSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOPIC_PRESETS = [
  { id: "vent", label: "Just Need to Vent", emoji: "💭" },
  { id: "heartache", label: "Heartache & Loss", emoji: "💔" },
  { id: "anxiety", label: "Anxiety & Overwhelm", emoji: "🌪️" },
  { id: "secret", label: "A Heavy Secret / Guilt", emoji: "🗝️" },
  { id: "burnout", label: "Exhaustion & Burnout", emoji: "🕯️" },
  { id: "lonely", label: "Late-Night Loneliness", emoji: "🌙" },
];

export function ListenerSessionModal({ isOpen, onClose }: ListenerSessionModalProps) {
  const { currentUser } = useQuinspen();

  const [selectedTopic, setSelectedTopic] = useState(TOPIC_PRESETS[0].label);
  const [activeListener, setActiveListener] = useState<AvailableListener>(AVAILABLE_LISTENERS[0]);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<ListenerChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleStartSession = (listener: AvailableListener) => {
    setActiveListener(listener);
    setSessionActive(true);

    const initialGreeting: ListenerChatMessage = {
      id: "msg-init-1",
      sender: "listener",
      content: `Hello ${
        currentUser?.penName || "traveler"
      }. I am here with you in this sanctuary. Whatever you are feeling around "${selectedTopic}" is completely valid. You will not be judged or condemned here. Take your time, breathe gently, and tell me what is on your mind.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([initialGreeting]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ListenerChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const sentText = inputMessage.trim();
    setInputMessage("");
    setIsTyping(true);

    // Compassionate listener simulated guidance
    setTimeout(() => {
      let reply = "I hear you, and I appreciate the courage it took to share that. You don't have to carry this completely alone.";

      const lower = sentText.toLowerCase();
      if (lower.includes("sad") || lower.includes("cry") || lower.includes("hurt") || lower.includes("pain")) {
        reply = "Thank you for letting that pain be witnessed here without a mask. It is completely natural to hurt when something meant so much to you. Be soft with yourself right now.";
      } else if (lower.includes("guilt") || lower.includes("mistake") || lower.includes("regret") || lower.includes("fault")) {
        reply = "We are human beings living in an imperfect world, and making mistakes is often how we learn how deeply we care. You are not condemned here. You deserve forgiveness and room to heal.";
      } else if (lower.includes("tired") || lower.includes("burnout") || lower.includes("exhausted") || lower.includes("can't do")) {
        reply = "It sounds like you have been holding everything together for far too long. Give yourself permission to pause. Right in this moment, you don't have to fix anything.";
      } else if (lower.includes("alone") || lower.includes("lonely") || lower.includes("nobody")) {
        reply = "Feeling isolated in a crowded world is one of the heaviest quiet aches. But right now, across this screen, you are heard and you are valued.";
      }

      const listenerReply: ListenerChatMessage = {
        id: `listener-${Date.now()}`,
        sender: "listener",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, listenerReply]);
      setIsTyping(false);
    }, 1200);
  };

  const handleEndSession = () => {
    setSessionActive(false);
    setMessages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-100 flex items-center space-x-2">
                <span>The Safe Haven</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 font-sans">
                  Confidential Listener
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                1-on-1 private talk with an empathetic listener. No judgment, no condemnation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Body */}
        {!sessionActive ? (
          <div className="py-4 space-y-6 overflow-y-auto pr-1">
            {/* Sanctuary Assurance Card */}
            <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-300 leading-relaxed">
                <strong className="text-stone-100">Judgment-Free Guarantee: </strong>
                QUINSPEN is committed to complete anonymity. Your real name and identity are never revealed. Whatever you share remains sacred and confidential.
              </div>
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2.5">
                What is weighing on your heart today?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TOPIC_PRESETS.map((t) => {
                  const isSelected = selectedTopic === t.label;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTopic(t.label)}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-sm"
                          : "bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <span className="text-base">{t.emoji}</span>
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available Listeners Grid */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Select an Available Listener
                </label>
                <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Available Now</span>
                </span>
              </div>

              <div className="space-y-3">
                {AVAILABLE_LISTENERS.map((listener) => (
                  <div
                    key={listener.id}
                    className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-stone-100">
                          {listener.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                          {listener.badge}
                        </span>
                      </div>
                      <p className="text-xs text-amber-400/90 font-medium">
                        {listener.role}
                      </p>
                      <p className="text-xs text-stone-400 italic leading-relaxed pt-1">
                        "{listener.intro}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartSession(listener)}
                      className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-rose-500/15 whitespace-nowrap transition-all self-start sm:self-center"
                    >
                      <span>Start Private Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Crisis Support Notice */}
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Immediate Crisis Lifeline: Call or text <strong>988</strong> (Free, 24/7)</span>
              </div>
              <span className="text-[11px] text-stone-500 hidden sm:inline">Always confidential</span>
            </div>
          </div>
        ) : (
          /* Active Live 1-on-1 Sanctuary Chat */
          <div className="flex-1 flex flex-col pt-3 overflow-hidden">
            {/* Session Status Banner */}
            <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-stone-950 border border-stone-800 mb-3 text-xs shrink-0">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-stone-200">{activeListener.name}</span>
                <span className="text-stone-500">•</span>
                <span className="text-stone-400 italic">Topic: {selectedTopic}</span>
              </div>

              <button
                type="button"
                onClick={handleEndSession}
                className="text-[11px] text-rose-400 hover:underline font-semibold"
              >
                End Session
              </button>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2 pr-1">
              {messages.map((m) => {
                const isUser = m.sender === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] text-stone-500 mb-1 px-1">
                      {isUser ? currentUser?.penName || "You" : activeListener.name}
                    </span>
                    <div
                      className={`max-w-md rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? "bg-amber-500 text-stone-950 font-medium rounded-br-none shadow-md"
                          : "bg-stone-950 border border-stone-800 text-stone-200 rounded-bl-none"
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[9px] text-stone-600 mt-1 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center space-x-2 text-xs text-stone-500 italic px-2">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>{activeListener.name} is listening and writing...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-2 text-[11px] text-stone-400 scrollbar-none shrink-0">
              <span className="text-stone-600 shrink-0">Prompts:</span>
              <button
                type="button"
                onClick={() => setInputMessage("I'm feeling like I carry too much alone.")}
                className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 hover:text-white whitespace-nowrap"
              >
                "I carry too much alone"
              </button>
              <button
                type="button"
                onClick={() => setInputMessage("I made a mistake that I can't stop replaying.")}
                className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 hover:text-white whitespace-nowrap"
              >
                "I can't stop replaying my mistake"
              </button>
              <button
                type="button"
                onClick={() => setInputMessage("I just needed someone to listen without judging me.")}
                className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 hover:text-white whitespace-nowrap"
              >
                "Just needed someone to listen"
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-stone-800 shrink-0">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pour your heart out freely... no judgment here."
                className="flex-1 rounded-xl bg-stone-950 border border-stone-800 px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-stone-950 font-bold text-xs disabled:opacity-40 flex items-center justify-center transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
