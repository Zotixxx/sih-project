import { applicationRepository } from "../repositories/applicationRepository.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { notificationRepository } from "../repositories/notificationRepository.js";
import { businessService } from "./businessService.js";
import { instrumentService } from "./instrumentService.js";
import { APPLICATION_STATUS } from "../constants/status.js";
import { ROLES } from "../constants/roles.js";
import { db } from "../data/db.js";

export const applicationService = {
  getApplications: async (user, filters = {}) => {
    let applications = await applicationRepository.getByDistrict(user.district_id);

    // If business user, filter to only their applications
    if (user.role === ROLES.BUSINESS) {
      const userBizId = user.business_id || user.id;
      applications = applications.filter(
        (a) =>
          a.businessId === userBizId ||
          a.business_id === userBizId ||
          a.email === user.email
      );
    }

    // Apply status filter if provided
    if (filters.status) {
      applications = applications.filter((a) => a.status === filters.status);
    }

    return applications;
  },

  getApplicationById: async (id, user) => {
    const application = await applicationRepository.getById(id);
    if (!application) {
      const err = new Error("Application not found.");
      err.statusCode = 404;
      throw err;
    }

    // Business ownership check
    if (user.role === ROLES.BUSINESS) {
      const userBizId = user.business_id || user.id;
      if (
        application.businessId !== userBizId &&
        application.business_id !== userBizId
      ) {
        const err = new Error("Forbidden: This application belongs to another business.");
        err.statusCode = 403;
        throw err;
      }
    } else if (
      user.role !== ROLES.SYSTEM_ADMIN &&
      user.district_id !== "ALL" &&
      application.district_id !== user.district_id
    ) {
      const err = new Error(
        `Forbidden: Application belongs to district '${application.district_id}', user belongs to '${user.district_id}'.`
      );
      err.statusCode = 403;
      throw err;
    }

    return application;
  },

  createApplication: async (user, input) => {
    if (user.role !== ROLES.BUSINESS && user.role !== ROLES.SYSTEM_ADMIN) {
      const err = new Error("Forbidden: Only businesses can submit verification applications.");
      err.statusCode = 403;
      throw err;
    }

    // 1. Verify business profile completeness (Section 5, 27, 46, 72)
    const profile = await businessService.getProfile(user);
    if (!profile.isComplete) {
      const err = new Error("Please complete your business details before applying for verification.");
      err.statusCode = 400;
      err.missingFields = profile.missingFields;
      throw err;
    }

    // 2. Verify instrument exists and belongs to this business (Section 27, 44)
    if (!input.instrumentId) {
      const err = new Error("Please select an instrument for verification.");
      err.statusCode = 400;
      throw err;
    }
    const instrument = await instrumentService.getInstrumentById(input.instrumentId, user);

    // 3. Verify purchase bill exists on the instrument (Section 8, 20, 27, 45, 74)
    if (!instrument.purchaseBill || !instrument.purchaseBill.fileName) {
      const err = new Error("Please add the purchase bill to this instrument before applying for verification.");
      err.statusCode = 400;
      throw err;
    }

    // 4. Validate verification type (Section 16, 27)
    const verificationType =
      input.verificationType === "First Time Verification" ||
      input.verificationType === "Re-verification"
        ? input.verificationType
        : "Re-verification";

    // 5. Validate verification location (Section 17, 18, 27)
    const location = input.verificationLocation || {};
    const locationAddress =
      location.address || input.location || instrument.location || profile.address;
    if (!locationAddress) {
      const err = new Error("Please provide the verification location address.");
      err.statusCode = 400;
      throw err;
    }

    const district = user.district_id || profile.district_id || "AJM";
    const appId = `APP-${district}-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // 6. Assemble documents: purchase bill from instrument + optional extras
    const docs = [
      {
        documentId: instrument.purchaseBill.documentId || `DOC-PB-${Math.floor(10000 + Math.random() * 90000)}`,
        name: instrument.purchaseBill.fileName,
        fileName: instrument.purchaseBill.fileName,
        size: instrument.purchaseBill.fileSize || "1.2 MB",
        type: instrument.purchaseBill.fileType || "PDF",
        uploadDate: instrument.purchaseBill.uploadedDate || new Date().toISOString().split("T")[0],
        source: "INSTRUMENT",
      },
      ...(input.additionalDocuments || []).map((d) => ({
        documentId: d.documentId || `DOC-ADD-${Math.floor(10000 + Math.random() * 90000)}`,
        name: d.name || d.fileName || "Supporting Document.pdf",
        fileName: d.name || d.fileName || "Supporting Document.pdf",
        size: d.size || "1.0 MB",
        type: d.type || "PDF",
        uploadDate: new Date().toISOString().split("T")[0],
        source: "APPLICATION",
      })),
    ];

    // 7. Create immutable historical snapshot (Section 30)
    const application = {
      id: appId,
      district_id: district,
      district: district === "JPR" ? "Jaipur" : "Ajmer",
      businessId: user.business_id || user.id,
      business_id: user.business_id || user.id,
      businessName: profile.businessName || profile.name || user.name,
      applicantName: profile.contactPerson || profile.ownerName || user.name,
      phone: profile.phone || user.phone || "+91 98290 11223",
      email: profile.email || user.email,
      instrumentId: instrument.id,
      instrumentName: instrument.name,
      instrumentType: instrument.type || instrument.category,
      serialNumber: instrument.serialNumber,
      manufacturer: instrument.manufacturer,
      model: instrument.model,
      capacity: instrument.capacity,
      verificationType,
      applicationType: verificationType,
      verificationLocation: {
        address: locationAddress,
        city: location.city || profile.city || (district === "JPR" ? "Jaipur" : "Ajmer"),
        district: location.district || (district === "JPR" ? "Jaipur" : "Ajmer"),
        state: location.state || profile.state || "Rajasthan",
        pincode: location.pincode || profile.pincode || "305001",
        notes: location.notes || "",
      },
      location: locationAddress,
      noteForLmo: input.noteForLmo || input.notes || "",
      notes: input.noteForLmo || input.notes || "",
      status: APPLICATION_STATUS.SUBMITTED,
      applicationDate: new Date().toISOString().split("T")[0],
      submissionDate: new Date().toISOString().split("T")[0],
      feePaid: "₹ 1,500.00",
      transactionId: `TXN-UPI-${district}-${Math.floor(100000 + Math.random() * 900000)}`,
      documents: docs,
      photographs: [
        { title: "Serial Plaque & Rating Plate", url: "/images/plaque_scale.jpg", uploadDate: new Date().toISOString().split("T")[0] },
        { title: "Front Platform / Dispenser Assembly", url: "/images/front_scale.jpg", uploadDate: new Date().toISOString().split("T")[0] },
      ],
      timeline: [
        {
          event: "Application Submitted",
          date: nowStr,
          actor: `${user.name} (Applicant)`,
          note: input.noteForLmo ? `Note for LMO: ${input.noteForLmo}` : "Submitted online with statutory purchase bill.",
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const saved = await applicationRepository.create(application);

    // 8. Create Audit Log
    await auditRepository.create({
      district_id: district,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: "APPLICATION_SUBMITTED",
      entity_type: "APPLICATION",
      entity_id: appId,
      remarks: `Verification application filed for ${instrument.name} (${instrument.serialNumber}).`,
    });

    // 9. Notify Business & Assistant Controller
    await notificationRepository.create({
      district_id: district,
      recipient_role: ROLES.BUSINESS,
      recipient_id: user.id,
      title: "Application Submitted Successfully",
      message: `Your verification filing ${appId} for ${instrument.name} has been received.`,
      category: "APPLICATION_SUBMITTED",
      unread: true,
    });

    await notificationRepository.create({
      district_id: district,
      recipient_role: ROLES.ASSISTANT_CONTROLLER,
      title: "Fresh Application Received",
      message: `New verification application ${appId} from ${application.businessName} is awaiting initial review.`,
      category: "ALLOCATION_REQUIRED",
      unread: true,
    });

    // Remove matching draft if any
    if (db.drafts) {
      const dIndex = db.drafts.findIndex(
        (d) => d.businessId === (user.business_id || user.id)
      );
      if (dIndex !== -1) {
        db.drafts.splice(dIndex, 1);
        db.persist();
      }
    }

    return saved;
  },

  // Draft Management (Section 36, 53, 71)
  saveDraft: async (user, draftData) => {
    const businessId = user.business_id || user.id;
    if (!db.drafts) db.drafts = [];

    const existingIndex = db.drafts.findIndex((d) => d.businessId === businessId);
    const draft = {
      id: existingIndex !== -1 ? db.drafts[existingIndex].id : `DRAFT-${Math.floor(1000 + Math.random() * 9000)}`,
      businessId,
      ...draftData,
      status: "DRAFT",
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      db.drafts[existingIndex] = draft;
    } else {
      db.drafts.push(draft);
    }
    db.persist();

    return draft;
  },

  getDraft: async (user) => {
    const businessId = user.business_id || user.id;
    if (!db.drafts) return null;
    return db.drafts.find((d) => d.businessId === businessId) || null;
  },

  deleteDraft: async (user) => {
    const businessId = user.business_id || user.id;
    if (!db.drafts) return true;
    db.drafts = db.drafts.filter((d) => d.businessId !== businessId);
    db.persist();
    return true;
  },

  acceptApplication: async (id, user) => {
    if (user.role !== ROLES.ASSISTANT_CONTROLLER && user.role !== ROLES.SYSTEM_ADMIN) {
      const err = new Error("Forbidden: Only an Assistant Controller can accept applications.");
      err.statusCode = 403;
      throw err;
    }

    const application = await applicationRepository.getById(id);
    if (!application) {
      const err = new Error("Application not found.");
      err.statusCode = 404;
      throw err;
    }

    // District check
    if (user.role !== ROLES.SYSTEM_ADMIN && application.district_id !== user.district_id) {
      const err = new Error("Forbidden: Cannot accept applications outside your assigned district.");
      err.statusCode = 403;
      throw err;
    }

    if (
      application.status !== APPLICATION_STATUS.SUBMITTED &&
      application.status !== APPLICATION_STATUS.UNDER_REVIEW
    ) {
      const err = new Error(
        `Invalid transition: Cannot accept application in '${application.status}' state.`
      );
      err.statusCode = 400;
      throw err;
    }

    const updatedTimeline = [
      ...(application.timeline || []),
      {
        event: "Application Formally Accepted",
        date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        actor: `${user.name} (${user.role})`,
        note: "Statutory documents verified. Application approved for LMO field assignment.",
      },
    ];

    const updated = await applicationRepository.update(id, {
      status: APPLICATION_STATUS.ACCEPTED,
      acceptedBy: user.id,
      acceptedByName: user.name,
      acceptedDate: new Date().toISOString(),
      timeline: updatedTimeline,
    });

    // Audit record
    await auditRepository.create({
      district_id: application.district_id,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: "APPLICATION_ACCEPTED",
      entity_type: "APPLICATION",
      entity_id: id,
      remarks: "Application scrutiny passed. Ready for LMO field assignment.",
    });

    return updated;
  },

  rejectApplication: async (id, reason, user) => {
    if (user.role !== ROLES.ASSISTANT_CONTROLLER && user.role !== ROLES.SYSTEM_ADMIN) {
      const err = new Error("Forbidden: Only an Assistant Controller can reject applications.");
      err.statusCode = 403;
      throw err;
    }

    if (!reason || !reason.trim()) {
      const err = new Error("Validation error: A formal rejection reason is mandatory.");
      err.statusCode = 400;
      throw err;
    }

    const application = await applicationRepository.getById(id);
    if (!application) {
      const err = new Error("Application not found.");
      err.statusCode = 404;
      throw err;
    }

    // District check
    if (user.role !== ROLES.SYSTEM_ADMIN && application.district_id !== user.district_id) {
      const err = new Error("Forbidden: Cannot reject applications outside your assigned district.");
      err.statusCode = 403;
      throw err;
    }

    const updatedTimeline = [
      ...(application.timeline || []),
      {
        event: "Application Rejected",
        date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        actor: `${user.name} (${user.role})`,
        note: `Rejected by District Authority: ${reason.trim()}`,
        reason: reason.trim(),
      },
    ];

    const updated = await applicationRepository.update(id, {
      status: APPLICATION_STATUS.REJECTED,
      rejectedBy: user.id,
      rejectedByName: user.name,
      rejectionReason: reason.trim(),
      rejectedDate: new Date().toISOString(),
      timeline: updatedTimeline,
    });

    // Audit record
    await auditRepository.create({
      district_id: application.district_id,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: "APPLICATION_REJECTED",
      entity_type: "APPLICATION",
      entity_id: id,
      remarks: `Statutory filing rejected. Reason: ${reason.trim()}`,
    });

    return updated;
  },
};
