import { applicationRepository } from "../repositories/applicationRepository.js";
import { certificateRepository } from "../repositories/certificateRepository.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { districtRepository } from "../repositories/districtRepository.js";
import { ROLES } from "../constants/roles.js";
import { forbidden } from "../utils/errors.js";
import { userRepository } from "../repositories/userRepository.js";

const resolveDistrictScope = (user) => {
  if (user.role === ROLES.SYSTEM_ADMIN) return user.district_id || "ALL";
  if (!user.district_id) throw forbidden("District scope is not configured.");
  return user.district_id;
};

export const reportController = {
  getSummary: async (req, res) => {
    try {
      const districtId = resolveDistrictScope(req.user);
      const applications = await applicationRepository.getByDistrict(districtId);
      const certificates = await certificateRepository.getByDistrict(districtId);
      const district = districtId === "ALL" ? null : await districtRepository.getById(districtId);

      return res.json({
        success: true,
        data: {
          district: district || { name: districtId },
          totalApplications: applications.length,
          totalCertificates: certificates.length,
          verifiedRate: applications.length ? certificates.length / applications.length : null,
          monthlyTrends: [],
        },
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: "REPORT_ERROR", message: error.message },
      });
    }
  },

  getAuditLogs: async (req, res) => {
    try {
      const logs = await auditRepository.getByDistrict(resolveDistrictScope(req.user));
      return res.json({ success: true, data: logs });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: "AUDIT_ERROR", message: error.message },
      });
    }
  },
};

export const notificationController = {
  getNotifications: async (req, res) => {
    try {
      const notifs = await notificationRepository.getByUser(req.user);
      return res.json({ success: true, data: notifs });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: "NOTIFICATION_ERROR", message: error.message },
      });
    }
  },

  createNotice: async (req, res) => {
    try {
      const { title, message, priority, targetLmoId, statutoryRef } = req.body;

      // Only Assistant Controllers or System Admins can issue official directives to LMOs
      if (
        req.user.role !== ROLES.ASSISTANT_CONTROLLER &&
        req.user.role !== ROLES.SYSTEM_ADMIN
      ) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only Assistant Controllers can issue official directives to LMOs.",
          },
        });
      }

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Notice title / subject is required." },
        });
      }

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Notice directive instructions are required." },
        });
      }

      let targetLmoName = "All District Legal Metrology Officers";
      if (targetLmoId && targetLmoId !== "ALL") {
        const targetUser = await userRepository.getById(targetLmoId);
        if (
          !targetUser ||
          targetUser.role !== ROLES.LMO ||
          (req.user.role !== ROLES.SYSTEM_ADMIN && targetUser.district_id !== req.user.district_id)
        ) {
          return res.status(422).json({
            success: false,
            error: {
              code: "INVALID_LMO",
              message: "Select an LMO from your assigned district.",
            },
          });
        }
        targetLmoName = `${targetUser.name} (${targetUser.lmo_id || targetUser.domainId})`;
      }

      const notice = await notificationRepository.create({
        type: "OFFICIAL_DIRECTIVE",
        category: "OFFICIAL_DIRECTIVE",
        title: title.trim(),
        message: message.trim(),
        priority: priority || "DIRECTIVE",
        statutoryRef: statutoryRef?.trim() || "Legal Metrology Act, 2009",
        senderId: req.user.id,
        senderName: req.user.name,
        senderDesignation: req.user.designation || "Assistant Controller of Legal Metrology",
        senderOffice: req.user.office || `Office of the Assistant Controller, ${req.user.district_id}`,
        targetRole: ROLES.LMO,
        targetUserId: targetLmoId || "ALL",
        recipient_id: targetLmoId && targetLmoId !== "ALL" ? targetLmoId : undefined,
        targetLmoName,
        district_id: req.user.district_id,
        unread: true,
      });

      if (!notice) {
        return res.status(422).json({
          success: false,
          error: {
            code: "NO_RECIPIENTS",
            message: "No notification recipients were found for the selected notice target.",
          },
        });
      }

      // Audit trail entry
      await auditRepository.create({
        actor_user_id: req.user.auth_user_id || req.user.id,
        actor_role: req.user.role,
        entityId: notice.id,
        entityType: "OFFICIAL_NOTICE",
        action: "NOTICE_ISSUED",
        actor: `${req.user.name} (${req.user.role})`,
        district_id: req.user.district_id,
        details: `Issued ${notice.priority} directive to ${targetLmoName}: "${notice.title}"`,
      });

      return res.status(201).json({ success: true, data: notice });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: "NOTICE_CREATION_ERROR", message: error.message },
      });
    }
  },
};
