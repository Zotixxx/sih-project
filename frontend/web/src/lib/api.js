// MetriX Frontend Unified API Client connecting to Express Backend on port 5001
// Automatically passes x-user-id header for multi-district authorization

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

let activeUserId = "AC-AJM-001";

export const setApiUserId = (userId) => {
  activeUserId = userId;
};

export const getApiUserId = () => activeUserId;

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": activeUserId,
        ...options.headers,
      },
      ...options,
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = body?.error?.message || body?.message || `HTTP error ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = body?.error?.code || "REQUEST_FAILED";
      throw err;
    }

    return body;
  } catch (err) {
    console.error(`API Request Error [${endpoint}]:`, err);
    throw err;
  }
}

export const metrixApi = {
  setUserId: setApiUserId,
  getUserId: getApiUserId,

  // Health & Stats
  getHealth: () => request("/health"),
  getDashboardStats: () => request("/dashboard/stats"),
  getProfile: () => request("/auth/profile"),
  getDemoUsers: () => request("/auth/demo-users"),

  // Business Profile
  getBusinessProfile: () => request("/business/profile"),
  updateBusinessProfile: (data) =>
    request("/business/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Instruments
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

  // Applications
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

  // LMOs
  getLmos: () => request("/lmos"),
  getLmoById: (id) => request(`/lmos/${id}`),

  // Inspections
  getInspections: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inspections${query ? `?${query}` : ""}`);
  },
  getInspectionById: (id) => request(`/inspections/${id}`),
  startInspection: (id) =>
    request(`/inspections/${id}/start`, { method: "POST" }),
  submitInspection: (id, payload) =>
    request(`/inspections/${id}/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Approvals & Supervisory Actions
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

  // Certificates & Search
  getCertificates: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/certificates${query ? `?${query}` : ""}`);
  },
  getCertificateById: (id) => request(`/certificates/${id}`),
  searchCertificates: (query) =>
    request(`/certificates/search?q=${encodeURIComponent(query)}`),
  getPublicCertificate: (id) => request(`/public/certificates/${id}`),

  // Reports, Audits & Notifications
  getReportsSummary: () => request("/reports/summary"),
  getAuditLogs: () => request("/reports/audit-logs"),
  getNotifications: () => request("/reports/notifications"),
  createNotice: (data) =>
    request("/reports/notifications/notice", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resetDatabase: () => request("/reset", { method: "POST" }),
};
