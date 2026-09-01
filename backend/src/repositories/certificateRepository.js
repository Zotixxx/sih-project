import { db } from "../data/db.js";

export const certificateRepository = {
  getAll: async () => {
    return [...db.certificates];
  },
  getByDistrict: async (district_id) => {
    if (!district_id || district_id === "ALL") return [...db.certificates];
    return db.certificates.filter((c) => c.district_id === district_id);
  },
  getById: async (id) => {
    return (
      db.certificates.find(
        (c) =>
          c.id === id ||
          c.certificateNumber === id ||
          c.officialNumber === id ||
          c.qrVerificationToken === id
      ) || null
    );
  },
  search: async (query, district_id) => {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();

    return db.certificates.filter((c) => {
      // District isolation
      if (district_id && district_id !== "ALL" && c.district_id !== district_id) {
        return false;
      }

      return (
        c.id?.toLowerCase().includes(q) ||
        c.certificateNumber?.toLowerCase().includes(q) ||
        c.officialNumber?.toLowerCase().includes(q) ||
        c.applicationId?.toLowerCase().includes(q) ||
        c.businessName?.toLowerCase().includes(q) ||
        c.ownerName?.toLowerCase().includes(q) ||
        c.applicantName?.toLowerCase().includes(q) ||
        c.serialNumber?.toLowerCase().includes(q) ||
        c.instrumentName?.toLowerCase().includes(q) ||
        c.sealNumber?.toLowerCase().includes(q)
      );
    });
  },
  create: async (certificateData) => {
    db.certificates.unshift(certificateData);
    return certificateData;
  },
  update: async (id, updateData) => {
    const index = db.certificates.findIndex((c) => c.id === id || c.certificateNumber === id);
    if (index === -1) return null;
    db.certificates[index] = { ...db.certificates[index], ...updateData };
    return db.certificates[index];
  },
};
