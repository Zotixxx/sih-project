import { applicationRepository } from "../repositories/applicationRepository.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { businessRepository } from "../repositories/businessRepository.js";
import { documentRepository } from "../repositories/documentRepository.js";
import { districtRepository } from "../repositories/districtRepository.js";
import { instrumentRepository } from "../repositories/instrumentRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { businessService } from "./businessService.js";
import { APPLICATION_STATUS } from "../constants/status.js";
import { ROLES } from "../constants/roles.js";
import { assertDomainId, generateDomainId } from "../utils/id.js";
import { badRequest, forbidden, notFound, unprocessable } from "../utils/errors.js";

const actorUserId = (user) => user.auth_user_id || user.user_id || user.id;

const requireBusinessRecord = async (user) => {
  const business = await businessRepository.getByUserId(actorUserId(user));
  if (!business) {
    throw unprocessable("Create the business role record in Supabase before using the business workflow.");
  }
  return business;
};

const normalizeApplicationId = (input, districtId) => {
  const requested = input.applicationId || input.application_id || input.id;
  return requested ? assertDomainId(requested, "Application ID") : generateDomainId("APP", districtId);
};

const normalizeVerificationLocation = async (input) => {
  const raw = input.verificationLocation || {};
  const requestedDistrictId = raw.districtId || raw.district_id || input.district_id;
  const location = {
    address: raw.address || input.location || "",
    city: raw.city || "",
    district: raw.district || "",
    districtId: requestedDistrictId || "",
    state: raw.state || "",
    pincode: raw.pincode || raw.pin || "",
    notes: raw.notes || input.noteForLmo || input.notes || "",
  };

  const missing = ["address", "city", "districtId", "state", "pincode"].filter((key) => !location[key]);
  if (missing.length) {
    throw badRequest(`Verification location is incomplete. Missing: ${missing.join(", ")}.`);
  }

  const districtId = assertDomainId(location.districtId, "Verification district");
  const district = await districtRepository.getById(districtId);
  if (!district) {
    throw badRequest(`Verification district '${districtId}' is not configured.`);
  }
  if (location.state && district.state && location.state !== district.state) {
    throw badRequest(`Verification district '${district.name}' belongs to '${district.state}', not '${location.state}'.`);
  }

  return {
    district,
    location: {
      ...location,
      district: district.name,
      districtId: district.id,
      state: district.state || location.state,
    },
  };
};

const validateVerificationType = (value) => {
  const allowed = new Set(["First Time Verification", "Re-verification"]);
  if (!allowed.has(value)) {
    throw badRequest("Verification type must be either 'First Time Verification' or 'Re-verification'.");
  }
  return value;
};

const assertApplicationAccess = (application, user) => {
  if (!application) throw notFound("Application not found.");

  if (user.role === ROLES.SYSTEM_ADMIN) return;

  if (user.role === ROLES.BUSINESS) {
    if (application.businessUuid !== user.business_uuid && application.businessUserId !== actorUserId(user)) {
      throw forbidden("This application belongs to another business.");
    }
    return;
  }

  if (user.role === ROLES.LMO) {
    if (application.assignedLmoUuid !== user.lmo_uuid) {
      throw forbidden("This application is not assigned to this LMO.");
    }
    return;
  }

  if (user.role === ROLES.ASSISTANT_CONTROLLER) {
    if (application.district_id !== user.district_id) {
      throw forbidden("Application belongs to another district.");
    }
    return;
  }

  throw forbidden("Role is not authorized for this application.");
};

const requireScopedOfficer = (user, roleName) => {
  if (!user.district_id) {
    throw forbidden(`${roleName} district scope is not configured.`);
  }
};

const statusHistory = async ({ application, toStatus, user, reason }) => {
  await applicationRepository.addStatusHistory({
    applicationUuid: application.uuid,
    fromStatus: application.status,
    toStatus,
    actorUserId: actorUserId(user),
    reason,
  });
};

const audit = async ({ application, user, action, entityType = "APPLICATION", entityId, metadata }) => {
  await auditRepository.create({
    district_id: application.district_id,
    actor_user_id: actorUserId(user),
    actor_role: user.role,
    action,
    entity_type: entityType,
    entity_id: entityId || application.applicationId || application.id,
    metadata,
  });
};

