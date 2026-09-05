import { db } from "../data/db.js";

export const instrumentRepository = {
  getAll: async () => {
    return [...db.instruments];
  },
  getByDistrict: async (district_id) => {
    if (!district_id || district_id === "ALL") return [...db.instruments];
    return db.instruments.filter((i) => i.district_id === district_id);
  },
  getByBusiness: async (businessId) => {
    if (!businessId) return [];
    return db.instruments.filter(
      (i) => i.businessId === businessId || i.business_id === businessId
    );
  },
  getById: async (id) => {
    return (
      db.instruments.find((i) => i.id?.toLowerCase() === id?.toLowerCase()) || null
    );
  },
  create: async (instrumentData) => {
    db.instruments.unshift(instrumentData);
    db.persist();
    return instrumentData;
  },
  update: async (id, updateData) => {
    const index = db.instruments.findIndex(
      (i) => i.id?.toLowerCase() === id?.toLowerCase()
    );
    if (index === -1) return null;
    db.instruments[index] = { ...db.instruments[index], ...updateData, updatedAt: new Date().toISOString() };
    db.persist();
    return db.instruments[index];
  },
};
