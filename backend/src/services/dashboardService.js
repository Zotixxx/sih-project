import { applicationRepository } from "../repositories/applicationRepository.js";
import { certificateRepository } from "../repositories/certificateRepository.js";
import { inspectionRepository } from "../repositories/inspectionRepository.js";
import { instrumentRepository } from "../repositories/instrumentRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { districtRepository } from "../repositories/districtRepository.js";
import { APPLICATION_STATUS, CERTIFICATE_STATUS } from "../constants/status.js";
import { ROLES } from "../constants/roles.js";
import { forbidden } from "../utils/errors.js";

export const dashboardService = {
  getStats: async (user) => {
    const districtId = user.district_id;
    const district = await districtRepository.getById(districtId);

    if (user.role === ROLES.BUSINESS) {
      const [applications, certificates, instruments] = await Promise.all([
        applicationRepository.getByBusiness(user.business_uuid),
        certificateRepository.getByBusiness(user.business_uuid),
        instrumentRepository.getByBusiness(user.business_uuid),
      ]);
      return {
        district: {
          id: district?.id || districtId,
          name: district?.name || districtId,
          state: district?.state || null,
          controllerOffice: district?.controllerOffice,
          activeComplianceRate: null,
        },
        officer: {
          id: user.id,
          name: user.name,
          role: user.role,
          district_id: user.district_id,
        },
        counts: {
          totalApplications: applications.length,
          activeApplications: applications.filter((a) => a.status !== APPLICATION_STATUS.CERTIFIED && a.status !== APPLICATION_STATUS.REJECTED).length,
          instruments: instruments.length,
          certificates: certificates.length,
        },
      };
    }

    if (user.role === ROLES.LMO) {
      if (!user.lmo_uuid) throw forbidden("LMO role record is not configured.");
      const inspections = await inspectionRepository.getByLmoId(user.lmo_uuid);
      return {
        district: {
          id: district?.id || districtId,
          name: district?.name || districtId,
          state: district?.state || null,
          controllerOffice: district?.controllerOffice,
          activeComplianceRate: null,
        },
        officer: {
          id: user.id,
          name: user.name,
          role: user.role,
          district_id: user.district_id,
        },
        counts: {
          assignedInspections: inspections.filter((i) => i.status === "ASSIGNED").length,
          inProgressInspections: inspections.filter((i) => i.status === "IN_PROGRESS").length,
          submittedInspections: inspections.filter((i) => i.status === "SUBMITTED").length,
          completedInspections: inspections.filter((i) => i.status === "APPROVED").length,
        },
      };
    }

    if (user.role === ROLES.ASSISTANT_CONTROLLER && !districtId) {
      throw forbidden("Assistant Controller district scope is not configured.");
    }

    const scopedDistrictId = user.role === ROLES.SYSTEM_ADMIN ? districtId || "ALL" : districtId;
    const applications = await applicationRepository.getByDistrict(scopedDistrictId);
    const certificates = await certificateRepository.getByDistrict(scopedDistrictId);
    const lmos = await userRepository.getLmosByDistrict(scopedDistrictId);

    const newApplications = applications.filter(
      (a) => a.status === APPLICATION_STATUS.SUBMITTED || a.status === APPLICATION_STATUS.UNDER_REVIEW
    ).length;

    const acceptedApplications = applications.filter(
      (a) => a.status === APPLICATION_STATUS.ACCEPTED
    ).length;

    const scheduledVerifications = applications.filter(
      (a) => a.status === APPLICATION_STATUS.SCHEDULED || a.status === APPLICATION_STATUS.UNDER_VERIFICATION
    ).length;

    const awaitingFinalApproval = applications.filter(
      (a) => a.status === APPLICATION_STATUS.AWAITING_APPROVAL
    ).length;

    const completedVerifications = certificates.filter(
      (c) => c.status === CERTIFICATE_STATUS.VALID
    ).length;

    const activeLmos = lmos.length;

    // Check expiring certificates (valid certificates expiring within 30 days)
    const now = new Date();
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringCertificates = certificates.filter((c) => {
      if (c.status !== CERTIFICATE_STATUS.VALID || !c.validUntil) return false;
      const expiry = new Date(c.validUntil);
      return expiry >= now && expiry <= thirtyDaysAhead;
    }).length;

    return {
      district: {
        id: district?.id || districtId,
        name: district?.name || "District",
        state: district?.state || null,
        controllerOffice: district?.controllerOffice || (districtId ? `Office of the Assistant Controller, ${districtId}` : null),
        activeComplianceRate: null,
      },
      officer: {
        id: user.id,
        name: user.name,
        role: user.role,
        district_id: user.district_id,
      },
      counts: {
        newApplications,
        acceptedApplications,
        scheduledVerifications,
        awaitingFinalApproval,
        completedVerifications,
        activeLmos,
        expiringCertificates,
      },
    };
  },
};
