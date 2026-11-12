"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  ShieldCheck,
  Feather,
  Send,
  Check,
  X,
  Compass,
  Sparkles,
  Lock,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useQuinspen } from "@/context/QuinspenContext";
import { WhisperConnectionItem } from "@/types/quinspen";

export default function WhispersPage() {
  const {
    whispers,
    currentUser,
    respondToWhisper,
    sendWhisperMessage,
    markWhisperAsRead,
  } = useQuinspen();

  const [activeConnectionId, setActiveConnectionId] = useState<string>(
    whispers[0]?.id || ""
  );
  const [replyText, setReplyText] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "active">("all");

  const currentUserId = currentUser?.id || "user-quinspen-demo";

  // Filter connections
  const filteredConnections = whispers.filter((w) => {
    if (filterTab === "pending") return w.status === "PENDING";
    if (filterTab === "active") return w.status === "ACCEPTED";
    return true;
  });

  const activeConnection = whispers.find((w) => w.id === activeConnectionId);

  // Mark active connection as read
  const handleSelectConnection = (conn: WhisperConnectionItem) => {
    setActiveConnectionId(conn.id);
    markWhisperAsRead(conn.id);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConnection) return;
    sendWhisperMessage(activeConnection.id, replyText.trim());
    setReplyText("");
  };

  const handleInsertPrompt = (prompt: string) => {
    setReplyText(prompt);
  };

  const getOtherParticipant = (conn: WhisperConnectionItem) => {
    if (conn.initiatorId === currentUserId) {
      return {
        penName: conn.recipientPenName,
        icon: conn.recipientAvatarIcon,
        color: conn.recipientAvatarColor,
        isInitiator: false,
      };
    }
    return {
      penName: conn.initiatorPenName,
      icon: conn.initiatorAvatarIcon,
      color: conn.initiatorAvatarColor,
      isInitiator: true,
    };
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-stone-800 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Masked Peer Story Connection</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-stone-100">
              Whispers & Anonymous Dialogues
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Private 1-on-1 reflections sparked by shared stories. Real identities remain 100% masked.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs font-medium text-stone-300 hover:text-white hover:border-amber-500/40 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Find Stories to Whisper</span>
            </Link>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Left Column: Whispers List */}
          <div className="lg:col-span-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col overflow-hidden">
            {/* Filter Tabs */}
            <div className="flex items-center p-2 border-b border-stone-800 bg-stone-950/40 text-xs gap-1">
              <button
                onClick={() => setFilterTab("all")}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                  filterTab === "all"
                    ? "bg-stone-800 text-amber-300 font-bold"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                All ({whispers.length})
              </button>
              <button
                onClick={() => setFilterTab("pending")}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                  filterTab === "pending"
                    ? "bg-stone-800 text-amber-300 font-bold"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Pending (
                {whispers.filter((w) => w.status === "PENDING").length}
                )
              </button>
              <button
                onClick={() => setFilterTab("active")}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                  filterTab === "active"
                    ? "bg-stone-800 text-amber-300 font-bold"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Active (
                {whispers.filter((w) => w.status === "ACCEPTED").length}
                )
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-800/60 p-2 space-y-1">
              {filteredConnections.length > 0 ? (
                filteredConnections.map((conn) => {
                  const other = getOtherParticipant(conn);
                  const isSelected = conn.id === activeConnectionId;
                  const isPending = conn.status === "PENDING";
                  const isRecipient = conn.recipientId === currentUserId;

                  return (
                    <div
                      key={conn.id}
                      onClick={() => handleSelectConnection(conn)}
                      className={`cursor-pointer p-3 rounded-xl transition-all ${
                        isSelected
                          ? "bg-indigo-950/40 border border-indigo-800/60"
                          : "hover:bg-stone-800/50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
                            <Feather className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-stone-200">
                              {other.penName}
                            </span>
                            {conn.unreadCount && conn.unreadCount > 0 ? (
                              <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            ) : null}
                          </div>
                        </div>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            conn.status === "ACCEPTED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : conn.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              : "bg-stone-800 text-stone-500"
                          }`}
                        >
                          {conn.status}
                        </span>
                      </div>

                      {/* Story anchor title */}
                      {conn.storyTitle && (
                        <p className="text-[11px] text-stone-400 font-serif italic line-clamp-1 mb-1">
                          Re: "{conn.storyTitle}"
                        </p>
                      )}

                      <p className="text-xs text-stone-400 line-clamp-2">
                        {conn.lastMessage || conn.initialNote}
                      </p>

                      {/* Pending Action Buttons (if user received request) */}
                      {isPending && isRecipient && (
                        <div className="flex items-center space-x-2 mt-2.5 pt-2 border-t border-stone-800/80">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              respondToWhisper(conn.id, "ACCEPTED");
                            }}
                            className="flex-1 flex items-center justify-center space-x-1 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
                          >
                            <Check className="w-3 h-3" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              respondToWhisper(conn.id, "DECLINED");
                            }}
                            className="flex-1 flex items-center justify-center space-x-1 py-1 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 text-xs font-semibold"
                          >
                            <X className="w-3 h-3" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-stone-500 text-xs">
                  No whispers in this category yet.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Dialogue Chamber */}
          <div className="lg:col-span-8 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col overflow-hidden">
            {activeConnection ? (
              <>
                {/* Dialogue Top Bar */}
                <div className="p-4 border-b border-stone-800 bg-stone-950/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Feather className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-stone-100">
                          {getOtherParticipant(activeConnection).penName}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>End-to-End Anonymous</span>
                        </span>
                      </div>
                      {activeConnection.storyTitle && (
                        <p className="text-[11px] text-stone-400 flex items-center space-x-1">
                          <BookOpen className="w-3 h-3 text-amber-400 inline" />
                          <span>Connected through: </span>
                          <span className="font-serif italic text-stone-300">
                            "{activeConnection.storyTitle}"
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-stone-500">
                      Started:{" "}
                      {new Date(activeConnection.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                  {/* Security Notice Pill */}
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 text-center max-w-md mx-auto">
                    <p className="text-[11px] text-stone-400">
                      🔒 You are conversing under your anonymous pen identity. Neither party can discover emails, names, or locations.
                    </p>
                  </div>

                  {activeConnection.messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[10px] text-stone-500 mb-1 px-1">
                          {msg.senderPenName}
                        </span>
                        <div
                          className={`max-w-md rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? "bg-amber-500 text-stone-950 font-medium rounded-br-none shadow-md shadow-amber-500/10"
                              : "bg-stone-800 text-stone-100 rounded-bl-none border border-stone-700/60"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-stone-600 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Dialogue Composer */}
                <div className="p-4 border-t border-stone-800 bg-stone-950/70">
                  {/* Quick Resonance Prompts */}
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2.5 mb-2 scrollbar-none text-[11px]">
                    <span className="text-stone-500 shrink-0">Prompts:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertPrompt(
                          "Thank you for your vulnerability. Your words resonated with my own path."
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-300 hover:border-amber-500/30 whitespace-nowrap transition-colors"
                    >
                      "Thank you for your vulnerability..."
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertPrompt(
                          "What gave you the strength to navigate that season?"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-300 hover:border-amber-500/30 whitespace-nowrap transition-colors"
                    >
                      "What gave you the strength?"
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertPrompt(
                          "I experienced something very similar and never dared tell anyone."
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-300 hover:border-amber-500/30 whitespace-nowrap transition-colors"
                    >
                      "I experienced something similar..."
                    </button>
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                      placeholder={`Send an anonymous reply as ${
                        currentUser?.penName || "Midnight Scribe"
                      }...`}
                      className="flex-1 rounded-xl bg-stone-900 border border-stone-800 p-3 text-xs sm:text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center self-end py-3"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-500">
                <MessageCircle className="w-12 h-12 text-stone-700 mb-3" />
                <h3 className="font-serif text-lg font-bold text-stone-300 mb-1">
                  Select a Whisper Dialogue
                </h3>
                <p className="text-xs text-stone-400 max-w-sm">
                  Choose a conversation from the left to read and send anonymous reflections, or browse stories to whisper to a new author.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
