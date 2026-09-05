import { businessRepository } from "../repositories/businessRepository.js";
import { ROLES } from "../constants/roles.js";
import { unprocessable } from "../utils/errors.js";

const requiredProfileFields = [
  ["Business Name", (business) => business?.name || business?.businessName],
  ["GSTIN", (business) => business?.gstin],
  ["Applicant/Owner Name", (business) => business?.contactPerson || business?.ownerName],
  ["Phone", (business) => business?.phone],
  ["Email", (business) => business?.email],
  ["Address", (business) => business?.address],
  ["City", (business) => business?.city],
  ["District", (business) => business?.district_id],
  ["State", (business) => business?.state],
  ["PIN Code", (business) => business?.pincode],
];

const getMissingFields = (business) =>
  requiredProfileFields
    .filter(([, getter]) => !getter(business))
    .map(([label]) => label);

export const businessService = {
  getProfile: async (user) => {
    let business = await businessRepository.getByUserId(user.auth_user_id || user.id);
    if (!business && user.role === ROLES.BUSINESS) {
      business = {
        id: user.business_id || user.id,
        district_id: user.district_id || "",
        name: user.name || "",
        businessName: user.name || "",
        gstin: user.gstin || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        turnover: "",
        natureOfBusiness: "",
        documents: [],
      };
    }

    const missingFields = getMissingFields(business);

    return {
      ...business,
      isComplete: missingFields.length === 0,
      missingFields,
    };
  },

  updateProfile: async (user, profileData) => {
    if (user.role !== ROLES.BUSINESS && user.role !== ROLES.SYSTEM_ADMIN) {
      const err = new Error("Forbidden: Only business accounts can update business profile information.");
      err.statusCode = 403;
      throw err;
    }

    const businessId = user.business_id || profileData.business_id || profileData.businessId;
    if (!businessId) {
      const err = new Error("Business domain ID is required. Create the business role record in Supabase first.");
      err.statusCode = 422;
      throw err;
    }

    const existing = await businessRepository.getByUserId(user.auth_user_id || user.id) || {};

    const districtId = existing.district_id || user.district_id;
    if (!districtId) {
      throw unprocessable("A business district_id must be set in Supabase before the profile can be completed.");
    }

    const updated = await businessRepository.update(businessId, {
      ...existing,
      ...profileData,
      district_id: user.role === ROLES.SYSTEM_ADMIN ? profileData.district_id || districtId : districtId,
      email: profileData.email || existing.email || user.email,
      user_id: user.auth_user_id || user.id,
      business_id: businessId,
    });

    const missingFields = getMissingFields(updated);

    return {
      ...updated,
      isComplete: missingFields.length === 0,
      missingFields,
    };
  },
};
