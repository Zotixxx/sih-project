import { db } from "../data/db.js";
import { ROLES } from "../constants/roles.js";

export const userRepository = {
  getAll: async () => {
    return [...db.users];
  },
  getById: async (id) => {
    if (!id) return null;
    return (
      db.users.find(
        (u) =>
          u.id?.toLowerCase() === id.toLowerCase() ||
          u.business_id?.toLowerCase() === id.toLowerCase() ||
          u.email?.toLowerCase() === id.toLowerCase()
      ) || null
    );
  },
  getByDistrict: async (district_id) => {
    if (!district_id || district_id === "ALL") return [...db.users];
    return db.users.filter((u) => u.district_id === district_id || u.district_id === "ALL");
  },
  getLmosByDistrict: async (district_id) => {
    return db.users.filter(
      (u) => u.role === ROLES.LMO && (!district_id || district_id === "ALL" || u.district_id === district_id)
    );
  },
  getAssistantControllerByDistrict: async (district_id) => {
    return db.users.find(
      (u) => u.role === ROLES.ASSISTANT_CONTROLLER && u.district_id === district_id
    ) || null;
  },
};
