import crypto from "crypto";
import { certificateRepository } from "../repositories/certificateRepository.js";
import { applicationRepository } from "../repositories/applicationRepository.js";
import { inspectionRepository } from "../repositories/inspectionRepository.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { districtRepository } from "../repositories/districtRepository.js";
import { APPLICATION_STATUS, INSPECTION_STATUS, CERTIFICATE_STATUS } from "../constants/status.js";
import { ROLES } from "../constants/roles.js";

export const certificateService = {
  getCertificates: async (user) => {
    return certificateRepository.getByDistrict(user.district_id);
  },

  getCertificateById: async (id, user) => {
    const cert = await certificateRepository.getById(id);
    if (!cert) {
      const err = new Error("Certificate not found.");
      err.statusCode = 404;
      throw err;
    }

    // If user provided, check district isolation (public routes pass user=null)
    if (user && user.role !== ROLES.SYSTEM_ADMIN && user.district_id !== "ALL") {
      if (cert.district_id !== user.district_id) {
        const err = new Error("Forbidden: Certificate belongs to another district.");
        err.statusCode = 403;
        throw err;
      }
    }

    return cert;
  },

  searchCertificates: async (query, user) => {
    const districtId = user?.district_id || null;
    return certificateRepository.search(query, districtId);
  },

  approveAndGenerateCertificate: async (applicationId, user, remarks) => {
    if (user.role !== ROLES.ASSISTANT_CONTROLLER && user.role !== ROLES.SYSTEM_ADMIN) {
      const err = new Error("Forbidden: Only an Assistant Controller can sanction certificates.");
      err.statusCode = 403;
      throw err;
    }

    const application = await applicationRepository.getById(applicationId);
    if (!application) {
      const err = new Error("Application not found.");
      err.statusCode = 404;
      throw err;
    }

    // District isolation check
    if (user.role !== ROLES.SYSTEM_ADMIN && application.district_id !== user.district_id) {
      const err = new Error(
        `Forbidden: Cannot approve applications from district '${application.district_id}'. Your assigned district is '${user.district_id}'.`
      );
      err.statusCode = 403;
      throw err;
    }

    // Ensure application is awaiting approval
    if (application.status !== APPLICATION_STATUS.AWAITING_APPROVAL) {
      const err = new Error(
        `Invalid transition: Application must be in 'AWAITING_APPROVAL' state. Current state: '${application.status}'.`
      );
      err.statusCode = 400;
      throw err;
    }

    // Look up associated inspection
    const inspection =
      (application.inspectionId && (await inspectionRepository.getById(application.inspectionId))) ||
      (await inspectionRepository.getByApplicationId(applicationId));

    if (!inspection) {
      const err = new Error("Cannot sanction: Inspection record not found for this application.");
      err.statusCode = 400;
      throw err;
    }

    const district = await districtRepository.getById(application.district_id);
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const certNumber = `LM-${application.district_id}-2026-${randomSuffix}`;
    const certId = `CERT-${application.district_id}-${Date.now().toString().slice(-4)}`;
    const qrToken = `VRF-${application.district_id}-2026-${randomSuffix}`;

    // Compute cryptographic SHA-256 integrity hash
    const securityHash = crypto
      .createHash("sha256")
      .update(certNumber + (application.serialNumber || "SN") + today + application.district_id + "_METRIX_GOV")
      .digest("hex");

    const newCertificate = {
      id: certId,
      certificateNumber: certNumber,
      officialNumber: `RJ/${application.district_id}/2026/${randomSuffix}`,
      district_id: application.district_id,
      district: application.district || district?.name || "Ajmer",
      applicationId: application.id,
      inspectionId: inspection.id,
      businessId: application.businessId,
      businessName: application.businessName,
      ownerName: application.businessName,
      applicantName: application.applicantName,
      instrumentId: application.instrumentId,
      instrumentName: application.instrumentName,
      instrumentType: application.instrumentType,
      manufacturer: application.manufacturer,
      model: application.model,
      serialNumber: application.serialNumber,
      capacity: application.capacity,
      accuracyClass: application.accuracyClass,
      location: application.location,
      verificationDate: inspection.inspectionDate || today,
      validFrom: today,
      validUntil: nextYear,
      verifyingOfficer: `${inspection.officerName} (${inspection.officerBadge})`,
      approvingOfficer: `${user.name} (Assistant Controller, ${district?.name || application.district})`,
      issuingAuthority: `Directorate of Legal Metrology, Government of Rajasthan (${district?.name || application.district} District)`,
      status: CERTIFICATE_STATUS.VALID,
      sealNumber: inspection.sealNumber || `RAJ-${application.district_id}-2026-SL-${Math.floor(10000 + Math.random() * 90000)}`,
      securityHash,
      qrVerificationToken: qrToken,
      createdTimestamp: now.toISOString(),
      remarks: remarks || "Statutory verification approved and digital certificate sanctioned under Legal Metrology Act, 2009.",
    };

    const savedCertificate = await certificateRepository.create(newCertificate);

    // Update inspection
    await inspectionRepository.update(inspection.id, {
      status: INSPECTION_STATUS.APPROVED,
      certificateId: savedCertificate.id,
      certificateNumber: certNumber,
      approvedDate: today,
    });

    // Advance application state to CERTIFIED
    const updatedTimeline = [
      ...(application.timeline || []),
      {
        event: "Statutory Verification Approved",
        date: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        actor: `${user.name} (${user.role})`,
        remarks: remarks || "Verification sanctioned",
      },
      {
        event: "Digital Certificate & QR Generated",
        date: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        actor: "MetriX Authority Trust System",
        certificateNumber: certNumber,
      },
    ];

    await applicationRepository.update(applicationId, {
      status: APPLICATION_STATUS.CERTIFIED,
      certificateId: savedCertificate.id,
      certificateNumber: certNumber,
      certifiedDate: today,
      timeline: updatedTimeline,
    });

    // Create audit record
    await auditRepository.create({
      district_id: application.district_id,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: "CERTIFICATE_GENERATED",
      entity_type: "CERTIFICATE",
      entity_id: savedCertificate.id,
      remarks: `Certificate ${certNumber} sanctioned for ${application.businessName}. SHA-256 Hash: ${securityHash.substring(0, 16)}...`,
    });

    // Notify Business
    await notificationRepository.create({
      district_id: application.district_id,
      targetRole: ROLES.BUSINESS,
      title: "Legal Metrology Certificate Issued",
      message: `Verification certificate ${certNumber} has been sanctioned for your instrument ${application.instrumentName}.`,
      link: `/certificates`,
    });

    return savedCertificate;
  },

  returnInspection: async (applicationId, reason, user) => {
    if (user.role !== ROLES.ASSISTANT_CONTROLLER && user.role !== ROLES.SYSTEM_ADMIN) {
      const err = new Error("Forbidden: Only an Assistant Controller can return inspections.");
      err.statusCode = 403;
      throw err;
    }

    if (!reason || !reason.trim()) {
      const err = new Error("Validation error: A formal reason is mandatory when returning an inspection.");
      err.statusCode = 400;
      throw err;
    }

    const application = await applicationRepository.getById(applicationId);
    if (!application) {
      const err = new Error("Application not found.");
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== ROLES.SYSTEM_ADMIN && application.district_id !== user.district_id) {
      const err = new Error("Forbidden: Cannot return inspections from another district.");
      err.statusCode = 403;
      throw err;
    }

    if (application.status !== APPLICATION_STATUS.AWAITING_APPROVAL) {
      const err = new Error(
        `Invalid transition: Application must be in 'AWAITING_APPROVAL' state to return for correction.`
      );
      err.statusCode = 400;
      throw err;
    }

    // Update inspection status to RETURNED
    if (application.inspectionId) {
      await inspectionRepository.update(application.inspectionId, {
        status: INSPECTION_STATUS.RETURNED,
        returnReason: reason.trim(),
        returnedAt: new Date().toISOString(),
      });
    }

    const updatedTimeline = [
      ...(application.timeline || []),
      {
        event: "Inspection Returned for Correction",
        date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        actor: `${user.name} (${user.role})`,
        reason: reason.trim(),
      },
    ];

    // Reset application to SCHEDULED so LMO can re-execute inspection
    const updatedApplication = await applicationRepository.update(applicationId, {
      status: APPLICATION_STATUS.SCHEDULED,
      returnReason: reason.trim(),
      timeline: updatedTimeline,
    });

    // Audit record
    await auditRepository.create({
      district_id: application.district_id,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: "APPROVAL_RETURNED",
      entity_type: "APPLICATION",
      entity_id: applicationId,
      remarks: `Inspection returned to LMO for correction. Reason: ${reason.trim()}`,
    });

    // Notify assigned LMO
    await notificationRepository.create({
      district_id: application.district_id,
      targetRole: ROLES.LMO,
      title: "Inspection Returned for Clarification",
      message: `Assistant Controller returned inspection for ${application.businessName}. Reason: ${reason.trim()}`,
      link: `/applications/${applicationId}`,
    });

    return updatedApplication;
  },
};
