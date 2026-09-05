import { supabaseAdmin } from "../config/supabase.js";
import { ROLES } from "../constants/roles.js";
import { assertDomainId, generateDomainId } from "../utils/id.js";
import { badRequest, conflict, fromSupabaseError } from "../utils/errors.js";

const mapProfile = (profile) => ({
  id: profile.user_id,
  auth_user_id: profile.user_id,
  user_id: profile.user_id,
  name: profile.display_name,
  displayName: profile.display_name,
  role: profile.role,
  district_id: profile.district_id,
  email: profile.email,
  phone: profile.phone,
  createdAt: profile.created_at,
  updatedAt: profile.updated_at,
});

const mergeBusiness = (user, business) => {
  if (!business) return user;
  return {
    ...user,
    business_uuid: business.id,
    business_id: business.business_id,
    domainId: business.business_id,
    businessName: business.name,
    name: user.name || business.contact_person || business.name,
    contactPerson: business.contact_person,
    gstin: business.gstin,
    pan: business.pan,
    registrationNumber: business.registration_number,
    address: business.address,
    city: business.city,
    state: business.state,
    pincode: business.pincode,
    natureOfBusiness: business.nature_of_business,
    district_id: business.district_id || user.district_id,
    phone: user.phone || business.phone,
    email: user.email || business.email,
  };
};

const mergeLmo = (user, lmo) => {
  if (!lmo) return user;
  return {
    ...user,
    lmo_uuid: lmo.id,
    lmo_id: lmo.lmo_id,
    domainId: lmo.lmo_id,
    badgeNumber: lmo.badge_number || lmo.lmo_id,
    designation: lmo.designation,
    jurisdiction: lmo.jurisdiction,
    name: lmo.name || user.name,
    district_id: lmo.district_id || user.district_id,
  };
};

const mergeAssistantController = (user, ac) => {
  if (!ac) return user;
  return {
    ...user,
    ac_uuid: ac.id,
    ac_id: ac.ac_id,
    domainId: ac.ac_id,
    designation: ac.designation,
    name: ac.name || user.name,
    district_id: ac.district_id || user.district_id,
  };
};

const hydrateRoleRecord = async (profile) => {
  let user = mapProfile(profile);

  if (user.role === ROLES.BUSINESS) {
    const { data, error } = await supabaseAdmin
      .from("businesses")
      .select("*")
      .eq("user_id", user.auth_user_id)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load business profile.");
    return mergeBusiness(user, data);
  }

  if (user.role === ROLES.LMO) {
    const { data, error } = await supabaseAdmin
      .from("lmos")
      .select("*")
      .eq("user_id", user.auth_user_id)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load LMO profile.");
    return mergeLmo(user, data);
  }

  if (user.role === ROLES.ASSISTANT_CONTROLLER) {
    const { data, error } = await supabaseAdmin
      .from("assistant_controllers")
      .select("*")
      .eq("user_id", user.auth_user_id)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load Assistant Controller profile.");
    return mergeAssistantController(user, data);
  }

  return {
    ...user,
    domainId: user.auth_user_id,
  };
};

const normalizeBusinessRegistration = (authUser, input = {}) => {
  const businessName = String(input.businessName || input.name || "").trim();
  const ownerName = String(input.ownerName || input.contactPerson || "").trim();
  const phone = String(input.phone || "").trim();
  const address = String(input.address || "").trim();
  const city = String(input.city || "").trim();
  const state = String(input.state || "").trim();
  const pincode = String(input.pincode || input.pin || "").trim();
  const districtInput = input.district_id || input.districtId;

  const missing = [];
  if (!businessName) missing.push("businessName");
  if (!ownerName) missing.push("ownerName");
  if (!phone) missing.push("phone");
  if (!address) missing.push("address");
  if (!city) missing.push("city");
  if (!districtInput) missing.push("districtId");
  if (!state) missing.push("state");
  if (!pincode) missing.push("pincode");
  if (missing.length) throw badRequest(`Missing business registration fields: ${missing.join(", ")}.`);

  const district_id = assertDomainId(districtInput, "District code");

  return {
    businessName,
    ownerName,
    phone,
    address,
    city,
    state,
    pincode,
    district_id,
    email: authUser.email,
    gstin: String(input.gstin || "").trim() || null,
    pan: String(input.pan || "").trim() || null,
    registrationNumber: String(input.registrationNumber || "").trim() || null,
    natureOfBusiness: String(input.natureOfBusiness || "").trim() || null,
  };
};

