import { instrumentRepository } from "../repositories/instrumentRepository.js";
import { ROLES } from "../constants/roles.js";

export const instrumentService = {
  getInstruments: async (user) => {
    if (user.role === ROLES.BUSINESS) {
      const businessId = user.business_id || user.id;
      const instruments = await instrumentRepository.getByBusiness(businessId);
      return instruments.filter((instrument) => instrument.visibleToBusiness !== false);
    }
    return await instrumentRepository.getByDistrict(user.district_id);
  },

  getInstrumentById: async (id, user) => {
    const instrument = await instrumentRepository.getById(id);
    if (!instrument) {
      const err = new Error("Instrument not found.");
      err.statusCode = 404;
      throw err;
    }

    if (user.role === ROLES.BUSINESS) {
      const userBizId = user.business_id || user.id;
      if (
        instrument.businessId !== userBizId &&
        instrument.business_id !== userBizId
      ) {
        const err = new Error("Forbidden: This instrument belongs to another business.");
        err.statusCode = 403;
        throw err;
      }
    } else if (
      user.role !== ROLES.SYSTEM_ADMIN &&
      user.district_id !== "ALL" &&
      instrument.district_id !== user.district_id
    ) {
      const err = new Error("Forbidden: Instrument outside your assigned district.");
      err.statusCode = 403;
      throw err;
    }

    return instrument;
  },

  createInstrument: async (user, data) => {
    if (user.role !== ROLES.BUSINESS && user.role !== ROLES.SYSTEM_ADMIN) {
      const err = new Error("Forbidden: Only businesses can register instruments.");
      err.statusCode = 403;
      throw err;
    }

    if (!data.name || !data.serialNumber || !data.capacity) {
      const err = new Error("Missing required instrument information (name, serial number, capacity).");
      err.statusCode = 400;
      throw err;
    }

    // Purchase bill validation (Section 8 & 45)
    if (!data.purchaseBill || !data.purchaseBill.fileName) {
      const err = new Error(
        "Please add the purchase bill to this instrument before applying for verification."
      );
      err.statusCode = 400;
      throw err;
    }

    const district = user.district_id || "AJM";
    const newId = `INS-${district}-${Math.floor(1000 + Math.random() * 9000)}`;

    const instrument = {
      id: newId,
      district_id: district,
      businessId: user.business_id || user.id,
      businessName: user.name || user.businessName || "Registered Business",
      name: data.name,
      type: data.type || data.category || "Non-Automatic Weighing Instrument (NAWI)",
      category: data.category || "General Commercial Scale",
      manufacturer: data.manufacturer || "Certified Manufacturer",
      model: data.model || "Standard Model",
      serialNumber: data.serialNumber,
      capacity: data.capacity,
      readability: data.readability || data.verificationInterval || "Standard",
      accuracyClass: data.accuracyClass || "Class III (Medium)",
      location: data.location || "Business Premises",
      installationLocation: data.location || "Business Premises",
      purchaseDate: data.purchaseDate || new Date().toISOString().split("T")[0],
      purpose: data.purpose || "Commercial Trade & Packaging",
      status: "READY_FOR_VERIFICATION",
      purchaseBill: {
        documentId: `DOC-PB-${Math.floor(10000 + Math.random() * 90000)}`,
        fileName: data.purchaseBill.fileName,
        fileSize: data.purchaseBill.fileSize || "1.2 MB",
        fileType: data.purchaseBill.fileType || "application/pdf",
        uploadedDate: new Date().toISOString().split("T")[0],
        source: "INSTRUMENT",
      },
      createdAt: new Date().toISOString(),
    };

    return await instrumentRepository.create(instrument);
  },

  updateInstrument: async (id, user, data) => {
    const existing = await instrumentService.getInstrumentById(id, user);

    let updatedPurchaseBill = existing.purchaseBill;
    if (data.purchaseBill) {
      updatedPurchaseBill = {
        documentId:
          data.purchaseBill.documentId ||
          existing.purchaseBill?.documentId ||
          `DOC-PB-${Math.floor(10000 + Math.random() * 90000)}`,
        fileName: data.purchaseBill.fileName,
        fileSize: data.purchaseBill.fileSize || "1.2 MB",
        fileType: data.purchaseBill.fileType || "application/pdf",
        uploadedDate:
          data.purchaseBill.uploadedDate || new Date().toISOString().split("T")[0],
        source: "INSTRUMENT",
      };
    }

    const updated = await instrumentRepository.update(id, {
      ...existing,
      ...data,
      purchaseBill: updatedPurchaseBill,
    });

    return updated;
  },
};
