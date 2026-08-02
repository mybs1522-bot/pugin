"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Clock,
  Phone,
  Mail,
  User,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Layers,
  Sparkles,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  ServiceLead,
  LeadStatus,
  LEAD_STATUS_OPTIONS,
  LeadNote,
} from "@/lib/leads";

export function AdminServiceLeads() {
  const [leads, setLeads] = useState<ServiceLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Note expansion state: leadId -> boolean
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(
    {}
  );
  // Note text input state: leadId -> string
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  // Action loading state: string | null
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New Lead Modal state
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    serviceName: "3D Design for Interiors & Exteriors",
    amount: "999",
    status: "Advance Payment" as LeadStatus,
    noteText: "",
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  // Filter leads based on search query and status filter
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.toLowerCase().includes(search.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase())) ||
      lead.serviceName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === "all" || lead.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalLeads = filteredLeads.length;
  const totalPages = Math.ceil(totalLeads / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalLeads);
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatusFilter]);

  // Handle status update
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setActionLoading(`status_${leadId}`);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          leadId,
          status: newStatus,
        }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err) {
      console.error("Failed to update lead status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle adding a note
  const handleAddNote = async (leadId: string) => {
    const text = (noteInputs[leadId] || "").trim();
    if (!text) return;

    setActionLoading(`note_${leadId}`);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_note",
          leadId,
          noteText: text,
          author: "Admin",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lead) {
          setLeads((prev) =>
            prev.map((l) => (l.id === leadId ? data.lead : l))
          );
        }
        setNoteInputs((prev) => ({ ...prev, [leadId]: "" }));
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle creating a new lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    setActionLoading("create_lead");
    try {
      const notes: LeadNote[] = [];
      if (newLeadForm.noteText.trim()) {
        const nowStr = new Date().toISOString();
        notes.push({
          id: "note_" + Date.now(),
          text: newLeadForm.noteText.trim(),
          createdAt: nowStr,
          formattedTime:
            new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            }) +
            " at " +
            new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          author: "Admin",
        });
      }

      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_lead",
          leadData: {
            name: newLeadForm.name,
            phone: newLeadForm.phone,
            email: newLeadForm.email,
            serviceName: newLeadForm.serviceName,
            amount: parseFloat(newLeadForm.amount) || 0,
            paymentStatus: "completed",
            status: newLeadForm.status,
            notes,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.lead) {
          setLeads((prev) => [data.lead, ...prev]);
        }
        setShowAddLeadModal(false);
        setNewLeadForm({
          name: "",
          phone: "",
          email: "",
          serviceName: "3D Design for Interiors & Exteriors",
          amount: "999",
          status: "Advance Payment",
          noteText: "",
        });
      }
    } catch (err) {
      console.error("Failed to create lead:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Counts for status cards
  const statusCounts = {
    advance: leads.filter((l) => l.status === "Advance Payment").length,
    floorPlan: leads.filter((l) => l.status === "Floor Plan").length,
    design3d: leads.filter((l) => l.status === "3D Design").length,
    followUp: leads.filter((l) => l.status === "Follow Up Again").length,
  };

  const getStatusBadgeStyle = (status: LeadStatus) => {
    switch (status) {
      case "Advance Payment":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Floor Plan":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "3D Design":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "Follow Up Again":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div
          onClick={() =>
            setSelectedStatusFilter(
              selectedStatusFilter === "Advance Payment"
                ? "all"
                : "Advance Payment"
            )
          }
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            selectedStatusFilter === "Advance Payment"
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-white/10 bg-white/5 hover:border-emerald-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Advance Payment</span>
            <span className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {statusCounts.advance}
          </p>
        </div>

        <div
          onClick={() =>
            setSelectedStatusFilter(
              selectedStatusFilter === "Floor Plan" ? "all" : "Floor Plan"
            )
          }
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            selectedStatusFilter === "Floor Plan"
              ? "border-blue-500 bg-blue-500/10"
              : "border-white/10 bg-white/5 hover:border-blue-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Floor Plan</span>
            <span className="rounded-lg bg-blue-500/20 p-2 text-blue-400">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {statusCounts.floorPlan}
          </p>
        </div>

        <div
          onClick={() =>
            setSelectedStatusFilter(
              selectedStatusFilter === "3D Design" ? "all" : "3D Design"
            )
          }
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            selectedStatusFilter === "3D Design"
              ? "border-purple-500 bg-purple-500/10"
              : "border-white/10 bg-white/5 hover:border-purple-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">3D Design</span>
            <span className="rounded-lg bg-purple-500/20 p-2 text-purple-400">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {statusCounts.design3d}
          </p>
        </div>

        <div
          onClick={() =>
            setSelectedStatusFilter(
              selectedStatusFilter === "Follow Up Again"
                ? "all"
                : "Follow Up Again"
            )
          }
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            selectedStatusFilter === "Follow Up Again"
              ? "border-amber-500 bg-amber-500/10"
              : "border-white/10 bg-white/5 hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Follow Up Again</span>
            <span className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {statusCounts.followUp}
          </p>
        </div>
      </div>

      {/* SEARCH, STATUS FILTER & ACTIONS BAR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Buttons */}
          <button
            onClick={() => setSelectedStatusFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              selectedStatusFilter === "all"
                ? "bg-white text-black shadow"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            All Leads ({leads.length})
          </button>
          {LEAD_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedStatusFilter(opt)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedStatusFilter === opt
                  ? "bg-white text-black shadow"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 py-1.5 pr-4 pl-9 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => fetchLeads()}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white"
            title="Refresh Leads"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShowAddLeadModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            <PlusCircle className="h-4 w-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* SERVICE LEADS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-sm text-zinc-400">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading service leads...
          </div>
        ) : paginatedLeads.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-400">
            No service leads found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-zinc-900/60 tracking-wider text-zinc-400 uppercase">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Client Info</th>
                  <th className="px-4 py-3.5 font-semibold">Service Details</th>
                  <th className="px-4 py-3.5 font-semibold">Appointment</th>
                  <th className="px-4 py-3.5 font-semibold">Amount</th>
                  <th className="px-4 py-3.5 font-semibold">
                    Status (Click to Change)
                  </th>
                  <th className="px-4 py-3.5 text-right font-semibold">
                    Notes & Logs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {paginatedLeads.map((lead) => {
                  const isNotesExpanded = !!expandedNotes[lead.id];
                  const noteCount = lead.notes ? lead.notes.length : 0;

                  return (
                    <tr
                      key={lead.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      {/* Client Info */}
                      <td className="px-4 py-4 align-top">
                        <div className="text-sm font-semibold text-white">
                          {lead.name}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-zinc-400">
                          <Phone className="h-3 w-3 text-zinc-500" />
                          <span>{lead.phone}</span>
                        </div>
                        {lead.email && (
                          <div className="mt-0.5 flex items-center gap-1.5 text-zinc-400">
                            <Mail className="h-3 w-3 text-zinc-500" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Service Details */}
                      <td className="max-w-[220px] px-4 py-4 align-top">
                        <div className="font-medium text-white">
                          {lead.serviceName}
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-500">
                          ID: {lead.id}
                        </div>
                      </td>

                      {/* Appointment */}
                      <td className="px-4 py-4 align-top">
                        {lead.appointmentDate ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span>{lead.appointmentDate}</span>
                            </div>
                            {lead.appointmentTime && (
                              <div className="flex items-center gap-1.5 text-zinc-400">
                                <Clock className="h-3 w-3 text-zinc-500" />
                                <span>{lead.appointmentTime}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic">
                            No slot selected
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4 align-top">
                        <div className="text-sm font-bold text-white">
                          ₹{lead.amount.toLocaleString("en-IN")}
                        </div>
                        <span
                          className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                            lead.paymentStatus === "completed"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {lead.paymentStatus === "completed"
                            ? "Paid"
                            : "Pending"}
                        </span>
                      </td>

                      {/* Status Dropdown Select */}
                      <td className="px-4 py-4 align-top">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(
                              lead.id,
                              e.target.value as LeadStatus
                            )
                          }
                          disabled={actionLoading === `status_${lead.id}`}
                          className={`w-full cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold transition outline-none ${getStatusBadgeStyle(
                            lead.status
                          )} bg-zinc-900`}
                        >
                          {LEAD_STATUS_OPTIONS.map((statusOpt) => (
                            <option
                              key={statusOpt}
                              value={statusOpt}
                              className="bg-zinc-900 font-normal text-white"
                            >
                              {statusOpt}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Notes & Logs Action */}
                      <td className="px-4 py-4 text-right align-top">
                        <button
                          onClick={() =>
                            setExpandedNotes((prev) => ({
                              ...prev,
                              [lead.id]: !prev[lead.id],
                            }))
                          }
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                            isNotesExpanded
                              ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                              : noteCount > 0
                                ? "border-white/10 bg-white/10 text-white hover:bg-white/15"
                                : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                          }`}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Notes ({noteCount})</span>
                        </button>

                        {/* EXPANDABLE NOTES PANEL & LOG FORM */}
                        {isNotesExpanded && (
                          <div className="mt-3 min-w-[280px] space-y-3 rounded-xl border border-white/10 bg-zinc-900/90 p-3 text-left shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                                Notes &amp; Timestamps Log
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                {noteCount}{" "}
                                {noteCount === 1 ? "entry" : "entries"}
                              </span>
                            </div>

                            {/* Add Note Input Form */}
                            <div className="space-y-2">
                              <textarea
                                placeholder="Enter details to log (e.g. Discussed floor plan revision, follow-up call scheduled...)"
                                value={noteInputs[lead.id] || ""}
                                onChange={(e) =>
                                  setNoteInputs((prev) => ({
                                    ...prev,
                                    [lead.id]: e.target.value,
                                  }))
                                }
                                rows={2}
                                className="w-full rounded-lg border border-white/10 bg-zinc-950 p-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleAddNote(lead.id)}
                                  disabled={
                                    !noteInputs[lead.id] ||
                                    !noteInputs[lead.id].trim() ||
                                    actionLoading === `note_${lead.id}`
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                                >
                                  <Send className="h-3 w-3" />
                                  {actionLoading === `note_${lead.id}`
                                    ? "Logging..."
                                    : "Log Note"}
                                </button>
                              </div>
                            </div>

                            {/* Past Notes List with Day & Time Logs */}
                            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                              {lead.notes && lead.notes.length > 0 ? (
                                lead.notes.map((note) => (
                                  <div
                                    key={note.id}
                                    className="space-y-1 rounded-lg border border-white/5 bg-zinc-950/60 p-2 text-xs"
                                  >
                                    <div className="flex items-center justify-between text-[10px] font-medium text-indigo-400">
                                      <span>📅 {note.formattedTime}</span>
                                      {note.author && (
                                        <span className="text-zinc-500">
                                          by {note.author}
                                        </span>
                                      )}
                                    </div>
                                    <p className="leading-relaxed whitespace-pre-wrap text-zinc-200">
                                      {note.text}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="py-2 text-center text-[11px] text-zinc-500">
                                  No notes logged yet. Use the form above to add
                                  a note with day &amp; time.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS (10 PER PAGE) */}
        {!loading && totalLeads > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 bg-zinc-900/60 px-4 py-3 sm:flex-row">
            <div className="text-xs text-zinc-400">
              Showing{" "}
              <span className="font-semibold text-white">{startIndex + 1}</span>{" "}
              to <span className="font-semibold text-white">{endIndex}</span> of{" "}
              <span className="font-semibold text-white">{totalLeads}</span>{" "}
              service leads
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-7 w-7 rounded-lg text-xs font-semibold transition ${
                        safeCurrentPage === pageNum
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={safeCurrentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD NEW LEAD MODAL */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                Add New Service Lead
              </h3>
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="text-lg font-bold text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-medium text-zinc-400">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ankit Sharma"
                  value={newLeadForm.name}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-zinc-400">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={newLeadForm.phone}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-zinc-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={newLeadForm.email}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-zinc-400">
                  Service Name
                </label>
                <input
                  type="text"
                  placeholder="3D Design / Floor Plan / Vastu"
                  value={newLeadForm.serviceName}
                  onChange={(e) =>
                    setNewLeadForm({
                      ...newLeadForm,
                      serviceName: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-zinc-400">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="999"
                    value={newLeadForm.amount}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, amount: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-zinc-400">
                    Status
                  </label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        status: e.target.value as LeadStatus,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-white outline-none focus:border-indigo-500"
                  >
                    {LEAD_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-zinc-400">
                  Initial Note (Log date &amp; time)
                </label>
                <textarea
                  rows={2}
                  placeholder="Log initial notes about client request..."
                  value={newLeadForm.noteText}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, noteText: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "create_lead"}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {actionLoading === "create_lead"
                    ? "Saving..."
                    : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
