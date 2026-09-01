import { applicationRepository } from "../repositories/applicationRepository.js";
import { certificateRepository } from "../repositories/certificateRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { districtRepository } from "../repositories/districtRepository.js";
import { APPLICATION_STATUS, CERTIFICATE_STATUS } from "../constants/status.js";

export const dashboardService = {
  getStats: async (user) => {
    const districtId = user.district_id;
    const district = await districtRepository.getById(districtId);

    const applications = await applicationRepository.getByDistrict(districtId);
    const certificates = await certificateRepository.getByDistrict(districtId);
    const lmos = await userRepository.getLmosByDistrict(districtId);

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
        state: district?.state || "Rajasthan",
        controllerOffice: district?.controllerOffice || `Office of the Assistant Controller, ${districtId}`,
        activeComplianceRate: district?.activeComplianceRate || "98.5%",
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
