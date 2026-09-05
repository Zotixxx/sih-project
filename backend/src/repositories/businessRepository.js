import { supabaseAdmin } from "../config/supabase.js";
import { fromSupabaseError } from "../utils/errors.js";

const businessSelect = `
  *,
  documents (
    id,
    original_name,
    mime_type,
    file_size,
    storage_bucket,
    storage_path,
    created_at
  )
`;

const mapDocument = (row) =>
  row
    ? {
        id: row.id,
        documentId: row.id,
        name: row.original_name,
        fileName: row.original_name,
        type: row.mime_type,
        size: row.file_size ? `${Math.round(row.file_size / 1024)} KB` : undefined,
        storageBucket: row.storage_bucket,
        storagePath: row.storage_path,
        uploadedDate: row.created_at?.split("T")[0],
      }
    : null;

const mapBusiness = (row) => {
  if (!row) return null;
  return {
    uuid: row.id,
    id: row.business_id,
    business_id: row.business_id,
    businessId: row.business_id,
    authUserId: row.user_id,
    user_id: row.user_id,
    district_id: row.district_id,
    name: row.name,
    businessName: row.name,
    gstin: row.gstin,
    pan: row.pan,
    registrationNumber: row.registration_number,
    contactPerson: row.contact_person,
    ownerName: row.contact_person,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    natureOfBusiness: row.nature_of_business,
    documents: (row.documents || []).map(mapDocument).filter(Boolean),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const toBusinessUpdate = (data = {}) => ({
  name: data.name || data.businessName,
  gstin: data.gstin || null,
  pan: data.pan || null,
  registration_number: data.registrationNumber || data.registration_number || null,
  contact_person: data.contactPerson || data.ownerName || data.applicantName || null,
  phone: data.phone || null,
  email: data.email || null,
  address: data.address || null,
  city: data.city || null,
  state: data.state || null,
  pincode: data.pincode || data.pin || null,
  nature_of_business: data.natureOfBusiness || data.businessType || data.category || null,
  district_id: data.district_id || data.districtCode,
});

const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

export const businessRepository = {
  getAll: async () => {
    const { data, error } = await supabaseAdmin
      .from("businesses")
      .select(businessSelect)
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load businesses.");
    return (data || []).map(mapBusiness);
  },
  getByDistrict: async (district_id) => {
    let query = supabaseAdmin.from("businesses").select(businessSelect);
    if (district_id && district_id !== "ALL") query = query.eq("district_id", district_id);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load district businesses.");
    return (data || []).map(mapBusiness);
  },
  getById: async (id) => {
    if (!id) return null;
    let query = supabaseAdmin.from("businesses").select(businessSelect);
    const normalized = String(id).trim();

    if (/^[0-9a-f-]{36}$/i.test(normalized)) {
      query = query.or(`id.eq.${normalized},user_id.eq.${normalized},business_id.ilike.${normalized}`);
    } else {
      query = query.or(`business_id.ilike.${normalized},email.ilike.${normalized}`);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load business profile.");
    return mapBusiness(data);
  },
  getByUserId: async (userId) => {
    const { data, error } = await supabaseAdmin
      .from("businesses")
      .select(businessSelect)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load business profile.");
    return mapBusiness(data);
  },
  getRowByUserId: async (userId) => {
    const { data, error } = await supabaseAdmin
      .from("businesses")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load business profile.");
    return data || null;
  },
  getRowByDomainId: async (businessId) => {
    const { data, error } = await supabaseAdmin
      .from("businesses")
      .select("*")
      .eq("business_id", businessId)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load business profile.");
    return data || null;
  },
  update: async (id, updateData) => {
    const existing =
      (await businessRepository.getRowByDomainId(id)) ||
      (/^[0-9a-f-]{36}$/i.test(String(id)) ? await businessRepository.getRowByUserId(id) : null);

    const payload = stripUndefined({
      ...toBusinessUpdate(updateData),
      updated_at: new Date().toISOString(),
    });

    if (!existing) {
      const insertPayload = stripUndefined({
        ...payload,
        business_id: updateData.business_id || updateData.businessId || id,
        user_id: updateData.user_id || updateData.authUserId,
        district_id: payload.district_id || updateData.district_id,
      });
      const { data, error } = await supabaseAdmin.from("businesses").insert(insertPayload).select(businessSelect).single();
      if (error) throw fromSupabaseError(error, "Could not create business profile.");
      return mapBusiness(data);
    }

    const { data, error } = await supabaseAdmin
      .from("businesses")
      .update(payload)
      .eq("id", existing.id)
      .select(businessSelect)
      .single();
    if (error) throw fromSupabaseError(error, "Could not update business profile.");
    return mapBusiness(data);
  },
  mapBusiness,
};
