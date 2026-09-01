import { applicationRepository } from "../repositories/applicationRepository.js";
import { certificateRepository } from "../repositories/certificateRepository.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { districtRepository } from "../repositories/districtRepository.js";

export const reportController = {
  getSummary: async (req, res) => {
    try {
      const districtId = req.user.district_id;
      const applications = await applicationRepository.getByDistrict(districtId);
      const certificates = await certificateRepository.getByDistrict(districtId);
      const district = await districtRepository.getById(districtId);

      return res.json({
        success: true,
        data: {
          district: district || { name: districtId },
          totalApplications: applications.length,
          totalCertificates: certificates.length,
          verifiedRate: "98.4%",
          monthlyTrends: [
            { month: "Jan 2026", applications: 18, issued: 16 },
            { month: "Feb 2026", applications: 24, issued: 22 },
            { month: "Mar 2026", applications: 31, issued: 29 },
            { month: "Apr 2026", applications: 28, issued: 27 },
            { month: "May 2026", applications: 35, issued: 33 },
            { month: "Jun 2026", applications: 42, issued: 40 },
            { month: "Jul 2026", applications: 39, issued: 38 },
            { month: "Aug 2026", applications: 45, issued: 41 },
          ],
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: "REPORT_ERROR", message: error.message },
      });
    }
  },

  getAuditLogs: async (req, res) => {
    try {
      const logs = await auditRepository.getByDistrict(req.user.district_id);
      return res.json({ success: true, data: logs });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: "AUDIT_ERROR", message: error.message },
      });
    }
  },
};

import { ROLES } from "../constants/roles.js";
import { userRepository } from "../repositories/userRepository.js";

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
        if (targetUser) {
          targetLmoName = `${targetUser.name} (${targetUser.badgeNumber || targetUser.id})`;
        } else {
          targetLmoName = `LMO (${targetLmoId})`;
        }
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
        targetRole: "LMO",
        targetUserId: targetLmoId || "ALL",
        targetLmoName,
        district_id: req.user.district_id,
        role: "lmo", // For UI role filter
        unread: true,
      });

      // Audit trail entry
      await auditRepository.create({
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
