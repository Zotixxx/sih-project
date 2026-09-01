import { businessService } from "../services/businessService.js";

export const businessController = {
  getProfile: async (req, res, next) => {
    try {
      const profile = await businessService.getProfile(req.user);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const updated = await businessService.updateProfile(req.user, req.body);
      res.json({
        success: true,
        message: "Business profile updated successfully.",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};
