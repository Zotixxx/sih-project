import { certificateService } from "../services/certificateService.js";

export const certificateController = {
  getCertificates: async (req, res) => {
    try {
      const certificates = await certificateService.getCertificates(req.user);
      return res.json({ success: true, data: certificates });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: "CERT_FETCH_ERROR", message: error.message },
      });
    }
  },

  getCertificateById: async (req, res) => {
    try {
      const certificate = await certificateService.getCertificateById(req.params.id, req.user);
      return res.json({ success: true, data: certificate });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: error.statusCode === 403 ? "FORBIDDEN" : "NOT_FOUND", message: error.message },
      });
    }
  },

  search: async (req, res) => {
    try {
      const query = req.query.q || req.query.query || "";
      const results = await certificateService.searchCertificates(query, req.user);
      return res.json({ success: true, data: results });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: { code: "SEARCH_ERROR", message: error.message },
      });
    }
  },

  getPublicVerification: async (req, res) => {
    try {
      // Public route passes null user to bypass district authorization check
      const certificate = await certificateService.getCertificateById(req.params.id, null);
      return res.json({
        success: true,
        data: {
          id: certificate.id,
          certificateNumber: certificate.certificateNumber,
          officialNumber: certificate.officialNumber,
          businessName: certificate.businessName,
          ownerName: certificate.ownerName,
          applicantName: certificate.applicantName,
          instrumentName: certificate.instrumentName,
          instrumentType: certificate.instrumentType,
          serialNumber: certificate.serialNumber,
          capacity: certificate.capacity,
          accuracyClass: certificate.accuracyClass,
          location: certificate.location,
          verificationDate: certificate.verificationDate,
          validFrom: certificate.validFrom,
          validUntil: certificate.validUntil,
          verifyingOfficer: certificate.verifyingOfficer,
          approvingOfficer: certificate.approvingOfficer,
          issuingAuthority: certificate.issuingAuthority,
          sealNumber: certificate.sealNumber,
          securityHash: certificate.securityHash,
          status: certificate.status,
          verificationResult: "VERIFIED",
        },
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Certificate not found in authoritative state registry." },
      });
    }
  },
};
