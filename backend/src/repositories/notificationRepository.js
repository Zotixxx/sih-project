import { db } from "../data/db.js";

export const notificationRepository = {
  getAll: async () => {
    return [...db.notifications];
  },
  getByUser: async (user) => {
    if (!user) return [...db.notifications];

    const { district_id, role, id, badgeNumber } = user;

    return db.notifications.filter((n) => {
      // Check district match
      const matchesDistrict =
        !district_id || district_id === "ALL" || !n.district_id || n.district_id === "ALL" || n.district_id === district_id;

      if (!matchesDistrict) return false;

      // If user is Assistant Controller or Admin:
      if (role === "ASSISTANT_CONTROLLER" || role === "SYSTEM_ADMIN") {
        // Can see AC notices or notices issued by themselves
        return (
          n.targetRole === "ASSISTANT_CONTROLLER" ||
          n.targetRole === "ADMIN" ||
          n.targetRole === "ALL" ||
          n.senderId === id ||
          !n.targetRole
        );
      }

      // If user is LMO:
      if (role === "LMO") {
        const matchesRole = n.targetRole === "LMO" || n.targetRole === "ALL" || !n.targetRole;
        if (!matchesRole) return false;

        // If targeted to specific LMO:
        if (n.targetUserId && n.targetUserId !== "ALL") {
          return (
            n.targetUserId.toLowerCase() === id.toLowerCase() ||
            (badgeNumber && n.targetUserId.toLowerCase() === badgeNumber.toLowerCase())
          );
        }
        return true;
      }

      // If user is Business:
      if (role === "BUSINESS") {
        const matchesRole = n.targetRole === "BUSINESS" || n.targetRole === "ALL" || !n.targetRole;
        if (!matchesRole) return false;
        if (n.targetUserId && n.targetUserId !== "ALL") {
          return n.targetUserId.toLowerCase() === id.toLowerCase() || n.business_id === id;
        }
        return true;
      }

      return true;
    });
  },
  getByDistrictAndRole: async (district_id, role) => {
    return db.notifications.filter((n) => {
      const matchesDistrict = !district_id || district_id === "ALL" || n.district_id === district_id;
      const matchesRole = !role || n.targetRole === role || n.targetRole === "ALL";
      return matchesDistrict && matchesRole;
    });
  },
  create: async (notificationData) => {
    const entry = {
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notificationData,
    };
    db.notifications.unshift(entry);
    db.persist();
    return entry;
  },
};
