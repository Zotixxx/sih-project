import { applicationService } from "../services/applicationService.js";
import { assignmentService } from "../services/assignmentService.js";

export const applicationController = {
  getApplications: async (req, res) => {
    try {
      const applications = await applicationService.getApplications(req.user, req.query);
      return res.json({ success: true, data: applications });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: "APP_FETCH_ERROR", message: error.message },
      });
    }
  },

  getApplicationById: async (req, res) => {
    try {
      const application = await applicationService.getApplicationById(req.params.id, req.user);
      return res.json({ success: true, data: application });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: error.statusCode === 403 ? "FORBIDDEN" : "NOT_FOUND", message: error.message },
      });
    }
  },

  createApplication: async (req, res) => {
    try {
      const created = await applicationService.createApplication(req.user, req.body);
      return res.status(201).json({
        success: true,
        message: "Application submitted successfully.",
        data: created,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.statusCode === 403 ? "FORBIDDEN" : "SUBMISSION_ERROR",
          message: error.message,
          missingFields: error.missingFields || null,
        },
      });
    }
  },

  saveDraft: async (req, res) => {
    try {
      const draft = await applicationService.saveDraft(req.user, req.body);
      return res.json({ success: true, data: draft, message: "Draft saved successfully." });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: "DRAFT_ERROR", message: error.message },
      });
    }
  },

  getDraft: async (req, res) => {
    try {
      const draft = await applicationService.getDraft(req.user);
      return res.json({ success: true, data: draft });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: "DRAFT_FETCH_ERROR", message: error.message },
      });
    }
  },

  acceptApplication: async (req, res) => {
    try {
      const updated = await applicationService.acceptApplication(req.params.id, req.user);
      return res.json({ success: true, data: updated, message: "Application accepted successfully." });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: error.statusCode === 403 ? "FORBIDDEN" : "ACCEPT_ERROR", message: error.message },
      });
    }
  },

  rejectApplication: async (req, res) => {
    try {
      const { reason } = req.body;
      const updated = await applicationService.rejectApplication(req.params.id, reason, req.user);
      return res.json({ success: true, data: updated, message: "Application rejected." });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: error.statusCode === 403 ? "FORBIDDEN" : "REJECT_ERROR", message: error.message },
      });
    }
  },

  assignLmo: async (req, res) => {
    try {
      const { lmoId, scheduledDate } = req.body;
      const result = await assignmentService.assignLmo(req.params.id, lmoId, scheduledDate, req.user);
      return res.json({ success: true, data: result, message: "LMO assigned successfully." });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: error.statusCode === 403 ? "FORBIDDEN" : "ASSIGN_ERROR", message: error.message },
      });
    }
  },
};
