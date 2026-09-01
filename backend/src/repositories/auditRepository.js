import { db } from "../data/db.js";

export const auditRepository = {
  getAll: async () => {
    return [...db.auditLogs];
  },
  getByDistrict: async (district_id) => {
    if (!district_id || district_id === "ALL") return [...db.auditLogs];
    return db.auditLogs.filter((a) => a.district_id === district_id);
  },
  create: async (auditData) => {
    const entry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...auditData,
    };
    db.auditLogs.unshift(entry);
    return entry;
  },
};
