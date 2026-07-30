"use client";

import { useState, useEffect, useCallback, type ComponentType } from "react";
import {
  Users,
  Activity,
  BarChart3,
  Lock,
  RefreshCw,
  TrendingUp,
  UserCheck,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle,
  PlusCircle,
  RotateCcw,
} from "lucide-react";

interface UserRecord {
  email: string;
  count: number;
  isPaid?: boolean;
  signedUpAt: string;
  lastActiveAt: string;
}

interface Stats {
  totalUsers: number;
  totalRenders: number;
  trialUsers: number;
  exhaustedUsers: number;
  paidUsers?: number;
  trialLimit: number;
}

interface AdminData {
  stats: Stats;
  users: UserRecord[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
        </div>
        <span className={`rounded-xl p-2.5 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </span>
      </div>
    </div>
  );
}

function TrialBar({
  count,
  limit,
  isPaid,
}: {
  count: number;
  limit: number;
  isPaid?: boolean;
}) {
  if (isPaid) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
          Unlimited ({count} renders)
        </span>
      </div>
    );
  }
  const pct = Math.min((count / limit) * 100, 100);
  const color =
    count >= limit
      ? "bg-red-500"
      : count >= limit - 1
        ? "bg-amber-500"
        : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400">
        {count}/{limit}
      </span>
    </div>
  );
}

function StatusBadge({
  count,
  limit,
  isPaid,
}: {
  count: number;
  limit: number;
  isPaid?: boolean;
}) {
  if (isPaid) {
    return (
      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
        ✓ Paid Active
      </span>
    );
  }
  if (count >= limit)
    return (
      <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
        Exhausted
      </span>
    );
  if (count > 0)
    return (
      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
        Trial active
      </span>
    );
  return (
    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
      New
    </span>
  );
}

function fmt(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/adminrob/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const text = await res.text();
      let j: { error?: string } = {};
      try {
        if (text && text.trim()) j = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        throw new Error(
          j.error ?? `Invalid username or password (HTTP ${res.status})`
        );
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex rounded-2xl bg-indigo-500/20 p-4">
            <Lock className="h-7 w-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Sign in to manage plugin payments
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
        >
          {error && (
            <div className="mb-5 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-600 transition outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-600 transition outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const text = await res.text();
      if (res.ok && text && text.trim()) {
        try {
          const json = JSON.parse(text) as AdminData;
          setData(json);
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    const id = setInterval(fetchData, 20_000);
    return () => clearInterval(id);
  }, [fetchData]);

  async function togglePaid(email: string, currentPaid: boolean) {
    setActionLoading(email);
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          action: "toggle_paid",
          paid: !currentPaid,
        }),
      });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  }

  async function resetCount(email: string) {
    setActionLoading(email + "_reset");
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "reset_count" }),
      });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) return;
    setActionLoading("add");
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          action: "toggle_paid",
          paid: true,
        }),
      });
      setNewEmail("");
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  }

  async function logout() {
    await fetch("/api/adminrob/auth", { method: "DELETE" });
    window.location.reload();
  }

  const filtered =
    data?.users.filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Admin Payment Portal
            </h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              Manage plugin user emails, grant paid access &amp; view render
              counts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Add/Activate Email Box */}
        <form
          onSubmit={handleAddUser}
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <h3 className="font-semibold text-emerald-300">
              ⚡ Direct Activate Paid Access
            </h3>
            <p className="text-xs text-zinc-400">
              Enter any user email to immediately grant full paid rendering
              &amp; video walkthrough access in SketchUp:
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="user@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="rounded-xl border border-white/15 bg-zinc-900 px-4 py-2 text-sm text-white outline-none focus:border-emerald-500"
              required
            />
            <button
              type="submit"
              disabled={actionLoading === "add"}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              <PlusCircle className="h-4 w-4" />
              Activate Paid
            </button>
          </div>
        </form>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total users"
            value={stats?.totalUsers ?? "—"}
            color="bg-indigo-500/30"
          />
          <StatCard
            icon={CheckCircle}
            label="Paid active"
            value={stats?.paidUsers ?? 0}
            sub="Unlimited access"
            color="bg-emerald-500/30"
          />
          <StatCard
            icon={BarChart3}
            label="Total renders"
            value={stats?.totalRenders ?? "—"}
            color="bg-violet-500/30"
          />
          <StatCard
            icon={UserCheck}
            label="Trial exhausted"
            value={stats?.exhaustedUsers ?? "—"}
            sub="need subscription"
            color="bg-red-500/30"
          />
        </div>

        {/* User table */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold text-zinc-200">
              Users &amp; Payment Status ({filtered.length})
            </h2>
            <input
              type="text"
              placeholder="Search by email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs tracking-wider text-zinc-500 uppercase">
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Usage</th>
                  <th className="px-5 py-3">Signed up</th>
                  <th className="px-5 py-3 text-right">Payment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!data && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-zinc-500"
                    >
                      Loading…
                    </td>
                  </tr>
                )}
                {data && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-zinc-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
                {filtered.map((u) => (
                  <tr key={u.email} className="transition hover:bg-white/5">
                    <td className="px-5 py-3.5 font-mono text-sm text-zinc-200">
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        count={u.count}
                        limit={stats?.trialLimit ?? 3}
                        isPaid={u.isPaid}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <TrialBar
                        count={u.count}
                        limit={stats?.trialLimit ?? 3}
                        isPaid={u.isPaid}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400">
                      {fmt(u.signedUpAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => togglePaid(u.email, !!u.isPaid)}
                          disabled={actionLoading === u.email}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            u.isPaid
                              ? "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                              : "bg-emerald-600 text-white hover:bg-emerald-500"
                          }`}
                        >
                          {actionLoading === u.email
                            ? "Updating…"
                            : u.isPaid
                              ? "Revoke Paid"
                              : "⚡ Grant Paid Access"}
                        </button>
                        <button
                          onClick={() => resetCount(u.email)}
                          disabled={actionLoading === u.email + "_reset"}
                          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10"
                          title="Reset render count to 0"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminRobPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/adminrob/check")
      .then((r) => r.json())
      .then((d) => setAuthed((d as { valid: boolean }).valid))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null)
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-500">
        Checking session…
      </div>
    );

  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />;

  return <Dashboard />;
}
