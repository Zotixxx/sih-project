import { applicationRepository } from "../repositories/applicationRepository.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { documentRepository } from "../repositories/documentRepository.js";
import { inspectionRepository } from "../repositories/inspectionRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { APPLICATION_STATUS, INSPECTION_STATUS } from "../constants/status.js";
import { ROLES } from "../constants/roles.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";

const actorUserId = (user) => user.auth_user_id || user.user_id || user.id;

const assertInspectionAccess = (inspection, user) => {
  if (!inspection) throw notFound("Inspection record not found.");
  if (user.role === ROLES.SYSTEM_ADMIN) return;

  if (user.role === ROLES.LMO) {
    if (inspection.lmoUuid !== user.lmo_uuid) {
      throw forbidden("You are not the assigned officer for this inspection.");
    }
    return;
  }

  if (user.role === ROLES.ASSISTANT_CONTROLLER) {
    if (inspection.district_id !== user.district_id) {
      throw forbidden("Inspection belongs to another district.");
    }
    return;
  }

  throw forbidden("Role is not authorized to access inspections.");
};

const normalizeMeasurements = (measurements) => {
  if (!Array.isArray(measurements) || !measurements.length) {
    throw badRequest("At least one measurement/finding is required before submitting verification.");
  }

  return measurements.map((measurement, index) => {
    const result = String(measurement.result || "").toUpperCase();
    if (!measurement.testLoad && !measurement.nominalLoad) {
      throw badRequest(`Measurement ${index + 1} is missing testLoad.`);
    }
    if (!["PASS", "FAIL"].includes(result)) {
      throw badRequest(`Measurement ${index + 1} result must be PASS or FAIL.`);
    }
    return {
      testLoad: measurement.testLoad || measurement.nominalLoad,
      indicatedWeight: measurement.indicatedWeight || measurement.observed || measurement.indicatedLoad || null,
      error: measurement.error || measurement.observedError || null,
      mpeLimit: measurement.mpeLimit || measurement.mpe || measurement.mpeAllowable || null,
      result,
    };
  });
};

const evidenceDocumentIds = (data) =>
  [
    ...(data.evidenceDocumentIds || []),
    ...(data.photoDocumentIds || []),
    ...(data.evidence || []),
    ...(data.photos || []),
  ]
    .map((entry) => (typeof entry === "string" ? entry : entry.documentId || entry.id))
    .filter(Boolean);

