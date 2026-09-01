import { db } from "../data/db.js";

export const districtRepository = {
  getAll: async () => {
    return [...db.districts];
  },
  getById: async (id) => {
    return db.districts.find((d) => d.id === id || d.code === id) || null;
  },
};
