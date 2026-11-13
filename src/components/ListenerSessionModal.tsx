"use client";

import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, Phone, Send, ShieldCheck, X } from "lucide-react";

interface ListenerMessage {
  id: string;
  senderRole: "USER" | "STAFF";
  senderName: string;
  content: string;
  createdAt: string;
}

interface ListenerSession {
  id: string;
  topic: string;
  status: "WAITING" | "ACTIVE" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  messages: ListenerMessage[];
}

interface ListenerSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SESSION_STORAGE_KEY = "quinspen_active_listener_session";

const TOPICS = [
  "Just need to vent",
  "Heartache and loss",
  "Anxiety and overwhelm",
  "A heavy secret or guilt",
  "Exhaustion and burnout",
  "Loneliness",
];

async function getApiError(response: Response, fallback: string): Promise<string> {
  const result: unknown = await response.json();
  if (
    result &&
    typeof result === "object" &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    return result.error;
  }
  return fallback;
}

export function ListenerSessionModal({ isOpen, onClose }: ListenerSessionModalProps) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [session, setSession] = useState<ListenerSession | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const sessionId = session?.id;

  useEffect(() => {
    if (!isOpen || sessionId) return;
    const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!savedSessionId) return;

    let active = true;
    void fetch(`/api/listener-sessions/${savedSessionId}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 404) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
          throw new Error(await getApiError(response, "Could not restore this conversation."));
        }
        return (await response.json()) as ListenerSession;
      })
      .then((savedSession) => {
        if (active) setSession(savedSession);
      })
      .catch((restoreError: unknown) => {
        console.error("Could not restore human listener session:", restoreError);
        if (active) {
          setError(
            restoreError instanceof Error
              ? restoreError.message
              : "Could not restore this conversation."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen, sessionId]);

  useEffect(() => {
    if (!isOpen || !sessionId) return;

    let active = true;
    const refreshSession = async () => {
      try {
        const response = await fetch(`/api/listener-sessions/${sessionId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(await getApiError(response, "Could not refresh this conversation."));
        }
        const updatedSession = (await response.json()) as ListenerSession;
        if (active) {
          setSession(updatedSession);
          setError(null);
        }
      } catch (refreshError) {
        console.error("Could not refresh human listener session:", refreshError);
        if (active) {
          setError(
            refreshError instanceof Error
              ? refreshError.message
              : "Could not refresh this conversation."
          );
        }
      }
    };

    void refreshSession();
    const intervalId = window.setInterval(() => void refreshSession(), 4000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  const startSession = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const response = await fetch("/api/listener-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!response.ok) {
        throw new Error(await getApiError(response, "Could not request a human listener."));
      }
      const newSession = (await response.json()) as ListenerSession;
      localStorage.setItem(SESSION_STORAGE_KEY, newSession.id);
      setSession(newSession);
    } catch (startError) {
      console.error("Could not start human listener session:", startError);
      setError(
        startError instanceof Error
          ? startError.message
          : "Could not request a human listener."
      );
    } finally {
      setIsStarting(false);
    }
  };

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !message.trim()) return;

    setIsSending(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/listener-sessions/${session.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: message.trim() }),
        }
      );
      if (!response.ok) {
        throw new Error(await getApiError(response, "Could not send your message."));
      }
      const sentMessage = (await response.json()) as ListenerMessage;
      setSession((current) =>
        current
          ? { ...current, messages: [...current.messages, sentMessage] }
          : current
      );
      setMessage("");
    } catch (sendError) {
      console.error("Could not send human listener message:", sendError);
      setError(
        sendError instanceof Error ? sendError.message : "Could not send your message."
      );
    } finally {
      setIsSending(false);
    }
  };

  const endSession = async () => {
    if (session) {
      try {
        const response = await fetch(`/api/listener-sessions/${session.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CLOSED" }),
        });
        if (!response.ok) {
          throw new Error(await getApiError(response, "Could not close the conversation."));
        }
      } catch (closeError) {
        console.error("Could not close human listener session:", closeError);
        setError(
          closeError instanceof Error
            ? closeError.message
            : "Could not close the conversation."
        );
        return;
      }
    }

    setSession(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setMessage("");
    onClose();
  };

  const statusText =
    session?.status === "ACTIVE"
      ? "A human listener has joined"
      : session?.status === "CLOSED"
        ? "This conversation has ended"
        : "Waiting for a human listener";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="listener-dialog-title"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/15 text-rose-300">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h2 id="listener-dialog-title" className="font-serif text-lg font-bold text-stone-100">
                Talk with a human listener
              </h2>
              <p className="text-xs text-stone-400">A private, one-to-one conversation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close listener conversation"
            className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-rose-800/60 bg-rose-950/30 p-3 text-xs text-rose-200">
            {error}
          </p>
        )}

        {!session ? (
          <div className="space-y-5 overflow-y-auto py-5">
            <div className="flex items-start gap-3 rounded-2xl border border-stone-800 bg-stone-950/70 p-4 text-xs leading-relaxed text-stone-300">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <p>
                Your account email is not shown in the conversation. Only authorized
                Quinspen listener staff can read or respond to these private messages.
                A human response may take time when staff are offline; no automated
                replies are used.
              </p>
            </div>

            <div>
              <label htmlFor="listener-topic" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-300">
                What would you like to talk about?
              </label>
              <select
                id="listener-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="w-full rounded-xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm text-stone-100 focus:border-rose-500 focus:outline-none"
              >
                {TOPICS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 text-xs leading-relaxed text-stone-400">
              <div className="mb-2 flex items-center gap-2 font-semibold text-stone-200">
                <Phone className="h-4 w-4 text-rose-300" />
                Need immediate help?
              </div>
              If you or someone else is in immediate danger, contact your local
              emergency services. Quinspen listener chat is not emergency or clinical
              care.
            </div>

            <button
              type="button"
              onClick={() => void startSession()}
              disabled={isStarting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-3 text-sm font-bold text-stone-950 transition-opacity disabled:opacity-50"
            >
              <MessageCircle className="h-4 w-4" />
              {isStarting ? "Requesting..." : "Request a private conversation"}
            </button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col pt-4">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs">
              <div>
                <p className="font-semibold text-stone-200">{statusText}</p>
                <p className="mt-1 text-stone-500">Topic: {session.topic}</p>
              </div>
              <button
                type="button"
                onClick={() => void endSession()}
                className="text-rose-300 hover:underline"
              >
                End conversation
              </button>
            </div>

            <div className="min-h-36 flex-1 space-y-3 overflow-y-auto rounded-xl bg-stone-950/60 p-3">
              {session.messages.length === 0 && (
                <p className="py-8 text-center text-xs text-stone-500">
                  Your private conversation is ready. Send a message and an authorized
                  human listener will respond when available.
                </p>
              )}
              {session.messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col ${item.senderRole === "USER" ? "items-end" : "items-start"}`}
                >
                  <span className="mb-1 px-1 text-[10px] text-stone-500">
                    {item.senderRole === "USER" ? "You" : item.senderName}
                  </span>
                  <p className={`max-w-md rounded-2xl p-3 text-sm leading-relaxed ${
                    item.senderRole === "USER"
                      ? "rounded-br-none bg-amber-500 text-stone-950"
                      : "rounded-bl-none border border-stone-800 bg-stone-900 text-stone-200"
                  }`}>
                    {item.content}
                  </p>
                  <time className="mt-1 px-1 text-[9px] text-stone-600">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              ))}
            </div>

            {session.status !== "CLOSED" ? (
              <form onSubmit={(event) => void sendMessage(event)} className="mt-3 flex gap-2 border-t border-stone-800 pt-3">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={4000}
                  placeholder="Write your message..."
                  aria-label="Message to listener"
                  className="min-w-0 flex-1 rounded-xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm text-stone-100 placeholder:text-stone-600 focus:border-rose-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isSending}
                  aria-label="Send message"
                  className="flex items-center justify-center rounded-xl bg-rose-500 px-4 text-stone-950 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <p className="pt-4 text-center text-xs text-stone-500">
                This conversation is closed.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
