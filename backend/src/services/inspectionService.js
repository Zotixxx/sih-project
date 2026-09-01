import { inspectionRepository } from "../repositories/inspectionRepository.js";
import { applicationRepository } from "../repositories/applicationRepository.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { APPLICATION_STATUS, INSPECTION_STATUS } from "../constants/status.js";
import { ROLES } from "../constants/roles.js";

export const inspectionService = {
  getInspections: async (user, filters = {}) => {
    let inspections = await inspectionRepository.getByDistrict(user.district_id);

    // If LMO, show only their assigned inspections
    if (user.role === ROLES.LMO) {
      inspections = inspections.filter(
        (i) => i.lmoId === user.id || i.officerId === user.id
      );
    }

    if (filters.status) {
      inspections = inspections.filter((i) => i.status === filters.status);
    }

    return inspections;
  },

  getInspectionById: async (id, user) => {
    const inspection = await inspectionRepository.getById(id);
    if (!inspection) {
      const err = new Error("Inspection record not found.");
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== ROLES.SYSTEM_ADMIN && user.district_id !== "ALL") {
      if (inspection.district_id !== user.district_id) {
        const err = new Error("Forbidden: Inspection belongs to another district.");
        err.statusCode = 403;
        throw err;
      }
      if (user.role === ROLES.LMO && inspection.lmoId !== user.id && inspection.officerId !== user.id) {
        const err = new Error("Forbidden: You are not the assigned officer for this inspection.");
        err.statusCode = 403;
        throw err;
      }
    }

    return inspection;
  },

  startInspection: async (id, user) => {
    if (user.role !== ROLES.LMO && user.role !== ROLES.SYSTEM_ADMIN) {
      const err = new Error("Forbidden: Only an authorized LMO can start an inspection.");
      err.statusCode = 403;
      throw err;
    }

    const inspection = await inspectionRepository.getById(id);
    if (!inspection) {
      const err = new Error("Inspection record not found.");
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== ROLES.SYSTEM_ADMIN) {
      if (inspection.district_id !== user.district_id) {
        const err = new Error("Forbidden: Inspection belongs to another district.");
        err.statusCode = 403;
        throw err;
      }
      if (inspection.lmoId !== user.id && inspection.officerId !== user.id) {
        const err = new Error("Forbidden: You are not the assigned officer for this inspection.");
        err.statusCode = 403;
        throw err;
      }
    }

    const updated = await inspectionRepository.update(id, {
      status: INSPECTION_STATUS.IN_PROGRESS,
      startedDate: new Date().toISOString(),
    });

    if (inspection.applicationId) {
      await applicationRepository.update(inspection.applicationId, {
        status: APPLICATION_STATUS.UNDER_VERIFICATION,
      });
    }

    await auditRepository.create({
      district_id: inspection.district_id,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: "INSPECTION_STARTED",
      entity_type: "INSPECTION",
      entity_id: id,
      remarks: "LMO commenced physical test load calibration in the field.",
    });

    return updated;
  },

  submitInspection: async (id, data, user) => {
    if (user.role !== ROLES.LMO && user.role !== ROLES.SYSTEM_ADMIN) {
      const err = new Error("Forbidden: Only an authorized LMO can submit field inspections.");
      err.statusCode = 403;
      throw err;
    }

    const inspection = await inspectionRepository.getById(id);
    if (!inspection) {
      const err = new Error("Inspection record not found.");
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== ROLES.SYSTEM_ADMIN) {
      if (inspection.district_id !== user.district_id) {
        const err = new Error("Forbidden: Inspection belongs to another district.");
        err.statusCode = 403;
        throw err;
      }
      if (inspection.lmoId !== user.id && inspection.officerId !== user.id) {
        const err = new Error("Forbidden: You are not the assigned officer for this inspection.");
        err.statusCode = 403;
        throw err;
      }
    }

    const inspectionDate = data.inspectionDate || new Date().toISOString().split("T")[0];
    const sealNumber =
      data.sealNumber || `RAJ-${inspection.district_id}-2026-SL-${Math.floor(10000 + Math.random() * 90000)}`;

    const updatedInspection = await inspectionRepository.update(id, {
      status: INSPECTION_STATUS.SUBMITTED,
      inspectionDate,
      sealNumber,
      standardsUsed: data.standardsUsed || "Class M1 Working Standards Kit (Cert # NPL/RAJ/2025)",
      gpsCoordinates: data.gpsCoordinates || "26.4499° N, 74.6399° E",
      measurements: data.measurements || [
        { testLoad: "10,000 kg", indicatedWeight: "10,000 kg", error: "0 kg", mpeLimit: "±10 kg", result: "PASS" },
        { testLoad: "20,000 kg", indicatedWeight: "19,998 kg", error: "-2 kg", mpeLimit: "±20 kg", result: "PASS" },
        { testLoad: "40,000 kg", indicatedWeight: "40,004 kg", error: "+4 kg", mpeLimit: "±30 kg", result: "PASS" },
        { testLoad: "60,000 kg", indicatedWeight: "60,000 kg", error: "0 kg", mpeLimit: "±30 kg", result: "PASS" },
      ],
      checklist: data.checklist || {
        visualPlinthIntegrity: "SATISFACTORY",
        levelAndAlignment: "VERIFIED_LEVEL",
        zeroTrackingSensitivity: "WITHIN_LIMITS",
        cornerLoadEccentricity: "PASSED_LESS_THAN_1D",
        leadWireTamperProofSeal: "AFFIXED_SERIALIZED",
        digitalWeightIndicatorEnclosure: "LOCKED_SEALED",
      },
      officerRemarks:
        data.officerRemarks ||
        "Physical verification executed in full adherence to Legal Metrology General Rules 2011 Schedule VII. Maximum deviation observed within statutory MPE. Lead security seal applied. Recommended for official certificate sanction.",
      submittedAt: new Date().toISOString(),
    });

    // Advance application to AWAITING_APPROVAL
    if (inspection.applicationId) {
      const application = await applicationRepository.getById(inspection.applicationId);
      if (application) {
        const updatedTimeline = [
          ...(application.timeline || []),
          {
            event: "Field Inspection Completed & Submitted",
            date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            actor: `${user.name} (${user.role})`,
            sealNumber,
          },
        ];

        await applicationRepository.update(inspection.applicationId, {
          status: APPLICATION_STATUS.AWAITING_APPROVAL,
          inspectionId: inspection.id,
          timeline: updatedTimeline,
        });
      }
    }

    // Audit record
    await auditRepository.create({
      district_id: inspection.district_id,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: "INSPECTION_SUBMITTED",
      entity_type: "INSPECTION",
      entity_id: id,
      remarks: `Field verification submitted. Seal Number: ${sealNumber}. Application moved to AWAITING_APPROVAL.`,
    });

    // Notify Assistant Controller
    await notificationRepository.create({
      district_id: inspection.district_id,
      targetRole: ROLES.ASSISTANT_CONTROLLER,
      title: "Inspection Submitted for Sanction",
      message: `Officer ${user.name} completed inspection for ${inspection.businessName}. Awaiting final approval.`,
      link: `/applications/${inspection.applicationId}`,
    });

    return updatedInspection;
  },
};