export const inspectionService = {
  getInspections: async (user, filters = {}) => {
    let inspections;

    if (user.role === ROLES.LMO) {
      if (!user.lmo_uuid) throw forbidden("LMO role record is not configured.");
      inspections = await inspectionRepository.getByLmoId(user.lmo_uuid);
    } else if (user.role === ROLES.ASSISTANT_CONTROLLER) {
      if (!user.district_id) throw forbidden("Assistant Controller district scope is not configured.");
      inspections = await inspectionRepository.getByDistrict(user.district_id);
    } else if (user.role === ROLES.SYSTEM_ADMIN) {
      inspections = await inspectionRepository.getByDistrict(user.district_id || "ALL");
    } else {
      throw forbidden("Role is not authorized to list inspections.");
    }

    if (filters.status) {
      inspections = inspections.filter((inspection) => inspection.status === filters.status);
    }

    return inspections;
  },

  getInspectionById: async (id, user) => {
    const inspection = await inspectionRepository.getById(id);
    assertInspectionAccess(inspection, user);
    return inspection;
  },

  startInspection: async (id, user) => {
    if (user.role !== ROLES.LMO && user.role !== ROLES.SYSTEM_ADMIN) {
      throw forbidden("Only an authorized LMO can start an inspection.");
    }

    const inspection = await inspectionRepository.getById(id);
    assertInspectionAccess(inspection, user);

    if (![INSPECTION_STATUS.ASSIGNED, INSPECTION_STATUS.RETURNED].includes(inspection.status)) {
      throw badRequest(`Inspection must be assigned before starting. Current status: '${inspection.status}'.`);
    }

    const updated = await inspectionRepository.update(id, {
      status: INSPECTION_STATUS.IN_PROGRESS,
    });

    if (inspection.applicationId) {
      const application = await applicationRepository.getById(inspection.applicationId);
      if (application) {
        await applicationRepository.update(application.id, {
          status: APPLICATION_STATUS.UNDER_VERIFICATION,
        });
        await applicationRepository.addStatusHistory({
          applicationUuid: application.uuid,
          fromStatus: application.status,
          toStatus: APPLICATION_STATUS.UNDER_VERIFICATION,
          actorUserId: actorUserId(user),
          reason: "LMO started field verification.",
        });
      }
    }

    await auditRepository.create({
      district_id: inspection.district_id,
      actor_user_id: actorUserId(user),
      actor_role: user.role,
      action: "INSPECTION_STARTED",
      entity_type: "INSPECTION",
      entity_id: inspection.inspection_id || inspection.id,
      metadata: {
        applicationId: inspection.applicationId,
      },
    });

    return updated;
  },

  submitInspection: async (id, data, user) => {
    if (user.role !== ROLES.LMO && user.role !== ROLES.SYSTEM_ADMIN) {
      throw forbidden("Only an authorized LMO can submit field inspections.");
    }

    const inspection = await inspectionRepository.getById(id);
    assertInspectionAccess(inspection, user);

    if (inspection.status !== INSPECTION_STATUS.IN_PROGRESS) {
      throw badRequest(`Inspection must be in progress before submission. Current status: '${inspection.status}'.`);
    }

    if (!data.sealNumber) throw badRequest("sealNumber is required.");
    if (!data.standardsUsed) throw badRequest("standardsUsed is required.");
    const measurements = normalizeMeasurements(data.measurements || data.findings);
    const inspectionDate = data.inspectionDate || new Date().toISOString().split("T")[0];

    const updatedInspection = await inspectionRepository.update(id, {
      status: INSPECTION_STATUS.SUBMITTED,
      inspectionDate,
      sealNumber: data.sealNumber,
      standardsUsed: data.standardsUsed,
      gpsCoordinates: data.gpsCoordinates || data.gpsCoords || null,
      checklist: data.checklist || {},
      officerRemarks: data.officerRemarks || data.remarks || "",
      submittedAt: new Date().toISOString(),
    });

    await inspectionRepository.replaceMeasurements(updatedInspection.uuid, measurements);

    for (const documentId of evidenceDocumentIds(data)) {
      await documentRepository.assertUploader(documentId, user);
      await documentRepository.attachToInspection(documentId, updatedInspection.uuid);
      await inspectionRepository.addEvidence(updatedInspection.uuid, documentId);
    }

    if (inspection.applicationId) {
      const application = await applicationRepository.getById(inspection.applicationId);
      if (application) {
        await applicationRepository.update(application.id, {
          status: APPLICATION_STATUS.AWAITING_APPROVAL,
        });
        await applicationRepository.addStatusHistory({
          applicationUuid: application.uuid,
          fromStatus: application.status,
          toStatus: APPLICATION_STATUS.AWAITING_APPROVAL,
          actorUserId: actorUserId(user),
          reason: "LMO submitted verification findings.",
        });
      }
    }

    await auditRepository.create({
      district_id: inspection.district_id,
      actor_user_id: actorUserId(user),
      actor_role: user.role,
      action: "VERIFICATION_SUBMITTED",
      entity_type: "INSPECTION",
      entity_id: inspection.inspection_id || inspection.id,
      metadata: {
        applicationId: inspection.applicationId,
        sealNumber: data.sealNumber,
        measurementCount: measurements.length,
      },
    });

    await notificationRepository.create({
      district_id: inspection.district_id,
      targetRole: ROLES.ASSISTANT_CONTROLLER,
      title: "Verification Submitted",
      message: `Application ${inspection.applicationId} is ready for final review.`,
      category: "VERIFICATION_SUBMITTED",
      link: "/verify",
    });

    return inspectionRepository.getById(updatedInspection.id);
  },
};
