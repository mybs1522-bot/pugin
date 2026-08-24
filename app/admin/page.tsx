"use client";

import { useState, useEffect, useCallback, type ComponentType } from "react";
import {
  Users,
  Activity,
  BarChart3,
  AlertCircle,
  Lock,
  RefreshCw,
  TrendingUp,
  UserCheck,
  FileText,
} from "lucide-react";
import { AdminServiceLeads } from "@/components/admin-service-leads";

interface UserRecord {
  email: string;
  count: number;
  signedUpAt: string;
  lastActiveAt: string;
}

interface Stats {
  totalUsers: number;
  totalRenders: number;
  trialUsers: number;
  exhaustedUsers: number;
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
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
        </div>
        <span className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </span>
      </div>
    </div>
  );
}

function TrialBar({ count, limit }: { count: number; limit: number }) {
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

function statusBadge(count: number, limit: number) {
  if (count >= limit)
    return (
      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
        Exhausted
      </span>
    );
  if (count > 0)
    return (
      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
        Trial active
      </span>
    );
  return (
    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
      New
    </span>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"leads" | "users">("leads");
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(
          (j as { error?: string }).error ?? `HTTP ${res.status}`
        );
      }
      const json = (await res.json()) as AdminData;
      setData(json);
      setSecret(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!secret) return;
    const id = setInterval(() => fetchData(secret), 30_000);
    return () => clearInterval(id);
  }, [secret, fetchData]);

  const filtered =
    data?.users.filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  if (!secret) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="mb-6 flex justify-center">
            <span className="rounded-xl bg-indigo-500/20 p-3">
              <Lock className="h-6 w-6 text-indigo-400" />
            </span>
          </div>
          <h1 className="mb-1 text-center text-xl font-bold text-white">
            Admin Dashboard
          </h1>
          <p className="mb-6 text-center text-sm text-zinc-400">
            Enter your admin secret to continue
          </p>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <input
            type="password"
            placeholder="Admin secret"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && input && fetchData(input)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            disabled={!input || loading}
            onClick={() => fetchData(input)}
            className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking…" : "Unlock"}
          </button>
        </div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading…
      </div>
    );

  const { stats } = data;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              Service leads, status tracker &amp; render usage
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 p-1.5">
              <button
                onClick={() => setActiveTab("leads")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "leads"
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                📋 Service Leads
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "users"
                    ? "bg-white text-black shadow-lg"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                👥 User Signups ({stats.totalUsers})
              </button>
            </div>
            <button
              onClick={() => fetchData(secret)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {activeTab === "leads" && <AdminServiceLeads />}

        {activeTab === "users" && (
          <>
            {/* Stat cards */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                icon={Users}
                label="Total users"
                value={stats.totalUsers}
                color="bg-indigo-500/30"
              />
              <StatCard
                icon={BarChart3}
                label="Total renders"
                value={stats.totalRenders}
                sub={`avg ${stats.totalUsers ? (stats.totalRenders / stats.totalUsers).toFixed(1) : 0} per user`}
                color="bg-violet-500/30"
              />
              <StatCard
                icon={TrendingUp}
                label="Trial active"
                value={stats.trialUsers}
                sub={`of ${stats.trialLimit} free renders`}
                color="bg-amber-500/30"
              />
              <StatCard
                icon={UserCheck}
                label="Trial exhausted"
                value={stats.exhaustedUsers}
                sub="need subscription"
                color="bg-red-500/30"
              />
            </div>

            {/* Trial quota bar */}
            <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-300">
                  Conversion funnel
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    label: "New (0 renders)",
                    count: data.users.filter((u) => u.count === 0).length,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Tried (1–9 renders)",
                    count: data.users.filter(
                      (u) => u.count > 0 && u.count < stats.trialLimit
                    ).length,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Exhausted (≥ 10 renders)",
                    count: stats.exhaustedUsers,
                    color: "bg-red-500",
                  },
                ].map(({ label, count, color }) => {
                  const pct = stats.totalUsers
                    ? (count / stats.totalUsers) * 100
                    : 0;
                  return (
                    <div
                      key={label}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="w-40 shrink-0 text-zinc-400">
                        {label}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-zinc-300">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Search + table */}
            <div className="rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h2 className="font-semibold text-zinc-200">
                  Users ({filtered.length})
                </h2>
                <input
                  type="text"
                  placeholder="Search by email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs tracking-wide text-zinc-500 uppercase">
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Renders</th>
                      <th className="px-5 py-3">Signed up</th>
                      <th className="px-5 py-3">Last active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-8 text-center text-zinc-500"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                    {filtered.map((u) => (
                      <tr key={u.email} className="transition hover:bg-white/5">
                        <td className="px-5 py-3.5 font-mono text-zinc-200">
                          {u.email}
                        </td>
                        <td className="px-5 py-3.5">
                          {statusBadge(u.count, stats.trialLimit)}
                        </td>
                        <td className="px-5 py-3.5">
                          <TrialBar count={u.count} limit={stats.trialLimit} />
                        </td>
                        <td className="px-5 py-3.5 text-zinc-400">
                          {fmt(u.signedUpAt)}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-400">
                          {fmt(u.lastActiveAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
