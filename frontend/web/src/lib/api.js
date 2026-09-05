import { getSupabaseBrowserClient } from "./supabase/browser";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const getAuthHeaders = async () => {
  if (!isSupabaseConfigured) return {};

  const { data } = await getSupabaseBrowserClient().auth.getSession();
  if (!data.session?.access_token) return {};
  return { Authorization: `Bearer ${data.session.access_token}` };
};

async function request(endpoint, options = {}) {
  const { auth = true, headers, ...fetchOptions } = options;
  const url = `${API_BASE}${endpoint}`;

  try {
    const authHeaders = auth ? await getAuthHeaders() : {};
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...headers,
      },
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(body?.error?.message || body?.message || `HTTP error ${res.status}`);
      err.status = res.status;
      err.code = body?.error?.code || "REQUEST_FAILED";
      throw err;
    }

    return body;
  } catch (err) {
    if (!err.status || err.status >= 500) {
      console.error(`API Request Error [${endpoint}]:`, err);
    }
    throw err;
  }
}

export const metrixApi = {
  isSupabaseConfigured,

  loginWithSupabase: async (email, password) => {
    const { data, error } = await getSupabaseBrowserClient().auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new Error(error?.message || "Supabase login failed.");
    const profile = await request("/auth/profile", {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    });
    return { session: data.session, user: profile.data };
  },

  registerBusinessProfile: (data, accessToken) =>
    request("/auth/register-business", {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: JSON.stringify(data),
    }),

  logoutSupabase: async () => {
    if (isSupabaseConfigured) {
      await getSupabaseBrowserClient().auth.signOut();
    }
  },

  getHealth: () => request("/health", { auth: false }),
  getPublicDistricts: () => request("/public/districts", { auth: false }),
  getDashboardStats: () => request("/dashboard/stats"),
  getProfile: () => request("/auth/profile"),

  getBusinessProfile: () => request("/business/profile"),
  updateBusinessProfile: (data) =>
    request("/business/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getInstruments: () => request("/instruments"),
  getInstrumentById: (id) => request(`/instruments/${id}`),
  createInstrument: (data) =>
    request("/instruments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateInstrument: (id, data) =>
    request(`/instruments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  uploadDocument: (data) =>
    request("/documents/upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/applications${query ? `?${query}` : ""}`);
  },
  getApplicationById: (id) => request(`/applications/${id}`),
  createApplication: (data) =>
    request("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  saveDraft: (data) =>
    request("/applications/draft", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getDraft: () => request("/applications/drafts/current"),
  acceptApplication: (id) =>
    request(`/applications/${id}/accept`, {
      method: "POST",
    }),
  rejectApplication: (id, reason) =>
    request(`/applications/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  assignLmo: (applicationId, lmoId, scheduledDate) =>
    request(`/applications/${applicationId}/assign`, {
      method: "POST",
      body: JSON.stringify({ lmoId, scheduledDate }),
    }),

  getLmos: () => request("/lmos"),
  getLmoById: (id) => request(`/lmos/${id}`),

  getInspections: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inspections${query ? `?${query}` : ""}`);
  },
  getInspectionById: (id) => request(`/inspections/${id}`),
  startInspection: (id) => request(`/inspections/${id}/start`, { method: "POST" }),
  submitInspection: (id, payload) =>
    request(`/inspections/${id}/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAwaitingApproval: () => request("/approvals/awaiting"),
  approveInspection: (applicationId, remarks) =>
    request("/approvals/approve", {
      method: "POST",
      body: JSON.stringify({ applicationId, remarks }),
    }),
  returnInspection: (applicationId, reason) =>
    request("/approvals/return", {
      method: "POST",
      body: JSON.stringify({ applicationId, reason }),
    }),

  getCertificates: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/certificates${query ? `?${query}` : ""}`);
  },
  getCertificateById: (id) => request(`/certificates/${id}`),
  searchCertificates: (query) => request(`/certificates/search?q=${encodeURIComponent(query)}`),
  getPublicCertificate: (id) => request(`/public/certificates/${id}`, { auth: false }),

  getReportsSummary: () => request("/reports/summary"),
  getAuditLogs: () => request("/reports/audit-logs"),
  getNotifications: () => request("/reports/notifications"),
  createNotice: (data) =>
    request("/reports/notifications/notice", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
