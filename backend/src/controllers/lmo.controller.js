import { userRepository } from "../repositories/userRepository.js";
import { ROLES } from "../constants/roles.js";

export const lmoController = {
  getLmos: async (req, res) => {
    try {
      if (req.user.role !== ROLES.SYSTEM_ADMIN && !req.user.district_id) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Assistant Controller district scope is not configured." },
        });
      }
      const lmos = await userRepository.getLmosByDistrict(req.user.district_id || "ALL");
      return res.json({ success: true, data: lmos });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: "LMO_FETCH_ERROR", message: error.message },
      });
    }
  },

  getLmoById: async (req, res) => {
    try {
      const lmo = await userRepository.getById(req.params.id);
      if (!lmo || lmo.role !== ROLES.LMO) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "LMO officer not found." },
        });
      }

      if (req.user.role !== ROLES.SYSTEM_ADMIN && req.user.district_id !== "ALL") {
        if (lmo.district_id !== req.user.district_id) {
          return res.status(403).json({
            success: false,
            error: { code: "FORBIDDEN", message: "Forbidden: Officer belongs to another district." },
          });
        }
      }

      return res.json({ success: true, data: lmo });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: "LMO_FETCH_ERROR", message: error.message },
      });
    }
  },
};