export const userRepository = {
  getAll: async () => {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load user profiles.");
    return Promise.all((data || []).map(hydrateRoleRecord));
  },
  getById: async (id) => {
    if (!id) return null;

    const normalized = String(id).trim();
    const profileResult = await supabaseAdmin
      .from("profiles")
      .select("*")
      .or(`user_id.eq.${normalized},email.ilike.${normalized}`)
      .maybeSingle();

    if (profileResult.error && profileResult.error.code !== "22P02") {
      throw fromSupabaseError(profileResult.error, "Could not load user profile.");
    }

    if (profileResult.data) return hydrateRoleRecord(profileResult.data);

    const businessResult = await supabaseAdmin
      .from("businesses")
      .select("user_id")
      .or(`business_id.ilike.${normalized},email.ilike.${normalized}`)
      .maybeSingle();
    if (businessResult.error) throw fromSupabaseError(businessResult.error, "Could not load business identity.");
    if (businessResult.data?.user_id) return userRepository.getById(businessResult.data.user_id);

    const lmoResult = await supabaseAdmin
      .from("lmos")
      .select("user_id")
      .or(`lmo_id.ilike.${normalized},badge_number.ilike.${normalized}`)
      .maybeSingle();
    if (lmoResult.error) throw fromSupabaseError(lmoResult.error, "Could not load LMO identity.");
    if (lmoResult.data?.user_id) return userRepository.getById(lmoResult.data.user_id);

    const acResult = await supabaseAdmin
      .from("assistant_controllers")
      .select("user_id")
      .or(`ac_id.ilike.${normalized}`)
      .maybeSingle();
    if (acResult.error) throw fromSupabaseError(acResult.error, "Could not load AC identity.");
    if (acResult.data?.user_id) return userRepository.getById(acResult.data.user_id);

    return null;
  },
  createBusinessRegistration: async (authUser, input = {}) => {
    const existing = await userRepository.getById(authUser.id);
    if (existing) {
      if (existing.role !== ROLES.BUSINESS) {
        throw conflict("This Supabase user is already assigned to a non-business MetriX role.");
      }
      return existing;
    }

    const data = normalizeBusinessRegistration(authUser, input);
    const { data: district, error: districtError } = await supabaseAdmin
      .from("districts")
      .select("id")
      .eq("id", data.district_id)
      .maybeSingle();
    if (districtError) throw fromSupabaseError(districtError, "Could not verify district.");
    if (!district) throw badRequest(`District code '${data.district_id}' is not configured.`);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: authUser.id,
        role: ROLES.BUSINESS,
        display_name: data.businessName,
        district_id: data.district_id,
        email: data.email,
        phone: data.phone,
      })
      .select("*")
      .single();
    if (profileError) throw fromSupabaseError(profileError, "Could not create business profile.");

    const businessId = generateDomainId("BUS", data.district_id);
    const { error: businessError } = await supabaseAdmin
      .from("businesses")
      .insert({
        business_id: businessId,
        user_id: authUser.id,
        district_id: data.district_id,
        name: data.businessName,
        gstin: data.gstin,
        pan: data.pan,
        registration_number: data.registrationNumber,
        contact_person: data.ownerName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        nature_of_business: data.natureOfBusiness,
      });

    if (businessError) {
      await supabaseAdmin.from("profiles").delete().eq("user_id", authUser.id);
      throw fromSupabaseError(businessError, "Could not create business domain record.");
    }

    return hydrateRoleRecord(profile);
  },
  getByDistrict: async (district_id) => {
    let query = supabaseAdmin.from("profiles").select("*");
    if (district_id && district_id !== "ALL") {
      query = query.or(`district_id.eq.${district_id},district_id.eq.ALL`);
    }
    const { data, error } = await query.order("display_name");
    if (error) throw fromSupabaseError(error, "Could not load district users.");
    return Promise.all((data || []).map(hydrateRoleRecord));
  },
  getLmosByDistrict: async (district_id) => {
    let query = supabaseAdmin.from("lmos").select("*, profiles:user_id(*)");
    if (district_id && district_id !== "ALL") query = query.eq("district_id", district_id);
    const { data, error } = await query.order("name");
    if (error) throw fromSupabaseError(error, "Could not load LMOs.");
    return (data || []).map((row) =>
      mergeLmo(mapProfile(row.profiles || {
        user_id: row.user_id,
        role: ROLES.LMO,
        display_name: row.name,
        district_id: row.district_id,
      }), row)
    );
  },
  getAssistantControllerByDistrict: async (district_id) => {
    const { data, error } = await supabaseAdmin
      .from("assistant_controllers")
      .select("*, profiles:user_id(*)")
      .eq("district_id", district_id)
      .limit(1)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load Assistant Controller.");
    if (!data) return null;
    return mergeAssistantController(mapProfile(data.profiles), data);
  },
};
