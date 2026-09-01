import { businessRepository } from "../repositories/businessRepository.js";
import { ROLES } from "../constants/roles.js";

export const businessService = {
  getProfile: async (user) => {
    // Find business matching user ID or email or district
    let business = await businessRepository.getById(user.business_id || user.id);
    if (!business) {
      business = await businessRepository.getById(user.email);
    }
    if (!business && user.role === ROLES.BUSINESS) {
      // Return user profile as initial business data
      business = {
        id: user.business_id || user.id,
        district_id: user.district_id || "AJM",
        name: user.name || "",
        businessName: user.name || "",
        gstin: user.gstin || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
        city: user.city || "Ajmer",
        state: user.state || "Rajasthan",
        pincode: user.pincode || "305001",
        turnover: "",
        natureOfBusiness: "",
        documents: [],
      };
    }

    const missingFields = [];
    if (!business?.name && !business?.businessName) missingFields.push("Business Name");
    if (!business?.gstin) missingFields.push("GSTIN");
    if (!business?.address) missingFields.push("Address");
    if (!business?.phone) missingFields.push("Phone");

    return {
      ...business,
      isComplete: missingFields.length === 0,
      missingFields,
    };
  },

  updateProfile: async (user, profileData) => {
    const businessId = user.business_id || user.id;
    const existing = await businessRepository.getById(businessId) || {};

    const updated = await businessRepository.update(businessId, {
      ...existing,
      ...profileData,
      district_id: profileData.district_id || existing.district_id || user.district_id || "AJM",
      email: profileData.email || existing.email || user.email,
    });

    const missingFields = [];
    if (!updated?.name && !updated?.businessName) missingFields.push("Business Name");
    if (!updated?.gstin) missingFields.push("GSTIN");
    if (!updated?.address) missingFields.push("Address");
    if (!updated?.phone) missingFields.push("Phone");

    return {
      ...updated,
      isComplete: missingFields.length === 0,
      missingFields,
    };
  },
};
