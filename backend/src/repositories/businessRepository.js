import { db } from "../data/db.js";

export const businessRepository = {
  getAll: async () => {
    return [...db.businesses];
  },
  getByDistrict: async (district_id) => {
    if (!district_id || district_id === "ALL") return [...db.businesses];
    return db.businesses.filter((b) => b.district_id === district_id);
  },
  getById: async (id) => {
    if (!id) return null;
    return (
      db.businesses.find(
        (b) =>
          b.id?.toLowerCase() === id.toLowerCase() ||
          b.email?.toLowerCase() === id.toLowerCase()
      ) || null
    );
  },
  update: async (id, updateData) => {
    const index = db.businesses.findIndex(
      (b) =>
        b.id?.toLowerCase() === id?.toLowerCase() ||
        b.email?.toLowerCase() === id?.toLowerCase()
    );
    if (index === -1) {
      // If not found by ID or email, create/insert
      const newBiz = {
        id,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      db.businesses.push(newBiz);
      db.persist();
      return newBiz;
    }
    db.businesses[index] = {
      ...db.businesses[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    db.persist();
    return db.businesses[index];
  },
};
