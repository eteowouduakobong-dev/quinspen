"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import {
  Users,
  UserPlus,
  Mail,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

type Listener = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  createdAt: number;
  lastSignInAt: number | null;
  listenerStatus: "active" | "inactive";
};

type Invitation = {
  id: string;
  emailAddress: string;
  status: string;
  createdAt: number;
  revoked: boolean;
};

export function AdminListenersDashboard() {
  const [listeners, setListeners] = useState<Listener[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [listenerResponse, invitationResponse] = await Promise.all([
        fetch("/api/admin/listeners"),
        fetch("/api/admin/listeners/invitations"),
      ]);

      const listenerData = await listenerResponse.json();
      const invitationData = await invitationResponse.json();

      if (!listenerResponse.ok) {
        throw new Error(listenerData.error || "Could not load listeners.");
      }

      if (!invitationResponse.ok) {
        throw new Error(invitationData.error || "Could not load invitations.");
      }

      setListeners(listenerData.listeners || []);
      setInvitations(invitationData.invitations || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function inviteListener(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/listeners/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invitation could not be sent.");
      }

      setMessage("Listener invitation sent successfully.");
      setEmail("");
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invitation failed."
      );
    } finally {
      setSending(false);
    }
  }

  async function updateListener(listener: Listener) {
    const action =
      listener.listenerStatus === "active" ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this listener?`
    );

    if (!confirmed) return;

    setProcessingId(listener.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/listeners/${listener.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update listener.");
      }

      setMessage(data.message);
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Status update failed."
      );
    } finally {
      setProcessingId("");
    }
  }

  async function revokeInvitation(invitation: Invitation) {
    if (!window.confirm(`Revoke invitation sent to ${invitation.emailAddress}?`)) {
      return;
    }

    setProcessingId(invitation.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/listeners/invitations/${invitation.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not revoke invitation.");
      }

      setMessage("Invitation revoked successfully.");
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invitation revocation failed."
      );
    } finally {
      setProcessingId("");
    }
  }

  const activeCount = listeners.filter(
    (listener) => listener.listenerStatus === "active"
  ).length;

  const inactiveCount = listeners.length - activeCount;

  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === "pending"
  );

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold">
                Administration
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">
              Listener Management
            </h1>
            <p className="text-stone-400 mt-2">
              Manage your QUINSPEN human listener team.
            </p>
          </div>

          <button
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-900 hover:border-amber-500/50 text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Dashboard
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 flex items-center gap-2">
            <XCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Total Listeners"
            value={loading ? "—" : listeners.length}
          />

          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Active Listeners"
            value={loading ? "—" : activeCount}
          />

          <StatCard
            icon={<ShieldOff className="w-5 h-5" />}
            label="Inactive Listeners"
            value={loading ? "—" : inactiveCount}
          />

          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pending Invitations"
            value={loading ? "—" : pendingInvitations.length}
          />

        </div>

        <section className="rounded-2xl border border-stone-800 bg-stone-900/60 p-6 mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Invite a Listener</h2>
              <p className="text-sm text-stone-400">
                Invite someone to join the QUINSPEN listener team.
              </p>
            </div>
          </div>

          <form
            onSubmit={inviteListener}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter listener's email address"
              className="flex-1 rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm outline-none focus:border-amber-500 placeholder:text-stone-600"
            />

            <button
              type="submit"
              disabled={sending}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-6 py-3 text-sm font-bold text-stone-950 transition-colors"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {sending ? "Sending..." : "Send Invitation"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden mb-10">
          <div className="p-6 border-b border-stone-800">
            <h2 className="text-lg font-semibold">Registered Listeners</h2>
            <p className="text-sm text-stone-400 mt-1">
              Manage access to listener responsibilities.
            </p>
          </div>

          {loading ? (
            <LoadingState />
          ) : listeners.length === 0 ? (
            <EmptyState message="No registered listeners found yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-950/60 text-stone-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Listener</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                    <th className="px-6 py-4 font-medium">Last Sign In</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-800">
                  {listeners.map((listener) => (
                    <tr key={listener.id} className="hover:bg-stone-800/30">
                      <td className="px-6 py-4">
                        <p className="font-medium text-stone-200">
                          {[listener.firstName, listener.lastName]
                            .filter(Boolean)
                            .join(" ") || "Unnamed Listener"}
                        </p>
                        <p className="text-xs text-stone-500 mt-1">
                          {listener.emailAddress || "No email"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-stone-400">
                        {formatDate(listener.createdAt)}
                      </td>

                      <td className="px-6 py-4 text-stone-400">
                        {listener.lastSignInAt
                          ? formatDate(listener.lastSignInAt)
                          : "Never"}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={listener.listenerStatus} />
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => void updateListener(listener)}
                          disabled={processingId === listener.id}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                            listener.listenerStatus === "active"
                              ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                              : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {processingId === listener.id
                            ? "Processing..."
                            : listener.listenerStatus === "active"
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden">
          <div className="p-6 border-b border-stone-800">
            <h2 className="text-lg font-semibold">Listener Invitations</h2>
            <p className="text-sm text-stone-400 mt-1">
              Track invitations and revoke pending ones.
            </p>
          </div>

          {loading ? (
            <LoadingState />
          ) : invitations.length === 0 ? (
            <EmptyState message="No listener invitations found." />
          ) : (
            <div className="divide-y divide-stone-800">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-200">
                      {invitation.emailAddress}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      Sent {formatDate(invitation.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs rounded-full px-3 py-1 border border-stone-700 bg-stone-950 text-stone-300 capitalize">
                      {invitation.status}
                    </span>

                    {invitation.status === "pending" && (
                      <button
                        onClick={() => void revokeInvitation(invitation)}
                        disabled={processingId === invitation.id}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 text-center text-xs text-stone-600">
          QUINSPEN Administration · Human Listener Management
        </div>

      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-sm text-stone-400">{label}</p>
      <p className="text-3xl font-bold text-stone-100 mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? "bg-emerald-400" : "bg-rose-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-3 p-10 text-stone-400">
      <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
      Loading...
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-10 text-center text-sm text-stone-500">
      {message}
    </div>
  );
}
