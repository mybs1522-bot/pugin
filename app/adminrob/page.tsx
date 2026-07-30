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
  Video,
  Image as ImageIcon,
  CreditCard,
  Clock,
  KeyRound,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Send,
  CornerDownRight,
} from "lucide-react";

interface UserRecord {
  email: string;
  count: number;
  imageCount: number;
  videoCount: number;
  isPaid?: boolean;
  paymentMode?: string;
  lastModelUsed?: string;
  signedUpAt: string;
  lastLoginAt: string;
  lastActiveAt: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  email: string;
  category?: string;
  status: "open" | "resolved";
  messages?: ChatMessage[];
  unreadAdminCount?: number;
  replyMessage?: string;
  replyAt?: string;
  createdAt: string;
  updatedAt?: string;
  message?: string;
}

interface Stats {
  totalUsers: number;
  totalRenders: number;
  totalImages?: number;
  totalVideos?: number;
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

function StatusBadge({
  isPaid,
  count,
  limit,
}: {
  isPaid?: boolean;
  count: number;
  limit: number;
}) {
  if (isPaid) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
        ✓ Paid Active
      </span>
    );
  }
  if (count >= limit)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
        Exhausted ({count}/{limit})
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
      Trial ({count}/{limit})
    </span>
  );
}

function ModelBadge({ model }: { model?: string }) {
  if (!model) {
    return <span className="text-xs text-zinc-500">—</span>;
  }
  if (model.includes("nano-banana-pro")) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-300">
        🍌 Nano Banana Pro
      </span>
    );
  }
  if (model.includes("nano-banana-2")) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-300">
        ⚡ Nano Banana 2
      </span>
    );
  }
  if (model.includes("instruct-pix2pix")) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-purple-500/20 bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-300">
        🎨 Instruct-Pix2Pix
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
      🤖 {model.split("/").pop()}
    </span>
  );
}

function PaymentModeBadge({
  mode,
  isPaid,
}: {
  mode?: string;
  isPaid?: boolean;
}) {
  if (isPaid) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-indigo-500/20 bg-indigo-500/15 px-2 py-0.5 text-xs font-medium text-indigo-300">
        ⚡ {mode || "Manual Admin"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
      🎁 Free Trial
    </span>
  );
}

