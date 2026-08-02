import { getSupabaseAdmin } from "@/lib/supabase";

export type LeadStatus =
  | "Advance Payment"
  | "Floor Plan"
  | "3D Design"
  | "Follow Up Again";

export interface LeadNote {
  id: string;
  text: string;
  createdAt: string; // ISO string
  formattedTime: string; // e.g. "Sunday, Aug 2, 2026 - 05:33 PM"
  author?: string;
}

export interface ServiceLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  serviceName: string;
  appointmentDate?: string;
  appointmentTime?: string;
  amount: number;
  paymentStatus: "completed" | "pending" | "failed";
  status: LeadStatus;
  notes: LeadNote[];
  createdAt: string;
  updatedAt: string;
}

export const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  "Advance Payment",
  "Floor Plan",
  "3D Design",
  "Follow Up Again",
];

function formatLogTimestamp(isoStr: string): string {
  const d = new Date(isoStr);
  const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
  const dateStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${dayName}, ${dateStr} at ${timeStr}`;
}

// Initial seed data if database is empty
const initialLeads: ServiceLead[] = [
  {
    id: "lead_101",
    name: "Rahul Verma",
    phone: "+91 98765 43210",
    email: "rahul.verma@example.com",
    serviceName: "3D Design for Interiors & Exteriors",
    appointmentDate: "2026-08-05",
    appointmentTime: "11:00 AM",
    amount: 999,
    paymentStatus: "completed",
    status: "Advance Payment",
    notes: [
      {
        id: "note_101_1",
        text: "Received initial advance payment of ₹999. Client requested modern minimalist interior 3D renders.",
        createdAt: "2026-08-01T10:15:00Z",
        formattedTime: formatLogTimestamp("2026-08-01T10:15:00Z"),
        author: "Admin",
      },
    ],
    createdAt: "2026-08-01T10:15:00Z",
    updatedAt: "2026-08-01T10:15:00Z",
  },
  {
    id: "lead_102",
    name: "Priya Sharma",
    phone: "+91 98123 45678",
    email: "priya.sharma@gmail.com",
    serviceName: "Floor Plan Design Consultation",
    appointmentDate: "2026-08-04",
    appointmentTime: "02:00 PM",
    amount: 6500,
    paymentStatus: "completed",
    status: "Floor Plan",
    notes: [
      {
        id: "note_102_1",
        text: "Initial floor plan requirements collected. Plot dimensions: 30x50 East facing with Vastu guidelines.",
        createdAt: "2026-08-01T14:30:00Z",
        formattedTime: formatLogTimestamp("2026-08-01T14:30:00Z"),
        author: "Admin",
      },
    ],
    createdAt: "2026-08-01T14:30:00Z",
    updatedAt: "2026-08-01T14:30:00Z",
  },
  {
    id: "lead_103",
    name: "Amit Patel",
    phone: "+91 97234 56789",
    email: "amit.patel@yahoo.com",
    serviceName: "1 HR Vastu Consultation",
    appointmentDate: "2026-08-06",
    appointmentTime: "04:00 PM",
    amount: 6500,
    paymentStatus: "completed",
    status: "3D Design",
    notes: [
      {
        id: "note_103_1",
        text: "Completed Vastu consultation. Moving to 3D elevation design phase.",
        createdAt: "2026-08-02T09:00:00Z",
        formattedTime: formatLogTimestamp("2026-08-02T09:00:00Z"),
        author: "Admin",
      },
    ],
    createdAt: "2026-08-02T09:00:00Z",
    updatedAt: "2026-08-02T09:00:00Z",
  },
  {
    id: "lead_104",
    name: "Ananya Gupta",
    phone: "+91 99876 54321",
    email: "ananya.g@outlook.com",
    serviceName: "Space Saving Consultation",
    appointmentDate: "2026-08-07",
    appointmentTime: "06:00 PM",
    amount: 30000,
    paymentStatus: "pending",
    status: "Follow Up Again",
    notes: [
      {
        id: "note_104_1",
        text: "Discussed developer space optimization. Scheduled follow-up call after budget approval.",
        createdAt: "2026-08-02T11:20:00Z",
        formattedTime: formatLogTimestamp("2026-08-02T11:20:00Z"),
        author: "Admin",
      },
    ],
    createdAt: "2026-08-02T11:20:00Z",
    updatedAt: "2026-08-02T11:20:00Z",
  },
  {
    id: "lead_105",
    name: "Karan Malhotra",
    phone: "+91 98450 12345",
    email: "karan.m@gmail.com",
    serviceName: "Architectural 3D Visualizer",
    appointmentDate: "2026-08-08",
    appointmentTime: "11:00 AM",
    amount: 999,
    paymentStatus: "completed",
    status: "Advance Payment",
    notes: [],
    createdAt: "2026-08-02T12:00:00Z",
    updatedAt: "2026-08-02T12:00:00Z",
  },
  {
    id: "lead_106",
    name: "Vikram Singh",
    phone: "+91 97110 98765",
    email: "vikram.singh@gmail.com",
    serviceName: "Floor Plan & Elevation Package",
    appointmentDate: "2026-08-09",
    appointmentTime: "03:00 PM",
    amount: 6500,
    paymentStatus: "completed",
    status: "Floor Plan",
    notes: [],
    createdAt: "2026-08-02T13:10:00Z",
    updatedAt: "2026-08-02T13:10:00Z",
  },
  {
    id: "lead_107",
    name: "Neha Reddy",
    phone: "+91 96500 87654",
    email: "neha.reddy@techcorp.com",
    serviceName: "Google Meet Interior Design Call",
    appointmentDate: "2026-08-10",
    appointmentTime: "05:00 PM",
    amount: 2999,
    paymentStatus: "completed",
    status: "Follow Up Again",
    notes: [
      {
        id: "note_107_1",
        text: "Sent sample portfolio PDF. Client requested callback next Tuesday.",
        createdAt: "2026-08-02T14:45:00Z",
        formattedTime: formatLogTimestamp("2026-08-02T14:45:00Z"),
        author: "Admin",
      },
    ],
    createdAt: "2026-08-02T14:45:00Z",
    updatedAt: "2026-08-02T14:45:00Z",
  },
  {
    id: "lead_108",
    name: "Siddharth Mehta",
    phone: "+91 98200 76543",
    email: "siddharth.m@gmail.com",
    serviceName: "Full Home 3D Modeling",
    appointmentDate: "2026-08-11",
    appointmentTime: "12:00 PM",
    amount: 999,
    paymentStatus: "completed",
    status: "3D Design",
    notes: [],
    createdAt: "2026-08-02T15:30:00Z",
    updatedAt: "2026-08-02T15:30:00Z",
  },
  {
    id: "lead_109",
    name: "Rohan Joshi",
    phone: "+91 99100 65432",
    email: "rohan.joshi@gmail.com",
    serviceName: "Exterior Facade 3D Design",
    appointmentDate: "2026-08-12",
    appointmentTime: "01:00 PM",
    amount: 999,
    paymentStatus: "completed",
    status: "Advance Payment",
    notes: [],
    createdAt: "2026-08-02T16:00:00Z",
    updatedAt: "2026-08-02T16:00:00Z",
  },
  {
    id: "lead_110",
    name: "Pooja Nair",
    phone: "+91 98711 54321",
    email: "pooja.nair@designstudio.in",
    serviceName: "Commercial Floor Plan Layout",
    appointmentDate: "2026-08-13",
    appointmentTime: "04:00 PM",
    amount: 6500,
    paymentStatus: "completed",
    status: "Floor Plan",
    notes: [],
    createdAt: "2026-08-02T16:30:00Z",
    updatedAt: "2026-08-02T16:30:00Z",
  },
  {
    id: "lead_111",
    name: "Deepak Kumar",
    phone: "+91 97600 43210",
    email: "deepak.kumar@gmail.com",
    serviceName: "Villa Architectural Floor Plan",
    appointmentDate: "2026-08-14",
    appointmentTime: "10:00 AM",
    amount: 6500,
    paymentStatus: "pending",
    status: "Follow Up Again",
    notes: [
      {
        id: "note_111_1",
        text: "Client requested revision on ground floor room layout.",
        createdAt: "2026-08-02T17:00:00Z",
        formattedTime: formatLogTimestamp("2026-08-02T17:00:00Z"),
        author: "Admin",
      },
    ],
    createdAt: "2026-08-02T17:00:00Z",
    updatedAt: "2026-08-02T17:00:00Z",
  },
  {
    id: "lead_112",
    name: "Shalini Kapoor",
    phone: "+91 98990 32109",
    email: "shalini.k@gmail.com",
    serviceName: "Modular Kitchen 3D Design",
    appointmentDate: "2026-08-15",
    appointmentTime: "02:00 PM",
    amount: 999,
    paymentStatus: "completed",
    status: "3D Design",
    notes: [],
    createdAt: "2026-08-02T17:15:00Z",
    updatedAt: "2026-08-02T17:15:00Z",
  },
];

// In-memory store
let memoryLeadsStore: ServiceLead[] = [...initialLeads];

export async function getAllServiceLeads(): Promise<ServiceLead[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("service_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      // Map database rows into ServiceLead items
      const dbLeads: ServiceLead[] = data.map((row: any) => {
        let parsedNotes: LeadNote[] = [];
        if (row.notes_json) {
          try {
            parsedNotes =
              typeof row.notes_json === "string"
                ? JSON.parse(row.notes_json)
                : row.notes_json;
          } catch {}
        } else if (Array.isArray(row.notes)) {
          parsedNotes = row.notes;
        }

        // Determine default status if missing
        let status: LeadStatus = "Follow Up Again";
        if (row.lead_status && LEAD_STATUS_OPTIONS.includes(row.lead_status)) {
          status = row.lead_status as LeadStatus;
        } else if (row.status && LEAD_STATUS_OPTIONS.includes(row.status)) {
          status = row.status as LeadStatus;
        } else if (row.payment_status === "completed") {
          status = "Advance Payment";
        }

        return {
          id: row.id || "lead_" + Math.random().toString(36).substring(2, 9),
          name: row.name || "Unknown Lead",
          phone: row.phone || "",
          email: row.email || "",
          serviceName:
            row.service_name || row.service_id || "Consultation Call",
          appointmentDate: row.appointment_date || undefined,
          appointmentTime: row.appointment_time || undefined,
          amount:
            typeof row.amount === "number"
              ? row.amount
              : parseFloat(row.amount || "0"),
          paymentStatus:
            row.payment_status === "completed" ? "completed" : "pending",
          status,
          notes: Array.isArray(parsedNotes) ? parsedNotes : [],
          createdAt: row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at || new Date().toISOString(),
        };
      });

      // Merge DB leads with memory leads avoiding duplicates
      const mergedMap = new Map<string, ServiceLead>();
      dbLeads.forEach((l) => mergedMap.set(l.id, l));
      memoryLeadsStore.forEach((l) => {
        if (!mergedMap.has(l.id)) {
          mergedMap.set(l.id, l);
        }
      });

      memoryLeadsStore = Array.from(mergedMap.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (err) {
    console.warn(
      "Supabase fetch service leads skipped, using memory store:",
      err
    );
  }

  return memoryLeadsStore;
}

export async function updateLeadStatus(
  leadId: string,
  newStatus: LeadStatus
): Promise<ServiceLead | null> {
  const leadIndex = memoryLeadsStore.findIndex((l) => l.id === leadId);
  if (leadIndex !== -1) {
    const now = new Date().toISOString();
    memoryLeadsStore[leadIndex].status = newStatus;
    memoryLeadsStore[leadIndex].updatedAt = now;

    try {
      await getSupabaseAdmin()
        .from("service_leads")
        .update({
          lead_status: newStatus,
          status: newStatus,
          updated_at: now,
        })
        .eq("id", leadId);
    } catch (err) {
      console.warn("Supabase lead status update skipped:", err);
    }

    return memoryLeadsStore[leadIndex];
  }
  return null;
}

export async function addLeadNote(
  leadId: string,
  noteText: string,
  author: string = "Admin"
): Promise<ServiceLead | null> {
  const leadIndex = memoryLeadsStore.findIndex((l) => l.id === leadId);
  if (leadIndex !== -1) {
    const nowISO = new Date().toISOString();
    const formatted = formatLogTimestamp(nowISO);
    const newNote: LeadNote = {
      id:
        "note_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now(),
      text: noteText.trim(),
      createdAt: nowISO,
      formattedTime: formatted,
      author,
    };

    memoryLeadsStore[leadIndex].notes.unshift(newNote);
    memoryLeadsStore[leadIndex].updatedAt = nowISO;

    try {
      await getSupabaseAdmin()
        .from("service_leads")
        .update({
          notes_json: JSON.stringify(memoryLeadsStore[leadIndex].notes),
          updated_at: nowISO,
        })
        .eq("id", leadId);
    } catch (err) {
      console.warn("Supabase lead note update skipped:", err);
    }

    return memoryLeadsStore[leadIndex];
  }
  return null;
}

export async function createNewLead(
  leadData: Partial<ServiceLead>
): Promise<ServiceLead> {
  const nowISO = new Date().toISOString();
  const leadId =
    "lead_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();

  const newLead: ServiceLead = {
    id: leadId,
    name: leadData.name || "New Lead",
    phone: leadData.phone || "",
    email: leadData.email || "",
    serviceName: leadData.serviceName || "Architectural Service",
    appointmentDate: leadData.appointmentDate,
    appointmentTime: leadData.appointmentTime,
    amount: leadData.amount || 0,
    paymentStatus: leadData.paymentStatus || "pending",
    status: leadData.status || "Follow Up Again",
    notes: leadData.notes || [],
    createdAt: nowISO,
    updatedAt: nowISO,
  };

  memoryLeadsStore.unshift(newLead);

  try {
    await getSupabaseAdmin()
      .from("service_leads")
      .upsert({
        id: newLead.id,
        name: newLead.name,
        phone: newLead.phone,
        email: newLead.email,
        service_name: newLead.serviceName,
        appointment_date: newLead.appointmentDate,
        appointment_time: newLead.appointmentTime,
        amount: newLead.amount,
        payment_status: newLead.paymentStatus,
        lead_status: newLead.status,
        notes_json: JSON.stringify(newLead.notes),
        created_at: newLead.createdAt,
        updated_at: newLead.updatedAt,
      });
  } catch (err) {
    console.warn("Supabase create new lead skipped:", err);
  }

  return newLead;
}
