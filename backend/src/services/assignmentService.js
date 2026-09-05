import { applicationRepository } from "../repositories/applicationRepository.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { inspectionRepository } from "../repositories/inspectionRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { APPLICATION_STATUS, INSPECTION_STATUS } from "../constants/status.js";
import { ROLES } from "../constants/roles.js";
import { badRequest, forbidden, notFound, unprocessable } from "../utils/errors.js";

const actorUserId = (user) => user.auth_user_id || user.user_id || user.id;

export const assignmentService = {
  assignLmo: async (applicationId, lmoId, scheduledDate, user) => {
    if (user.role !== ROLES.ASSISTANT_CONTROLLER && user.role !== ROLES.SYSTEM_ADMIN) {
      throw forbidden("Only an Assistant Controller can assign field officers.");
    }

    if (!lmoId) throw badRequest("lmoId is required.");

    const application = await applicationRepository.getById(applicationId);
    if (!application) throw notFound("Application not found.");

    if (user.role !== ROLES.SYSTEM_ADMIN && application.district_id !== user.district_id) {
      throw forbidden("Cannot assign LMO for applications in another district.");
    }

    const acceptsDuringAssignment = [
      APPLICATION_STATUS.SUBMITTED,
      APPLICATION_STATUS.UNDER_REVIEW,
    ].includes(application.status);

    if (
      ![
        APPLICATION_STATUS.SUBMITTED,
        APPLICATION_STATUS.UNDER_REVIEW,
        APPLICATION_STATUS.ACCEPTED,
        APPLICATION_STATUS.SCHEDULED,
      ].includes(application.status)
    ) {
      throw badRequest(
        `Application must be submitted or accepted before assigning an LMO. Current status: '${application.status}'.`
      );
    }

    const lmo = await userRepository.getById(lmoId);
    if (!lmo || lmo.role !== ROLES.LMO || !lmo.lmo_uuid) {
      throw unprocessable("Invalid field officer (LMO) selected.");
    }

    if (lmo.district_id !== application.district_id) {
      throw badRequest(
        `Cannot assign LMO from district '${lmo.district_id}' to application district '${application.district_id}'.`
      );
    }

    const dateStr = scheduledDate || new Date().toISOString().split("T")[0];
    const updatedApplication = await applicationRepository.update(applicationId, {
      status: APPLICATION_STATUS.SCHEDULED,
      assignedLmoUuid: lmo.lmo_uuid,
      assignedAt: new Date().toISOString(),
      acceptedAt: acceptsDuringAssignment ? new Date().toISOString() : undefined,
    });

    if (acceptsDuringAssignment) {
      await applicationRepository.addStatusHistory({
        applicationUuid: application.uuid,
        fromStatus: application.status,
        toStatus: APPLICATION_STATUS.ACCEPTED,
        actorUserId: actorUserId(user),
        reason: "Application accepted during LMO assignment.",
      });

      await auditRepository.create({
        district_id: application.district_id,
        actor_user_id: actorUserId(user),
        actor_role: user.role,
        action: "APPLICATION_ACCEPTED",
        entity_type: "APPLICATION",
        entity_id: application.applicationId || application.id,
        metadata: { previousStatus: application.status },
      });

      if (application.businessUserId) {
        await notificationRepository.create({
          district_id: application.district_id,
          recipient_user_id: application.businessUserId,
          related_application_uuid: application.uuid,
          title: "Application Accepted",
          message: `Application ${application.applicationId || application.id} has been accepted for field assignment.`,
          category: "APPLICATION_ACCEPTED",
          link: `/${application.businessUserId}/applications/${application.applicationId || application.id}`,
        });
      }
    }

    let inspection = await inspectionRepository.getByApplicationId(applicationId);
    if (!inspection) {
      inspection = await inspectionRepository.create({
        id: `INSP-${application.applicationId || application.id}`,
        district_id: application.district_id,
        applicationUuid: application.uuid,
        lmoUuid: lmo.lmo_uuid,
        scheduledDate: dateStr,
        status: INSPECTION_STATUS.ASSIGNED,
      });
    } else {
      inspection = await inspectionRepository.update(inspection.id, {
        lmoUuid: lmo.lmo_uuid,
        scheduledDate: dateStr,
        status: INSPECTION_STATUS.ASSIGNED,
      });
    }

    await applicationRepository.addStatusHistory({
      applicationUuid: application.uuid,
      fromStatus: acceptsDuringAssignment ? APPLICATION_STATUS.ACCEPTED : application.status,
      toStatus: APPLICATION_STATUS.SCHEDULED,
      actorUserId: actorUserId(user),
      reason: `Assigned to ${lmo.lmo_id || lmo.domainId}.`,
    });

    await auditRepository.create({
      district_id: application.district_id,
      actor_user_id: actorUserId(user),
      actor_role: user.role,
      action: "LMO_ASSIGNED",
      entity_type: "APPLICATION",
      entity_id: application.applicationId || application.id,
      metadata: {
        lmoId: lmo.lmo_id || lmo.domainId,
        scheduledDate: dateStr,
      },
    });

    await notificationRepository.create({
      district_id: application.district_id,
      recipient_user_id: actorUserId(lmo),
      related_application_uuid: application.uuid,
      title: "New Inspection Assigned",
      message: `Application ${application.applicationId || application.id} has been assigned for field inspection.`,
      category: "LMO_ASSIGNED",
      link: `/${actorUserId(lmo)}/inspections`,
    });

    return { application: updatedApplication, inspection };
  },
};
