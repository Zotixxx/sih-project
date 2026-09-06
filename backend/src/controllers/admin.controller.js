import { adminService } from "../services/adminService.js";

export const adminController = {
  getDashboard: async (req, res, next) => {
    try {
      const data = await adminService.getDashboard(req.user);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  searchAssistantControllers: async (req, res, next) => {
    try {
      const data = await adminService.searchAssistantControllers(req.user, req.query);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getAssistantController: async (req, res, next) => {
    try {
      const data = await adminService.getAssistantController(req.user, req.params.id);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  createAssistantController: async (req, res, next) => {
    try {
      const data = await adminService.createAssistantController(req.user, req.body);
      return res.status(201).json({
        success: true,
        data,
        message: "Assistant Controller district account created.",
      });
    } catch (error) {
      next(error);
    }
  },

  updateAssistantController: async (req, res, next) => {
    try {
      const data = await adminService.updateAssistantController(req.user, req.params.id, req.body);
      return res.json({
        success: true,
        data,
        message: "Assistant Controller officer details updated.",
      });
    } catch (error) {
      next(error);
    }
  },

  searchLmos: async (req, res, next) => {
    try {
      const data = await adminService.searchLmos(req.user, req.query);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getLmo: async (req, res, next) => {
    try {
      const data = await adminService.getLmo(req.user, req.params.id);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  searchAuditLogs: async (req, res, next) => {
    try {
      const data = await adminService.searchAuditLogs(req.user, req.query);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
