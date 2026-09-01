import { applicationRepository } from "../repositories/applicationRepository.js";
import { inspectionRepository } from "../repositories/inspectionRepository.js";
import { certificateService } from "../services/certificateService.js";
import { APPLICATION_STATUS } from "../constants/status.js";

export const approvalController = {
  getAwaitingApproval: async (req, res) => {
    try {
      const applications = await applicationRepository.getByDistrict(req.user.district_id);
      const awaiting = applications.filter((a) => a.status === APPLICATION_STATUS.AWAITING_APPROVAL);

      // Hydrate with inspection reports
      const hydrated = await Promise.all(
        awaiting.map(async (app) => {
          const insp =
            (app.inspectionId && (await inspectionRepository.getById(app.inspectionId))) ||
            (await inspectionRepository.getByApplicationId(app.id));
          return {
            ...app,
            inspection: insp || null,
          };
        })
      );

      return res.json({ success: true, data: hydrated });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: "AWAITING_FETCH_ERROR", message: error.message },
      });
    }
  },

  approve: async (req, res) => {
    try {
      const { applicationId, remarks } = req.body;
      const certificate = await certificateService.approveAndGenerateCertificate(
        applicationId,
        req.user,
        remarks
      );
      return res.json({
        success: true,
        data: certificate,
        message: "Application approved and digital certificate sanctioned.",
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: error.statusCode === 403 ? "FORBIDDEN" : "APPROVE_ERROR", message: error.message },
      });
    }
  },

  returnInspection: async (req, res) => {
    try {
      const { applicationId, reason } = req.body;
      const updated = await certificateService.returnInspection(applicationId, reason, req.user);
      return res.json({
        success: true,
        data: updated,
        message: "Inspection returned to officer for clarification.",
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: error.statusCode === 403 ? "FORBIDDEN" : "RETURN_ERROR", message: error.message },
      });
    }
  },
};