function fmt(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
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
            Sign in to manage payments & plugin support
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
        >
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-600 transition outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
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
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "images" | "videos" | "support"
  >("all");

  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

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

      // Fetch support tickets
      const tRes = await fetch("/api/support");
      if (tRes.ok) {
        const tJson = await tRes.json();
        setTickets(tJson.tickets || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    const id = setInterval(fetchData, 10_000);
    return () => clearInterval(id);
  }, [fetchData]);

  async function handleTogglePaid(email: string, currentPaid: boolean) {
    setActionLoading(email);
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, paid: !currentPaid, action: "set_paid" }),
      });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetUsage(email: string) {
    setActionLoading(email);
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "reset" }),
      });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleTicketStatus(
    id: string,
    currentStatus: "open" | "resolved"
  ) {
    const nextStatus = currentStatus === "open" ? "resolved" : "open";
    setActionLoading("ticket_" + id);
    try {
      await fetch("/api/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSendReply(ticketId: string) {
    const text = replyTextMap[ticketId];
    if (!text || !text.trim()) return;
    setActionLoading("reply_" + ticketId);
    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          id: ticketId,
          replyMessage: text.trim(),
          sender: "admin",
        }),
      });
      setReplyingTicketId(null);
      setReplyTextMap((prev) => ({ ...prev, [ticketId]: "" }));
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddPaidEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) return;
    setActionLoading("new");
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          paid: true,
          action: "set_paid",
          mode: "Manual Admin",
        }),
      });
      setNewEmail("");
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/adminrob/auth", { method: "DELETE" });
    window.location.reload();
  }

  const users = data?.users ?? [];
  const limit = data?.stats?.trialLimit ?? 3;

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalImageRenders = users.reduce(
    (acc, u) => acc + (u.imageCount || u.count || 0),
    0
  );
  const totalVideoRenders = users.reduce(
    (acc, u) => acc + (u.videoCount || 0),
    0
  );

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const unreadAdminTotal = tickets.reduce(
    (acc, t) => acc + (t.unreadAdminCount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                Admin Management Studio
              </h1>
              <p className="text-xs text-zinc-400">
                Payment Verification, Active Model Tracking & Real-Time Support
                Chat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void fetchData()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* STAT CARDS */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Signups"
            value={data?.stats?.totalUsers ?? users.length}
            sub="Unique verified PC accounts"
            color="bg-indigo-500/20 text-indigo-400"
          />
          <StatCard
            icon={ImageIcon}
            label="Image Renders"
            value={totalImageRenders}
            sub="Total Flux & Nano images"
            color="bg-purple-500/20 text-purple-400"
          />
          <StatCard
            icon={Video}
            label="Video Walkthroughs"
            value={totalVideoRenders}
            sub="3D Animated camera pans"
            color="bg-blue-500/20 text-blue-400"
          />
          <StatCard
            icon={MessageSquare}
            label="Support Chat Inbox"
            value={
              unreadAdminTotal > 0
                ? `${openTickets} (${unreadAdminTotal} Unread)`
                : openTickets
            }
            sub="Live chat threads from plugin"
            color="bg-amber-500/20 text-amber-400"
          />
        </div>

        {/* DIRECT EMAIL ACTIVATION BAR */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-2 text-base font-semibold text-white">
            ⚡ Direct Email Paid Access Activation
          </h2>
          <p className="mb-4 text-xs text-zinc-400">
            Enter any email address below to grant instant unlimited paid access
            before or after sign-up.
          </p>
          <form onSubmit={handleAddPaidEmail} className="flex max-w-xl gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user.email@example.com"
              required
              className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={actionLoading === "new"}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              <PlusCircle className="h-4 w-4" />
              {actionLoading === "new" ? "Activating…" : "Activate Paid"}
            </button>
          </form>
        </div>

        {/* TABLE FILTER TABS & SEARCH */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 p-1.5">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === "all"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              👥 All Signups ({filtered.length})
            </button>
            <button
              onClick={() => setActiveTab("images")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === "images"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              🖼️ Image Renders
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === "videos"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              🎬 3D Videos
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === "support"
                  ? "bg-amber-600 text-white shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              💬 Support Chat{" "}
              {unreadAdminTotal > 0 && `(🔴 ${unreadAdminTotal} New)`}
            </button>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email address…"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500 sm:w-64"
          />
        </div>

        {/* TAB 1: ALL SIGNUPS OVERVIEW TABLE */}
        {activeTab === "all" && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Users className="h-4 w-4 text-indigo-400" />
                Comprehensive Member Registry & Active Model Tracker
              </h3>
              <span className="text-xs text-zinc-400">
                {filtered.length} registered accounts
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-zinc-900/80 font-semibold tracking-wider text-zinc-400 uppercase">
                  <tr>
                    <th className="px-5 py-3.5">User Email</th>
                    <th className="px-5 py-3.5">Active AI Model</th>
                    <th className="px-5 py-3.5">Payment Status</th>
                    <th className="px-5 py-3.5">Payment Mode</th>
                    <th className="px-5 py-3.5">Images / Videos</th>
                    <th className="px-5 py-3.5">Last Login</th>
                    <th className="px-5 py-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-8 text-center text-zinc-500"
                      >
                        No user signups found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => (
                      <tr key={u.email} className="transition hover:bg-white/5">
                        <td className="px-5 py-4 font-medium text-white">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            {u.email}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <ModelBadge model={u.lastModelUsed} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge
                            isPaid={u.isPaid}
                            count={u.count}
                            limit={limit}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <PaymentModeBadge
                            mode={u.paymentMode}
                            isPaid={u.isPaid}
                          />
                        </td>
                        <td className="px-5 py-4 font-semibold text-purple-300">
                          {u.imageCount || u.count || 0} imgs /{" "}
                          {u.videoCount || 0} vids
                        </td>
                        <td className="px-5 py-4 text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-zinc-500" />
                            {fmt(u.lastLoginAt)}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                handleTogglePaid(u.email, !!u.isPaid)
                              }
                              disabled={actionLoading === u.email}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                u.isPaid
                                  ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                              }`}
                            >
                              {u.isPaid ? "Revoke Paid" : "⚡ Activate Paid"}
                            </button>
                            <button
                              onClick={() => handleResetUsage(u.email)}
                              disabled={actionLoading === u.email}
                              className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
                              title="Reset trial render count to 0"
                            >
                              🔄 Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: IMAGE RENDERS TABLE */}
        {activeTab === "images" && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 bg-purple-950/40 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <ImageIcon className="h-4 w-4 text-purple-400" />
                🖼️ Image Render Usage & Model Breakdown
              </h3>
              <span className="text-xs font-semibold text-purple-300">
                {totalImageRenders} Total Image Renders
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-zinc-900/80 font-semibold tracking-wider text-zinc-400 uppercase">
                  <tr>
                    <th className="px-5 py-3.5">User Email</th>
                    <th className="px-5 py-3.5">Model Used</th>
                    <th className="px-5 py-3.5">Image Renders Used</th>
                    <th className="px-5 py-3.5">Payment Status</th>
                    <th className="px-5 py-3.5">Payment Mode</th>
                    <th className="px-5 py-3.5">Last Login</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {filtered.map((u) => (
                    <tr key={u.email} className="transition hover:bg-white/5">
                      <td className="px-5 py-4 font-medium text-white">
                        {u.email}
                      </td>
                      <td className="px-5 py-4">
                        <ModelBadge model={u.lastModelUsed} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md border border-purple-500/30 bg-purple-500/20 px-2.5 py-1 text-xs font-bold text-purple-300">
                          {u.imageCount || u.count || 0} Images
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          isPaid={u.isPaid}
                          count={u.count}
                          limit={limit}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <PaymentModeBadge
                          mode={u.paymentMode}
                          isPaid={u.isPaid}
                        />
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {fmt(u.lastLoginAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleTogglePaid(u.email, !!u.isPaid)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            u.isPaid
                              ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                              : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          }`}
                        >
                          {u.isPaid ? "Revoke Paid" : "⚡ Activate Paid"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VIDEO WALKTHROUGHS TABLE */}
        {activeTab === "videos" && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 bg-blue-950/40 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Video className="h-4 w-4 text-blue-400" />
                🎬 3D Video Walkthrough Renders Breakdown
              </h3>
              <span className="text-xs font-semibold text-blue-300">
                {totalVideoRenders} Total Video Clips
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-zinc-900/80 font-semibold tracking-wider text-zinc-400 uppercase">
                  <tr>
                    <th className="px-5 py-3.5">User Email</th>
                    <th className="px-5 py-3.5">3D Videos Generated</th>
                    <th className="px-5 py-3.5">Payment Status</th>
                    <th className="px-5 py-3.5">Payment Mode</th>
                    <th className="px-5 py-3.5">Last Login</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {filtered.map((u) => (
                    <tr key={u.email} className="transition hover:bg-white/5">
                      <td className="px-5 py-4 font-medium text-white">
                        {u.email}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md border border-blue-500/30 bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-300">
                          {u.videoCount || 0} Video Clips
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          isPaid={u.isPaid}
                          count={u.count}
                          limit={limit}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <PaymentModeBadge
                          mode={u.paymentMode}
                          isPaid={u.isPaid}
                        />
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {fmt(u.lastLoginAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleTogglePaid(u.email, !!u.isPaid)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            u.isPaid
                              ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                              : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          }`}
                        >
                          {u.isPaid ? "Revoke Paid" : "⚡ Activate Paid"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: REAL-TIME SUPPORT CHAT INBOX TABLE */}
        {activeTab === "support" && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 bg-amber-950/40 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <MessageSquare className="h-4 w-4 text-amber-400" />
                💬 Real-Time Live Support Chat Inbox
              </h3>
              <span className="text-xs font-semibold text-amber-300">
                {tickets.length} total chat threads ({openTickets} open)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-zinc-900/80 font-semibold tracking-wider text-zinc-400 uppercase">
                  <tr>
                    <th className="px-5 py-3.5">User Email</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Live Chat Thread</th>
                    <th className="px-5 py-3.5">Last Activity</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {tickets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-8 text-center text-zinc-500"
                      >
                        No support chat threads active yet.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t) => (
                      <tr key={t.id} className="transition hover:bg-white/5">
                        <td className="px-5 py-4 font-medium text-white">
                          <div className="flex items-center gap-2">
                            {t.unreadAdminCount ? (
                              <span className="animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                                🔴 {t.unreadAdminCount} New
                              </span>
                            ) : null}
                            {t.email}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-md border border-amber-500/20 bg-zinc-800 px-2 py-1 text-xs font-medium text-amber-300">
                            {t.category || "General Inquiry"}
                          </span>
                        </td>
                        <td className="max-w-md px-5 py-4 font-normal break-words text-zinc-200">
                          {/* CHAT THREAD DISPLAY */}
                          <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-2">
                            {(t.messages && t.messages.length > 0
                              ? t.messages
                              : [
                                  {
                                    id: "m0",
                                    sender: "user",
                                    text: t.message || "",
                                    createdAt: t.createdAt,
                                  },
                                ]
                            ).map((m, idx) => (
                              <div
                                key={m.id || idx}
                                className={`flex flex-col ${
                                  m.sender === "admin"
                                    ? "items-end"
                                    : "items-start"
                                }`}
                              >
                                <span className="text-[9px] text-zinc-500">
                                  {m.sender === "admin" ? "✦ Admin" : "👤 User"}{" "}
                                  • {fmt(m.createdAt)}
                                </span>
                                <div
                                  className={`mt-0.5 max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs ${
                                    m.sender === "admin"
                                      ? "border border-indigo-500/40 bg-indigo-600/30 text-indigo-200"
                                      : "border border-white/10 bg-zinc-800 text-zinc-200"
                                  }`}
                                >
                                  {m.text}
                                </div>
                              </div>
                            ))}
                          </div>

                          {replyingTicketId === t.id && (
                            <div className="mt-3 rounded-xl border border-indigo-500/40 bg-zinc-900 p-3">
                              <label className="mb-1 block text-xs font-semibold text-indigo-400">
                                💬 Reply in Chat to {t.email}:
                              </label>
                              <textarea
                                rows={2}
                                value={replyTextMap[t.id] || ""}
                                onChange={(e) =>
                                  setReplyTextMap({
                                    ...replyTextMap,
                                    [t.id]: e.target.value,
                                  })
                                }
                                placeholder="Type your response to user (will instantly appear in their plugin)..."
                                className="w-full rounded-lg border border-white/10 bg-black p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                              />
                              <div className="mt-2 flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setReplyingTicketId(null)}
                                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={actionLoading === "reply_" + t.id}
                                  onClick={() => handleSendReply(t.id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                                >
                                  <Send className="h-3 w-3" />
                                  {actionLoading === "reply_" + t.id
                                    ? "Sending…"
                                    : "Send Chat Reply 💬"}
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-zinc-400">
                          {fmt(t.updatedAt || t.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          {t.status === "open" ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                              ● Active Chat
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                              ✓ Resolved
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setReplyingTicketId(
                                  replyingTicketId === t.id ? null : t.id
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/30"
                            >
                              💬 Reply
                            </button>
                            <button
                              onClick={() =>
                                handleToggleTicketStatus(t.id, t.status)
                              }
                              disabled={actionLoading === "ticket_" + t.id}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                t.status === "open"
                                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                              }`}
                            >
                              {t.status === "open" ? "✓ Resolve" : "Reopen"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      setAuthed(res.ok);
    } catch {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-xs text-zinc-500">Loading admin portal…</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <Dashboard />;
}
