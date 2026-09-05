import { businessRepository } from "../repositories/businessRepository.js";
import { documentRepository } from "../repositories/documentRepository.js";
import { instrumentRepository } from "../repositories/instrumentRepository.js";
import { ROLES } from "../constants/roles.js";
import { assertDomainId, generateDomainId } from "../utils/id.js";
import { badRequest, forbidden, notFound, unprocessable } from "../utils/errors.js";

const actorUserId = (user) => user.auth_user_id || user.user_id || user.id;

const requireBusinessRecord = async (user) => {
  const business = await businessRepository.getByUserId(actorUserId(user));
  if (!business) {
    throw unprocessable("Create the business role record in Supabase before registering instruments.");
  }
  return business;
};

const normalizeInstrumentId = (data, districtId) => {
  const requested = data.instrumentId || data.instrument_id || data.id;
  return requested ? assertDomainId(requested, "Instrument ID") : generateDomainId("INS", districtId);
};

const resolvePurchaseBill = async ({ user, businessUuid, instrumentUuid, purchaseBill }) => {
  const documentId = purchaseBill?.documentId || purchaseBill?.id;
  if (documentId) {
    await documentRepository.assertUploader(documentId, user);
    return documentRepository.attachToInstrument(documentId, instrumentUuid, businessUuid);
  }

  if (purchaseBill?.base64 && purchaseBill?.fileName && purchaseBill?.mimeType) {
    return documentRepository.upload({
      user,
      bucket: "instrument-documents",
      fileName: purchaseBill.fileName,
      mimeType: purchaseBill.mimeType,
      base64: purchaseBill.base64,
      businessUuid,
      instrumentUuid,
    });
  }

  throw unprocessable("Upload a purchase bill and pass its documentId before registering an instrument.");
};

export const instrumentService = {
  getInstruments: async (user) => {
    if (user.role === ROLES.BUSINESS) {
      const business = await requireBusinessRecord(user);
      return instrumentRepository.getByBusiness(business.uuid);
    }

    if (user.role === ROLES.LMO || user.role === ROLES.ASSISTANT_CONTROLLER) {
      if (!user.district_id) throw forbidden("Officer district scope is not configured.");
      return instrumentRepository.getByDistrict(user.district_id);
    }

    if (user.role === ROLES.SYSTEM_ADMIN) {
      return instrumentRepository.getByDistrict(user.district_id || "ALL");
    }

    throw forbidden("Role is not authorized to list instruments.");
  },

  getInstrumentById: async (id, user) => {
    const instrument = await instrumentRepository.getById(id);
    if (!instrument) throw notFound("Instrument not found.");

    if (user.role === ROLES.BUSINESS) {
      const business = await requireBusinessRecord(user);
      if (instrument.businessUuid !== business.uuid) {
        throw forbidden("This instrument belongs to another business.");
      }
      return instrument;
    }

    if (user.role !== ROLES.SYSTEM_ADMIN && user.district_id !== "ALL" && instrument.district_id !== user.district_id) {
      throw forbidden("Instrument is outside your assigned district.");
    }

    return instrument;
  },

  createInstrument: async (user, data) => {
    if (user.role !== ROLES.BUSINESS) {
      throw forbidden("Only business users can register instruments.");
    }

    const normalized = {
      name: data.name,
      serialNumber: data.serialNumber || data.serial_number || data.serialNo,
      capacity: data.capacity,
    };
    const missing = Object.entries(normalized)
      .filter(([, value]) => !value)
      .map(([field]) => field);
    if (missing.length) {
      throw badRequest(`Missing required instrument information: ${missing.join(", ")}.`);
    }

    if (!data.purchaseBill) {
      throw unprocessable("A purchase bill document is required before registering an instrument.");
    }

    const business = await requireBusinessRecord(user);
    const instrumentId = normalizeInstrumentId(data, business.district_id);
    const purchaseBillDocumentId = data.purchaseBill.documentId || data.purchaseBill.id;
    let uploadedPurchaseBill = null;

    if (purchaseBillDocumentId) {
      await documentRepository.assertUploader(purchaseBillDocumentId, user);
    } else if (data.purchaseBill.base64 && data.purchaseBill.fileName && data.purchaseBill.mimeType) {
      uploadedPurchaseBill = await documentRepository.upload({
        user,
        bucket: "instrument-documents",
        fileName: data.purchaseBill.fileName,
        mimeType: data.purchaseBill.mimeType,
        base64: data.purchaseBill.base64,
        businessUuid: business.uuid,
      });
    } else {
      throw unprocessable("Upload a purchase bill and pass its documentId before registering an instrument.");
    }

    const created = await instrumentRepository.create({
      instrumentId,
      businessUuid: business.uuid,
      district_id: business.district_id,
      name: normalized.name,
      type: data.type || data.category || data.instrumentType,
      category: data.category || data.type || data.instrumentType,
      manufacturer: data.manufacturer,
      model: data.model,
      serialNumber: normalized.serialNumber,
      capacity: normalized.capacity,
      accuracyClass: data.accuracyClass,
      yearOfManufacture: data.yearOfManufacture,
      purchaseDate: data.purchaseDate,
      purpose: data.purpose,
      location: data.location,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      status: "READY_FOR_VERIFICATION",
    });

    await documentRepository.attachToInstrument(
      purchaseBillDocumentId || uploadedPurchaseBill.id,
      created.uuid,
      business.uuid
    );

    return instrumentRepository.getById(created.instrumentId || created.id);
  },

  updateInstrument: async (id, user, data) => {
    const existing = await instrumentService.getInstrumentById(id, user);
    const updated = await instrumentRepository.update(id, data);
    if (!updated) throw notFound("Instrument not found.");

    if (data.purchaseBill) {
      await resolvePurchaseBill({
        user,
        businessUuid: existing.businessUuid,
        instrumentUuid: existing.uuid,
        purchaseBill: data.purchaseBill,
      });
      return instrumentRepository.getById(updated.instrumentId || updated.id);
    }

    return updated;
  },
};
