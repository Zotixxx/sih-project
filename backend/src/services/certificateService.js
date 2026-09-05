import crypto from "crypto";
import { applicationRepository } from "../repositories/applicationRepository.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { certificateRepository } from "../repositories/certificateRepository.js";
import { districtRepository } from "../repositories/districtRepository.js";
import { inspectionRepository } from "../repositories/inspectionRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { APPLICATION_STATUS, INSPECTION_STATUS } from "../constants/status.js";
import { ROLES } from "../constants/roles.js";
import { badRequest, conflict, forbidden, notFound } from "../utils/errors.js";

const actorUserId = (user) => user.auth_user_id || user.user_id || user.id;

const assertCertificateAccess = (certificate, user) => {
  if (!certificate) throw notFound("Certificate not found.");
  if (!user || user.role === ROLES.SYSTEM_ADMIN) return;

  if (user.role === ROLES.BUSINESS) {
    if (certificate.businessUuid !== user.business_uuid && certificate.businessUserId !== actorUserId(user)) {
      throw forbidden("Certificate belongs to another business.");
    }
    return;
  }

  if (certificate.district_id !== user.district_id && user.district_id !== "ALL") {
    throw forbidden("Certificate belongs to another district.");
  }
};

const applicationScopeCheck = (application, user, action) => {
  if (!application) throw notFound("Application not found.");
  if (user.role !== ROLES.SYSTEM_ADMIN && application.district_id !== user.district_id) {
    throw forbidden(`Cannot ${action} applications from another district.`);
  }
};

const buildPublicSnapshot = ({ application, inspection, district, user, today, validUntil, remarks }) => ({
  applicationId: application.applicationId,
  certificateId: application.applicationId,
  certificateNumber: application.applicationId,
  businessId: application.businessId,
  businessName: application.businessName,
  ownerName: application.businessName,
  applicantName: application.applicantName,
  district_id: application.district_id,
  district: district?.name || application.verificationLocation?.district || application.district_id,
  instrumentId: application.instrumentId,
  instrumentName: application.instrumentName,
  instrumentType: application.instrumentType,
  manufacturer: application.manufacturer,
  model: application.model,
  serialNumber: application.serialNumber,
  capacity: application.capacity,
  accuracyClass: application.accuracyClass,
  location: [
    application.verificationLocation?.city,
    application.verificationLocation?.district,
    application.verificationLocation?.state,
  ]
    .filter(Boolean)
    .join(", "),
  verificationDate: inspection.inspectionDate || today,
  validFrom: today,
  validUntil,
  verifyingOfficer: `${inspection.officerName} (${inspection.officerBadge || inspection.lmoId})`,
  approvingOfficer: `${user.name} (${user.designation || "Assistant Controller"})`,
  issuingAuthority: district?.state
    ? `Directorate of Legal Metrology, Government of ${district.state}`
    : "Directorate of Legal Metrology",
  sealNumber: inspection.sealNumber,
  remarks: remarks || "Statutory verification approved and digital certificate issued.",
});

