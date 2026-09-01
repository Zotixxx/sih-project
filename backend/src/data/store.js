import { seedData } from "./seedData.js";
import crypto from "crypto";

class MetrixStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.district = JSON.parse(JSON.stringify(seedData.district));
    this.businesses = JSON.parse(JSON.stringify(seedData.businesses));
    this.instruments = JSON.parse(JSON.stringify(seedData.instruments));
    this.lmos = JSON.parse(JSON.stringify(seedData.lmos));
    this.applications = JSON.parse(JSON.stringify(seedData.applications));
    this.inspections = JSON.parse(JSON.stringify(seedData.inspections));
    this.certificates = JSON.parse(JSON.stringify(seedData.certificates));
    this.notifications = JSON.parse(JSON.stringify(seedData.notifications));
    this.auditLogs = JSON.parse(JSON.stringify(seedData.auditLogs));
  }

  // --- Audit Logger ---
  addAuditLog(actor, action, entity, entityId, metadata = {}) {
    const log = {
      id: `AUD-AJM-${Date.now().toString().slice(-4)}`,
      actor,
      action,
      entity,
      entityId,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.auditLogs.unshift(log);
    return log;
  }

  // --- Notifications ---
  addNotification(title, message, category, actionUrl, priority = "HIGH") {
    const notif = {
      id: `NOTIF-AJM-${Date.now().toString().slice(-4)}`,
      title,
      message,
      category,
      timestamp: new Date().toISOString(),
      unread: true,
      actionUrl,
      priority,
    };
    this.notifications.unshift(notif);
    return notif;
  }

  // --- Dashboard Statistics ---
  getDashboardStats() {
    const newApps = this.applications.filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW").length;
    const awaitingVerification = this.applications.filter((a) => a.status === "ACCEPTED" || a.status === "SCHEDULED").length;
    const awaitingFinalApproval = this.inspections.filter((i) => i.status === "SUBMITTED_FOR_APPROVAL").length;
    const completedVerifications = this.certificates.filter((c) => c.status === "VALID").length;
    const activeLmos = this.lmos.filter((l) => l.status === "ACTIVE" || l.status === "LAB_ACTIVE").length;
    const expiringCerts = this.certificates.filter((c) => c.status === "EXPIRING_SOON").length;

    return {
      district: this.district.name,
      controllerOfficer: this.district.controllerOfficer,
      stats: {
        newApplications: newApps,
        awaitingVerification,
        awaitingFinalApproval,
        completedVerifications,
        activeLmos,
        expiringCertificates: expiringCerts,
        totalApplications: this.applications.length,
        totalCertificates: this.certificates.length,
        districtComplianceRate: "98.4%",
      },
    };
  }

  // --- Applications ---
  getApplications(filters = {}) {
    let result = [...this.applications];

    if (filters.status && filters.status !== "ALL") {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters.instrumentType && filters.instrumentType !== "ALL") {
      result = result.filter((a) => a.instrumentType === filters.instrumentType);
    }
    if (filters.assignedLmo && filters.assignedLmo !== "ALL") {
      result = result.filter((a) => a.assignedLmoId === filters.assignedLmo);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.businessName.toLowerCase().includes(q) ||
          a.applicantName.toLowerCase().includes(q) ||
          a.serialNumber.toLowerCase().includes(q)
      );
    }

    return result;
  }

  getApplicationById(id) {
    return this.applications.find((a) => a.id === id);
  }

  acceptApplication(id, officerName = "Dr. R. K. Sharma (Assistant Controller)") {
    const app = this.getApplicationById(id);
    if (!app) throw new Error(`Application ${id} not found`);

    app.status = "ACCEPTED";
    app.timeline.push({
      event: "Application Accepted by District Admin",
      date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      actor: officerName,
      note: "Statutory documentation validated. Ready for LMO assignment.",
    });

    this.addAuditLog(officerName, "APPLICATION_ACCEPTED", "Application", id, {
      businessName: app.businessName,
      instrument: app.instrumentName,
    });

    this.addNotification(
      `Application ${id} has been accepted.`,
      `${app.businessName}'s application is verified and ready for LMO assignment.`,
      "APPLICATION_ACCEPTED",
      "/applications"
    );

    return app;
  }

  rejectApplication(id, rejectionReason, officerName = "Dr. R. K. Sharma (Assistant Controller)") {
    const app = this.getApplicationById(id);
    if (!app) throw new Error(`Application ${id} not found`);
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error("Rejection reason is mandatory.");
    }

    app.status = "REJECTED";
    app.rejectionReason = rejectionReason;
    app.timeline.push({
      event: "Application Rejected by District Admin",
      date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      actor: officerName,
      note: `Rejection Reason: ${rejectionReason}`,
    });

    // Update target instrument
    const inst = this.instruments.find((i) => i.id === app.instrumentId);
    if (inst) inst.status = "REJECTED";

    this.addAuditLog(officerName, "APPLICATION_REJECTED", "Application", id, {
      businessName: app.businessName,
      rejectionReason,
    });

    this.addNotification(
      `Application ${id} was rejected.`,
      `Rejection notice sent to ${app.businessName}: ${rejectionReason}`,
      "APPLICATION_REJECTED",
      "/applications",
      "HIGH"
    );

    return app;
  }

  // --- LMO Assignment ---
  assignLmo(applicationId, officerId, scheduledDate, scheduledTime, adminOfficer = "Dr. R. K. Sharma (Assistant Controller)") {
    const app = this.getApplicationById(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);

    const lmo = this.lmos.find((l) => l.officerId === officerId || l.id === officerId);
    if (!lmo) throw new Error(`LMO Officer ${officerId} not found`);

    app.status = "SCHEDULED";
    app.assignedLmoId = lmo.officerId;
    app.assignedLmoName = `${lmo.name} (${lmo.officerId})`;
    app.scheduledDate = scheduledDate;
    app.scheduledTime = scheduledTime;

    app.timeline.push({
      event: "LMO Assigned & Inspection Scheduled",
      date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      actor: adminOfficer,
      note: `Assigned to ${lmo.name} (${lmo.officerId}) for field inspection on ${scheduledDate} at ${scheduledTime}.`,
    });

    lmo.pendingInspections += 1;
    lmo.activeWorkload += 1;

    // Create or update inspection record
    const inspId = `INSP-AJM-2026-${String(this.inspections.length + 50).padStart(4, "0")}`;
    const newInspection = {
      id: inspId,
      applicationId: app.id,
      instrumentId: app.instrumentId,
      instrumentName: app.instrumentName,
      serialNumber: app.serialNumber,
      manufacturer: app.manufacturer,
      capacity: app.capacity,
      ownerName: app.businessName,
      officer: lmo.name,
      officerId: lmo.officerId,
      officerBadge: lmo.officerId,
      officerRole: lmo.designation,
      assignedDate: new Date().toISOString().split("T")[0],
      scheduledDate,
      scheduledTime,
      status: "SCHEDULED",
      location: app.address,
      checklistItems: [
        { id: "c1", label: "Physical Examination & Plaque Readability", passed: true },
        { id: "c2", label: "Zero-Load Repeatability & Return to Zero", passed: true },
        { id: "c3", label: "Corner / Eccentricity Load Testing", passed: true },
        { id: "c4", label: "Maximum Permissible Error (MPE) Verification", passed: false },
        { id: "c5", label: "Tamper-Proof Lead Wire Seal Affixed", passed: false },
      ],
      measurements: [],
      photographs: [],
      officerRemarks: "Inspection scheduled by Assistant Controller.",
    };

    this.inspections.unshift(newInspection);

    this.addAuditLog(adminOfficer, "LMO_ASSIGNED", "Verification Assignment", app.id, {
      assignedOfficer: `${lmo.name} (${lmo.officerId})`,
      scheduledDate,
      scheduledTime,
    });

    this.addNotification(
      `Inspection scheduled for Application ${app.id}`,
      `Assigned to ${lmo.name} for ${scheduledDate} at ${scheduledTime}.`,
      "INSPECTION_SCHEDULED",
      "/admin/awaiting-certificates"
    );

    return { application: app, inspection: newInspection };
  }

  // --- Awaiting Certificates ---
  getAwaitingCertificates() {
    return this.inspections.filter((i) => i.status === "SUBMITTED_FOR_APPROVAL");
  }

  getInspectionById(id) {
    return this.inspections.find((i) => i.id === id);
  }

  // --- Final Approval & Certificate Generation ---
  approveInspectionAndIssueCertificate(inspectionId, controllerRemarks = "", approvingOfficer = "Dr. R. K. Sharma (Assistant Controller)") {
    const inspection = this.getInspectionById(inspectionId);
    if (!inspection) throw new Error(`Inspection ${inspectionId} not found`);

    const app = this.getApplicationById(inspection.applicationId);
    const inst = this.instruments.find((i) => i.id === inspection.instrumentId);

    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const validUntil = nextYear.toISOString().split("T")[0];

    // Generate unique Certificate ID
    const certNum = String(this.certificates.length + 120).padStart(5, "0");
    const certId = `CERT-2026-${certNum}`;
    const officialNumber = `LM/RAJ/AJM/2026/${certNum}/STAT`;

    // SHA-256 Security Hash
    const hash = crypto
      .createHash("sha256")
      .update(certId + (inst?.serialNumber || "SN") + today + "AJMER_RAJASTHAN")
      .digest("hex");

    const newCertificate = {
      id: certId,
      certificateNumber: certId,
      officialNumber,
      instrumentId: inst?.id || inspection.instrumentId,
      instrumentName: inst?.name || inspection.instrumentName,
      instrumentType: inst?.type || "Regulated Weighing Instrument",
      serialNumber: inst?.serialNumber || inspection.serialNumber || "SN-2026-AJM",
      manufacturer: inst?.manufacturer || inspection.manufacturer || "Certified OEM",
      model: inst?.model || "Standard Model",
      capacity: inst?.capacity || inspection.capacity || "Standard Capacity",
      ownerName: inspection.ownerName || app?.businessName || "Registered Business",
      businessAddress: app?.address || inspection.location,
      verificationDate: today,
      validFrom: today,
      validUntil,
      verificationResult: "PASSED & STAMPED",
      status: "VALID",
      verifyingOfficer: `${inspection.officer} (${inspection.officerBadge || "LMO-AJM"})`,
      approvingOfficer,
      district: this.district.name,
      issuingAuthority: "Directorate of Legal Metrology, Government of Rajasthan",
      sealNumber: inspection.sealNumber || `SEAL-AJM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      securityHash: `0x${hash.substring(0, 40)}`,
      verificationToken: certId,
      verificationUrl: `http://localhost:3000/verify/${certId}`,
    };

    // Update inspection
    inspection.status = "APPROVED";
    inspection.certificateNumber = certId;
    inspection.controllerApprovedAt = new Date().toISOString();
    inspection.controllerRemarks = controllerRemarks || "All measurements verified within Schedule VII MPE limits. Certificate sanctioned.";

    // Update application
    if (app) {
      app.status = "CERTIFIED";
      app.certificateId = certId;
      app.timeline.push({
        event: "Final Verification Approved & Certificate Issued",
        date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        actor: approvingOfficer,
        note: `Certificate ${certId} officially sanctioned and cryptographically signed.`,
      });
    }

    // Update instrument
    if (inst) {
      inst.status = "CERTIFIED";
      inst.certificateId = certId;
      inst.validUntil = validUntil;
    }

    // Store certificate
    this.certificates.unshift(newCertificate);

    // Audit logs
    this.addAuditLog(approvingOfficer, "APPROVAL_GRANTED", "Inspection", inspection.id, {
      certificateId: certId,
      business: inspection.ownerName,
      instrument: inspection.instrumentName,
    });
    this.addAuditLog(approvingOfficer, "CERTIFICATE_GENERATED", "Certificate", certId, {
      officialNumber,
      validUntil,
    });

    // Notification
    this.addNotification(
      `Certificate ${certId} generated!`,
      `Verification approved for ${inspection.instrumentName} at ${inspection.ownerName}. Valid until ${validUntil}.`,
      "CERTIFICATE_GENERATED",
      "/certificates"
    );

    return newCertificate;
  }

  rejectInspectionApproval(inspectionId, rejectionReason, approvingOfficer = "Dr. R. K. Sharma (Assistant Controller)") {
    const inspection = this.getInspectionById(inspectionId);
    if (!inspection) throw new Error(`Inspection ${inspectionId} not found`);
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error("Rejection reason is mandatory.");
    }

    const app = this.getApplicationById(inspection.applicationId);
    const inst = this.instruments.find((i) => i.id === inspection.instrumentId);

    inspection.status = "REJECTED";
    inspection.rejectionReason = rejectionReason;
    inspection.rejectionDate = new Date().toISOString();

    if (app) {
      app.status = "REJECTED";
      app.rejectionReason = rejectionReason;
      app.timeline.push({
        event: "Inspection Rejected by Assistant Controller",
        date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        actor: approvingOfficer,
        note: `Returned for correction: ${rejectionReason}`,
      });
    }

    if (inst) inst.status = "REJECTED";

    this.addAuditLog(approvingOfficer, "APPROVAL_REJECTED", "Inspection", inspection.id, {
      rejectionReason,
      business: inspection.ownerName,
    });

    this.addNotification(
      `Inspection ${inspection.id} returned for correction.`,
      `Non-compliance note sent to ${inspection.ownerName}: ${rejectionReason}`,
      "APPROVAL_REJECTED",
      "/admin/awaiting-certificates",
      "HIGH"
    );

    return inspection;
  }

  // --- Certificates & Completed Verifications ---
  getCertificates(filters = {}) {
    let result = [...this.certificates];

    if (filters.status && filters.status !== "ALL") {
      result = result.filter((c) => c.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.certificateNumber.toLowerCase().includes(q) ||
          c.instrumentName.toLowerCase().includes(q) ||
          c.serialNumber.toLowerCase().includes(q) ||
          c.ownerName.toLowerCase().includes(q)
      );
    }

    return result;
  }

  getCertificateById(id) {
    return this.certificates.find((c) => c.id === id || c.certificateNumber === id || c.verificationToken === id);
  }

  getCompletedVerifications(filters = {}) {
    const approvedInspections = this.inspections.filter((i) => i.status === "APPROVED");
    let result = approvedInspections.map((insp) => {
      const cert = this.certificates.find((c) => c.id === insp.certificateNumber || c.instrumentId === insp.instrumentId);
      return {
        inspectionId: insp.id,
        applicationId: insp.applicationId,
        businessName: insp.ownerName,
        applicantName: insp.ownerName,
        instrumentName: insp.instrumentName,
        serialNumber: insp.serialNumber,
        inspectionDate: insp.inspectionDate || insp.scheduledDate,
        certificateId: cert?.id || insp.certificateNumber || "CERT-AVAILABLE",
        officer: insp.officer,
        approvingOfficer: cert?.approvingOfficer || "Dr. R. K. Sharma (Assistant Controller)",
        status: "COMPLETED",
        sealNumber: insp.sealNumber,
        result: insp.result,
      };
    });

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.businessName.toLowerCase().includes(q) ||
          r.certificateId.toLowerCase().includes(q) ||
          r.instrumentName.toLowerCase().includes(q) ||
          r.serialNumber.toLowerCase().includes(q) ||
          r.applicationId.toLowerCase().includes(q)
      );
    }

    return result;
  }

  // --- Reports Summary ---
  getReportsSummary() {
    return {
      district: this.district.name,
      totalApplications: this.applications.length,
      acceptedApplications: this.applications.filter((a) => a.status === "ACCEPTED" || a.status === "SCHEDULED" || a.status === "CERTIFIED").length,
      rejectedApplications: this.applications.filter((a) => a.status === "REJECTED").length,
      pendingInspections: this.inspections.filter((i) => i.status === "SCHEDULED" || i.status === "SUBMITTED_FOR_APPROVAL").length,
      completedInspections: this.inspections.filter((i) => i.status === "APPROVED").length,
      certificatesIssued: this.certificates.filter((c) => c.status === "VALID").length,
      expiredCertificates: this.certificates.filter((c) => c.status === "EXPIRED" || c.status === "EXPIRING_SOON").length,
      categoryDistribution: [
        { name: "Heavy Weighbridges", count: 4, share: "40%" },
        { name: "Fuel Dispensers", count: 2, share: "20%" },
        { name: "Electronic Counter Scales", count: 2, share: "20%" },
        { name: "Precision Balances", count: 1, share: "10%" },
        { name: "Platform Scales", count: 1, share: "10%" },
      ],
      monthlyTrends: [
        { month: "Apr", applications: 12, certificates: 10 },
        { month: "May", applications: 18, certificates: 16 },
        { month: "Jun", applications: 22, certificates: 20 },
        { month: "Jul", applications: 28, certificates: 25 },
        { month: "Aug", applications: 34, certificates: 31 },
      ],
    };
  }
}

export const db = new MetrixStore();
