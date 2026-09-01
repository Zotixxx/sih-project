import { db } from "../data/db.js";

export const inspectionRepository = {
  getAll: async () => {
    return [...db.inspections];
  },
  getByDistrict: async (district_id) => {
    if (!district_id || district_id === "ALL") return [...db.inspections];
    return db.inspections.filter((i) => i.district_id === district_id);
  },
  getById: async (id) => {
    return db.inspections.find((i) => i.id === id) || null;
  },
  getByApplicationId: async (applicationId) => {
    return db.inspections.find((i) => i.applicationId === applicationId) || null;
  },
  getByLmoId: async (lmoId) => {
    return db.inspections.filter((i) => i.lmoId === lmoId || i.officerId === lmoId);
  },
  create: async (inspectionData) => {
    db.inspections.unshift(inspectionData);
    return inspectionData;
  },
  update: async (id, updateData) => {
    const index = db.inspections.findIndex((i) => i.id === id);
    if (index === -1) return null;
    db.inspections[index] = { ...db.inspections[index], ...updateData };
    return db.inspections[index];
  },
};