export const applicationService = {
  getApplications: async (user, filters = {}) => {
    let applications;

    if (user.role === ROLES.BUSINESS) {
      const business = await requireBusinessRecord(user);
      applications = await applicationRepository.getByBusiness(business.uuid);
    } else if (user.role === ROLES.LMO) {
      requireScopedOfficer(user, "LMO");
      if (!user.lmo_uuid) throw forbidden("LMO role record is not configured.");
      applications = (await applicationRepository.getByDistrict(user.district_id)).filter(
        (application) => application.assignedLmoUuid === user.lmo_uuid
      );
    } else if (user.role === ROLES.ASSISTANT_CONTROLLER) {
      requireScopedOfficer(user, "Assistant Controller");
      applications = await applicationRepository.getByDistrict(user.district_id);
    } else if (user.role === ROLES.SYSTEM_ADMIN) {
      applications = await applicationRepository.getByDistrict(user.district_id || "ALL");
    } else {
      throw forbidden("Role is not authorized to list applications.");
    }

    if (filters.status) {
      applications = applications.filter((application) => application.status === filters.status);
    }

    return applications;
  },

  getApplicationById: async (id, user) => {
    const application = await applicationRepository.getById(id);
    assertApplicationAccess(application, user);
    return application;
  },

  createApplication: async (user, input) => {
    if (user.role !== ROLES.BUSINESS) {
      throw forbidden("Only business users can submit verification applications.");
    }

    const business = await requireBusinessRecord(user);
    const profile = await businessService.getProfile(user);
    if (!profile.isComplete) {
      const err = badRequest("Please complete your business details before applying for verification.");
      err.missingFields = profile.missingFields;
      throw err;
    }

    if (!input.instrumentId && !input.instrument_id) {
      throw badRequest("Please select an instrument for verification.");
    }

    const instrument = await instrumentRepository.getById(input.instrumentId || input.instrument_id);
    if (!instrument) throw notFound("Instrument not found.");
    if (instrument.businessUuid !== business.uuid) {
      throw forbidden("This instrument belongs to another business.");
    }

    if (!instrument.purchaseBill?.documentId) {
      throw unprocessable("Attach a purchase bill to the instrument before submitting an application.");
    }

    const verificationType = validateVerificationType(input.verificationType || input.verification_type);
    const { location: verificationLocation, district: verificationDistrict } = await normalizeVerificationLocation(input);
    const applicationId = normalizeApplicationId(input, verificationDistrict.id);
    const additionalDocuments = input.additionalDocuments || input.additionalDocumentIds || [];
    const additionalDocumentIds = additionalDocuments
      .map((document) => (typeof document === "string" ? document : document.documentId || document.id))
      .filter(Boolean);

    for (const documentId of additionalDocumentIds) {
      await documentRepository.assertUploader(documentId, user);
    }

    const created = await applicationRepository.create({
      applicationId,
      businessUuid: business.uuid,
      instrumentUuid: instrument.uuid,
      district_id: verificationDistrict.id,
      verificationType,
      verificationLocation,
      businessSnapshot: {
        businessId: business.businessId,
        name: business.businessName || business.name,
        contactPerson: business.contactPerson,
        phone: business.phone,
        email: business.email,
        address: business.address,
        city: business.city,
        district: business.district_id,
        state: business.state,
        pincode: business.pincode,
        gstin: business.gstin,
        pan: business.pan,
        registrationNumber: business.registrationNumber,
        natureOfBusiness: business.natureOfBusiness,
      },
      instrumentSnapshot: {
        instrumentId: instrument.instrumentId || instrument.id,
        name: instrument.name,
        type: instrument.type || instrument.category,
        manufacturer: instrument.manufacturer,
        model: instrument.model,
        serialNumber: instrument.serialNumber,
        capacity: instrument.capacity,
        accuracyClass: instrument.accuracyClass,
        purchaseDate: instrument.purchaseDate,
      },
      applicantName: business.contactPerson || business.name || user.name,
      notes: input.noteForLmo || input.notes || "",
      status: APPLICATION_STATUS.SUBMITTED,
    });

    const documentIds = [instrument.purchaseBill.documentId, ...additionalDocumentIds];
    for (const documentId of documentIds) {
      await documentRepository.attachToApplication(documentId, created.uuid);
      await applicationRepository.attachDocument({ applicationUuid: created.uuid, documentId });
    }

    await applicationRepository.addStatusHistory({
      applicationUuid: created.uuid,
      fromStatus: null,
      toStatus: APPLICATION_STATUS.SUBMITTED,
      actorUserId: actorUserId(user),
      reason: "Application submitted by business.",
    });

    await audit({
      application: created,
      user,
      action: "APPLICATION_SUBMITTED",
      metadata: {
        instrumentId: instrument.instrumentId || instrument.id,
        verificationType,
      },
    });

    await notificationRepository.create({
      district_id: created.district_id,
      recipient_user_id: actorUserId(user),
      related_application_uuid: created.uuid,
      title: "Application Submitted",
      message: `Application ${created.applicationId} has been submitted.`,
      category: "APPLICATION_SUBMITTED",
      link: `/${actorUserId(user)}/applications/${created.applicationId}`,
    });

    await notificationRepository.create({
      district_id: created.district_id,
      targetRole: ROLES.ASSISTANT_CONTROLLER,
      related_application_uuid: created.uuid,
      title: "Fresh Application Received",
      message: `Application ${created.applicationId} is awaiting initial review.`,
      category: "ALLOCATION_REQUIRED",
      link: "/fresh-applications",
    });

    await applicationRepository.deleteDraft(business.uuid);
    return created;
  },

  saveDraft: async (user, draftData) => {
    if (user.role !== ROLES.BUSINESS) {
      throw forbidden("Only business users can save application drafts.");
    }
    const business = await requireBusinessRecord(user);
    return applicationRepository.saveDraft({
      businessUuid: business.uuid,
      userId: actorUserId(user),
      draftData,
    });
  },

  getDraft: async (user) => {
    if (user.role !== ROLES.BUSINESS) return null;
    const business = await requireBusinessRecord(user);
    return applicationRepository.getDraft(business.uuid);
  },

  deleteDraft: async (user) => {
    if (user.role !== ROLES.BUSINESS) {
      throw forbidden("Only business users can delete application drafts.");
    }
    const business = await requireBusinessRecord(user);
    return applicationRepository.deleteDraft(business.uuid);
  },

  acceptApplication: async (id, user) => {
    if (user.role !== ROLES.ASSISTANT_CONTROLLER && user.role !== ROLES.SYSTEM_ADMIN) {
      throw forbidden("Only an Assistant Controller can accept applications.");
    }

    const application = await applicationRepository.getById(id);
    assertApplicationAccess(application, user);

    if (![APPLICATION_STATUS.SUBMITTED, APPLICATION_STATUS.UNDER_REVIEW].includes(application.status)) {
      throw badRequest(`Invalid transition: Cannot accept application in '${application.status}' state.`);
    }

    const updated = await applicationRepository.update(id, {
      status: APPLICATION_STATUS.ACCEPTED,
      acceptedAt: new Date().toISOString(),
    });

    await statusHistory({ application, toStatus: APPLICATION_STATUS.ACCEPTED, user });
    await audit({
      application,
      user,
      action: "APPLICATION_ACCEPTED",
      metadata: { previousStatus: application.status },
    });

    if (application.businessUserId) {
      await notificationRepository.create({
        district_id: application.district_id,
        recipient_user_id: application.businessUserId,
        related_application_uuid: application.uuid,
        title: "Application Accepted",
        message: `Application ${application.applicationId} has been accepted for field assignment.`,
        category: "APPLICATION_ACCEPTED",
        link: `/${application.businessUserId}/applications/${application.applicationId}`,
      });
    }

    return updated;
  },

  rejectApplication: async (id, reason, user) => {
    if (user.role !== ROLES.ASSISTANT_CONTROLLER && user.role !== ROLES.SYSTEM_ADMIN) {
      throw forbidden("Only an Assistant Controller can reject applications.");
    }

    if (!reason || !reason.trim()) {
      throw badRequest("A formal rejection reason is mandatory.");
    }

    const application = await applicationRepository.getById(id);
    assertApplicationAccess(application, user);

    if (
      ![
        APPLICATION_STATUS.SUBMITTED,
        APPLICATION_STATUS.UNDER_REVIEW,
        APPLICATION_STATUS.ACCEPTED,
      ].includes(application.status)
    ) {
      throw badRequest(`Invalid transition: Cannot reject application in '${application.status}' state.`);
    }

    const updated = await applicationRepository.update(id, {
      status: APPLICATION_STATUS.REJECTED,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason.trim(),
    });

    await statusHistory({ application, toStatus: APPLICATION_STATUS.REJECTED, user, reason: reason.trim() });
    await audit({
      application,
      user,
      action: "APPLICATION_REJECTED",
      metadata: { reason: reason.trim(), previousStatus: application.status },
    });

    if (application.businessUserId) {
      await notificationRepository.create({
        district_id: application.district_id,
        recipient_user_id: application.businessUserId,
        related_application_uuid: application.uuid,
        title: "Application Rejected",
        message: `Application ${application.applicationId} was rejected. Reason: ${reason.trim()}`,
        category: "APPLICATION_REJECTED",
        link: `/${application.businessUserId}/applications/${application.applicationId}`,
      });
    }

    return updated;
  },
};
