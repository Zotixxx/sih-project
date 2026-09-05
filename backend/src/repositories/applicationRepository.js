import { db } from "../data/db.js";

export const applicationRepository = {
  getAll: async () => {
    return [...db.applications];
  },
  getByDistrict: async (district_id) => {
    if (!district_id || district_id === "ALL") return [...db.applications];
    return db.applications.filter((a) => a.district_id === district_id);
  },
  getById: async (id) => {
    return db.applications.find((a) => a.id === id) || null;
  },
  create: async (applicationData) => {
    db.applications.unshift(applicationData);
    db.persist();
    return applicationData;
  },
  update: async (id, updateData) => {
    const index = db.applications.findIndex((a) => a.id === id);
    if (index === -1) return null;
    db.applications[index] = { ...db.applications[index], ...updateData };
    db.persist();
    return db.applications[index];
  },
};
