import { applicationRepository } from "../repositories/applicationRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { inspectionRepository } from "../repositories/inspectionRepository.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { APPLICATION_STATUS, INSPECTION_STATUS } from "../constants/status.js";
import { ROLES } from "../constants/roles.js";

export const assignmentService = {
  assignLmo: async (applicationId, lmoId, scheduledDate, user) => {
    if (user.role !== ROLES.ASSISTANT_CONTROLLER && user.role !== ROLES.SYSTEM_ADMIN) {
      const err = new Error("Forbidden: Only an Assistant Controller can assign field officers.");
      err.statusCode = 403;
      throw err;
    }

    const application = await applicationRepository.getById(applicationId);
    if (!application) {
      const err = new Error("Application not found.");
      err.statusCode = 404;
      throw err;
    }

    // District match check for Assistant Controller
    if (user.role !== ROLES.SYSTEM_ADMIN && application.district_id !== user.district_id) {
      const err = new Error("Forbidden: Cannot assign LMO for applications in another district.");
      err.statusCode = 403;
      throw err;
    }

    if (application.status !== APPLICATION_STATUS.ACCEPTED && application.status !== APPLICATION_STATUS.SCHEDULED) {
      const err = new Error(
        `Invalid transition: Application must be in 'ACCEPTED' state before assigning an LMO. Current status: '${application.status}'.`
      );
      err.statusCode = 400;
      throw err;
    }

    const lmo = await userRepository.getById(lmoId);
    if (!lmo || lmo.role !== ROLES.LMO) {
      const err = new Error("Validation error: Invalid field officer (LMO) selected.");
      err.statusCode = 400;
      throw err;
    }

    // Critical rule: LMO MUST belong to the application's district
    if (lmo.district_id !== application.district_id) {
      const err = new Error(
        `District mismatch: Cannot assign an LMO from district '${lmo.district_id}' to an application in '${application.district_id}'.`
      );
      err.statusCode = 400;
      throw err;
    }

    const dateStr = scheduledDate || new Date().toISOString().split("T")[0];

    const updatedTimeline = [
      ...(application.timeline || []),
      {
        event: "Field Duty Assigned & Scheduled",
        date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        actor: `${user.name} (${user.role})`,
        lmoAssigned: `${lmo.name} (${lmo.id})`,
      },
    ];

    const updatedApplication = await applicationRepository.update(applicationId, {
      status: APPLICATION_STATUS.SCHEDULED,
      assignedLmoId: lmo.id,
      assignedLmoName: lmo.name,
      assignedDate: new Date().toISOString(),
      scheduledDate: dateStr,
      timeline: updatedTimeline,
    });

    // Create or update inspection record
    let inspection = await inspectionRepository.getByApplicationId(applicationId);
    if (!inspection) {
      inspection = await inspectionRepository.create({
        id: `INSP-${application.district_id}-${Date.now().toString().slice(-4)}`,
        district_id: application.district_id,
        district: application.district,
        applicationId: application.id,
        businessId: application.businessId,
        businessName: application.businessName,
        instrumentId: application.instrumentId,
        instrumentName: application.instrumentName,
        serialNumber: application.serialNumber,
        lmoId: lmo.id,
        officerId: lmo.id,
        officerName: lmo.name,
        officerBadge: lmo.badgeNumber || lmo.id,
        scheduledDate: dateStr,
        status: INSPECTION_STATUS.ASSIGNED,
      });
    } else {
      inspection = await inspectionRepository.update(inspection.id, {
        lmoId: lmo.id,
        officerId: lmo.id,
        officerName: lmo.name,
        officerBadge: lmo.badgeNumber || lmo.id,
        scheduledDate: dateStr,
        status: INSPECTION_STATUS.ASSIGNED,
      });
    }

    // Audit record
    await auditRepository.create({
      district_id: application.district_id,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: "LMO_ASSIGNED",
      entity_type: "APPLICATION",
      entity_id: applicationId,
      remarks: `Assigned to ${lmo.name} (${lmo.id}) for field verification on ${dateStr}.`,
    });

    // Notification to LMO
    await notificationRepository.create({
      district_id: application.district_id,
      targetRole: ROLES.LMO,
      title: "New Field Inspection Assigned",
      message: `Inspection duty assigned for ${application.businessName} (${application.instrumentName}). Scheduled: ${dateStr}.`,
      link: `/applications/${application.id}`,
    });

    return { application: updatedApplication, inspection };
  },
};
