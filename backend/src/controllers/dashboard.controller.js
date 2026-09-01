import { dashboardService } from "../services/dashboardService.js";

export const dashboardController = {
  getStats: async (req, res) => {
    try {
      const stats = await dashboardService.getStats(req.user);
      return res.json({ success: true, data: stats });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: "DASHBOARD_STATS_ERROR", message: error.message },
      });
    }
  },
};
