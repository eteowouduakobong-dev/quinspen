"use client";

import React, { useEffect, useState } from "react";
import { Check, MessageCircle, RefreshCw, Send, ShieldCheck, X } from "lucide-react";

interface ListenerMessage {
  id: string;
  senderRole: "USER" | "STAFF";
  senderName: string;
  content: string;
  createdAt: string;
}

interface ListenerSession {
  id: string;
  penName: string;
  topic: string;
  status: "WAITING" | "ACTIVE" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  messages: ListenerMessage[];
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
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

export function ListenerInbox() {
  const [sessions, setSessions] = useState<ListenerSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refresh = async () => {
    const response = await fetch("/api/listener-sessions?view=staff", {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(await errorMessage(response, "Could not load listener requests."));
    }
    const result = (await response.json()) as ListenerSession[];
    setSessions(result);
    setSelectedId((current) =>
      current && result.some((session) => session.id === current) ? current : null
    );
    setError(null);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        await refresh();
      } catch (loadError) {
        console.error("Could not load human listener inbox:", loadError);
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load listener requests."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    const intervalId = window.setInterval(() => {
      void load();
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const selectedSession = sessions.find((session) => session.id === selectedId) || null;

  const updateSession = async (status: "ACTIVE" | "CLOSED") => {
    if (!selectedSession) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/listener-sessions/${selectedSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error(await errorMessage(response, "Could not update this conversation."));
      }
      if (status === "CLOSED") setSelectedId(null);
      await refresh();
    } catch (updateError) {
      console.error("Could not update human listener session:", updateError);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update this conversation."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSession || !reply.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/listener-sessions/${selectedSession.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: reply.trim() }),
        }
      );
      if (!response.ok) {
        throw new Error(await errorMessage(response, "Could not send your reply."));
      }
      setReply("");
      await refresh();
    } catch (sendError) {
      console.error("Could not send human listener reply:", sendError);
      setError(
        sendError instanceof Error ? sendError.message : "Could not send your reply."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-950 px-4 py-10 text-stone-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Authorized listener staff only
            </div>
            <h1 className="font-serif text-3xl font-bold">Human Listener Inbox</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-400">
              Respond with care under the shared name “Quinspen Human Listener.”
              Never ask for a user’s real-world identity or share their messages outside
              the authorized support team.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh().catch((refreshError: unknown) => {
              console.error("Could not refresh listener inbox:", refreshError);
              setError(
                refreshError instanceof Error
                  ? refreshError.message
                  : "Could not refresh listener requests."
              );
            })}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-700 px-4 py-2 text-xs text-stone-300 hover:bg-stone-900"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </header>

        {error && (
          <p role="alert" className="mb-5 rounded-xl border border-rose-800/60 bg-rose-950/30 p-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        <div className="grid min-h-[65vh] gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/70">
            <div className="border-b border-stone-800 p-4">
              <h2 className="font-semibold">Open requests</h2>
              <p className="mt-1 text-xs text-stone-500">Waiting and assigned conversations</p>
            </div>
            <div className="max-h-[65vh] overflow-y-auto">
              {isLoading ? (
                <p className="p-4 text-sm text-stone-500">Loading requests…</p>
              ) : sessions.length === 0 ? (
                <p className="p-4 text-sm text-stone-500">No open listener requests.</p>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedId(session.id)}
                    className={`block w-full border-b border-stone-800/80 p-4 text-left transition-colors ${
                      selectedId === session.id
                        ? "bg-rose-500/10"
                        : "hover:bg-stone-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-stone-100">
                        {session.penName}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                        session.status === "WAITING"
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-emerald-500/15 text-emerald-300"
                      }`}>
                        {session.status === "WAITING" ? "Waiting" : "Active"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-stone-400">{session.topic}</p>
                    <p className="mt-2 line-clamp-2 text-xs text-stone-500">
                      {session.messages[session.messages.length - 1]?.content || "No message sent yet"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="flex min-h-[65vh] flex-col overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/70">
            {!selectedSession ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-stone-500">
                <MessageCircle className="mb-3 h-8 w-8 text-stone-600" />
                <p className="text-sm">Select a request to read and respond.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 p-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold">{selectedSession.penName}</h2>
                    <p className="mt-1 text-xs text-stone-400">Topic: {selectedSession.topic}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedSession.status === "WAITING" ? (
                      <button
                        type="button"
                        onClick={() => void updateSession("ACTIVE")}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-stone-950 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void updateSession("CLOSED")}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg border border-stone-700 px-3 py-2 text-xs text-stone-300 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Close
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {selectedSession.messages.length === 0 && (
                    <p className="py-8 text-center text-sm text-stone-500">
                      The user has opened a session but has not sent a message yet.
                    </p>
                  )}
                  {selectedSession.messages.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-col ${item.senderRole === "STAFF" ? "items-end" : "items-start"}`}
                    >
                      <span className="mb-1 px-1 text-[10px] text-stone-500">
                        {item.senderRole === "STAFF" ? "You · Human Listener" : item.senderName}
                      </span>
                      <p className={`max-w-xl rounded-2xl p-3 text-sm leading-relaxed ${
                        item.senderRole === "STAFF"
                          ? "rounded-br-none bg-rose-500 text-stone-950"
                          : "rounded-bl-none border border-stone-800 bg-stone-950 text-stone-200"
                      }`}>
                        {item.content}
                      </p>
                      <time className="mt-1 px-1 text-[9px] text-stone-600">
                        {new Date(item.createdAt).toLocaleString()}
                      </time>
                    </div>
                  ))}
                </div>

                {selectedSession.status === "ACTIVE" ? (
                  <form onSubmit={(event) => void sendReply(event)} className="flex gap-2 border-t border-stone-800 p-4">
                    <input
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      maxLength={4000}
                      aria-label="Reply to user"
                      placeholder="Write a compassionate reply..."
                      className="min-w-0 flex-1 rounded-xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm text-stone-100 placeholder:text-stone-600 focus:border-rose-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!reply.trim() || isSubmitting}
                      aria-label="Send reply"
                      className="rounded-xl bg-rose-500 px-4 text-stone-950 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <p className="border-t border-stone-800 p-4 text-center text-xs text-stone-500">
                    Accept this request before replying.
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
