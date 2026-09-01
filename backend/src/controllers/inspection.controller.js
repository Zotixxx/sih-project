import { inspectionService } from "../services/inspectionService.js";

export const inspectionController = {
  getInspections: async (req, res) => {
    try {
      const inspections = await inspectionService.getInspections(req.user, req.query);
      return res.json({ success: true, data: inspections });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: "INSP_FETCH_ERROR", message: error.message },
      });
    }
  },

  getInspectionById: async (req, res) => {
    try {
      const inspection = await inspectionService.getInspectionById(req.params.id, req.user);
      return res.json({ success: true, data: inspection });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: error.statusCode === 403 ? "FORBIDDEN" : "NOT_FOUND", message: error.message },
      });
    }
  },

  startInspection: async (req, res) => {
    try {
      const started = await inspectionService.startInspection(req.params.id, req.user);
      return res.json({ success: true, data: started, message: "Inspection started." });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: error.statusCode === 403 ? "FORBIDDEN" : "START_ERROR", message: error.message },
      });
    }
  },

  submitInspection: async (req, res) => {
    try {
      const submitted = await inspectionService.submitInspection(req.params.id, req.body, req.user);
      return res.json({ success: true, data: submitted, message: "Inspection submitted successfully." });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: error.statusCode === 403 ? "FORBIDDEN" : "SUBMIT_ERROR", message: error.message },
      });
    }
  },
};