export const certificateService = {
  getCertificates: async (user) => {
    if (user.role === ROLES.BUSINESS) {
      return certificateRepository.getByBusiness(user.business_uuid);
    }
    if (user.role === ROLES.ASSISTANT_CONTROLLER || user.role === ROLES.LMO) {
      if (!user.district_id) throw forbidden("Officer district scope is not configured.");
      return certificateRepository.getByDistrict(user.district_id);
    }
    if (user.role === ROLES.SYSTEM_ADMIN) {
      return certificateRepository.getByDistrict(user.district_id || "ALL");
    }
    throw forbidden("Role is not authorized to list certificates.");
  },

  getCertificateById: async (id, user) => {
    const certificate = await certificateRepository.getById(id);
    assertCertificateAccess(certificate, user);
    return certificate;
  },

  searchCertificates: async (query, user) => {
    let districtId = null;
    if (user?.role === ROLES.SYSTEM_ADMIN) {
      districtId = user.district_id || "ALL";
    } else if (user?.role === ROLES.ASSISTANT_CONTROLLER || user?.role === ROLES.LMO) {
      if (!user.district_id) throw forbidden("Officer district scope is not configured.");
      districtId = user.district_id;
    }
    let certificates = await certificateRepository.search(query, districtId);
    if (user?.role === ROLES.BUSINESS) {
      certificates = certificates.filter(
        (certificate) => certificate.businessUuid === user.business_uuid || certificate.businessUserId === actorUserId(user)
      );
    }
    return certificates;
  },

  approveAndGenerateCertificate: async (applicationId, user, remarks) => {
    if (user.role !== ROLES.ASSISTANT_CONTROLLER && user.role !== ROLES.SYSTEM_ADMIN) {
      throw forbidden("Only an Assistant Controller can sanction certificates.");
    }

    const application = await applicationRepository.getById(applicationId);
    applicationScopeCheck(application, user, "approve");

    const existingCertificate = await certificateRepository.getByApplicationId(application.uuid);
    if (existingCertificate) {
      throw conflict("A certificate has already been generated for this application.");
    }

    if (application.status !== APPLICATION_STATUS.AWAITING_APPROVAL) {
      throw badRequest(
        `Application must be in 'AWAITING_APPROVAL' state. Current state: '${application.status}'.`
      );
    }

    const inspection =
      (application.inspectionId && (await inspectionRepository.getById(application.inspectionId))) ||
      (await inspectionRepository.getByApplicationId(application.id));
    if (!inspection) throw badRequest("Cannot sanction: inspection record was not found for this application.");
    if (inspection.status !== INSPECTION_STATUS.SUBMITTED) {
      throw badRequest(`Inspection must be submitted before approval. Current status: '${inspection.status}'.`);
    }
    if (!inspection.measurements?.length) {
      throw badRequest("Inspection measurements are required before certificate approval.");
    }

    const district = await districtRepository.getById(application.district_id);
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const validUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const certificateId = application.applicationId || application.id;
    const officialNumber = `${application.district_id}/${now.getFullYear()}/${certificateId}`;
    const securityHash = crypto
      .createHash("sha256")
      .update(`${certificateId}:${application.serialNumber || ""}:${inspection.sealNumber || ""}:${today}:METRIX`)
      .digest("hex");

    const publicSnapshot = buildPublicSnapshot({
      application,
      inspection,
      district,
      user,
      today,
      validUntil,
      remarks,
    });

    const savedCertificate = await certificateRepository.approveApplicationTransaction({
      applicationRef: certificateId,
      actorUserId: actorUserId(user),
      actorRole: user.role,
      validFrom: today,
      validUntil,
      securityHash,
      officialNumber,
      publicSnapshot,
      remarks,
    });

    return savedCertificate;
  },

  returnInspection: async (applicationId, reason, user) => {
    if (user.role !== ROLES.ASSISTANT_CONTROLLER && user.role !== ROLES.SYSTEM_ADMIN) {
      throw forbidden("Only an Assistant Controller can return inspections.");
    }

    if (!reason || !reason.trim()) {
      throw badRequest("A formal reason is mandatory when returning an inspection.");
    }

    const application = await applicationRepository.getById(applicationId);
    applicationScopeCheck(application, user, "return");

    if (application.status !== APPLICATION_STATUS.AWAITING_APPROVAL) {
      throw badRequest("Application must be in 'AWAITING_APPROVAL' state to return for correction.");
    }

    const inspection =
      (application.inspectionId && (await inspectionRepository.getById(application.inspectionId))) ||
      (await inspectionRepository.getByApplicationId(application.id));
    if (!inspection) throw badRequest("Inspection record not found for this application.");

    await inspectionRepository.update(inspection.id, {
      status: INSPECTION_STATUS.RETURNED,
      returnReason: reason.trim(),
      returnedAt: new Date().toISOString(),
    });

    const updatedApplication = await applicationRepository.update(applicationId, {
      status: APPLICATION_STATUS.SCHEDULED,
      returnedReason: reason.trim(),
    });

    await applicationRepository.addStatusHistory({
      applicationUuid: application.uuid,
      fromStatus: application.status,
      toStatus: APPLICATION_STATUS.SCHEDULED,
      actorUserId: actorUserId(user),
      reason: reason.trim(),
    });

    await auditRepository.create({
      district_id: application.district_id,
      actor_user_id: actorUserId(user),
      actor_role: user.role,
      action: "FINAL_REVIEW_RETURNED",
      entity_type: "APPLICATION",
      entity_id: application.applicationId || application.id,
      metadata: { reason: reason.trim() },
    });

    if (application.assignedLmoUserId) {
      await notificationRepository.create({
        district_id: application.district_id,
        recipient_user_id: application.assignedLmoUserId,
        related_application_uuid: application.uuid,
        title: "Inspection Returned",
        message: `Application ${application.applicationId} was returned for correction. Reason: ${reason.trim()}`,
        category: "INSPECTION_RETURNED",
        link: `/${application.assignedLmoUserId}/inspections`,
      });
    }

    return updatedApplication;
  },
};
