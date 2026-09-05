import { supabaseAdmin } from "../config/supabase.js";
import { fromSupabaseError } from "../utils/errors.js";

const instrumentSelect = `
  *,
  businesses:business_id (
    id,
    business_id,
    name,
    user_id,
    email
  ),
  instrument_types:instrument_type_id (
    id,
    name
  ),
  documents:documents (
    id,
    storage_bucket,
    storage_path,
    original_name,
    mime_type,
    file_size,
    created_at
  )
`;

const mapDocument = (row) =>
  row
    ? {
        documentId: row.id,
        fileName: row.original_name,
        fileSize: row.file_size ? `${Math.round(row.file_size / 1024)} KB` : undefined,
        fileType: row.mime_type,
        storageBucket: row.storage_bucket,
        storagePath: row.storage_path,
        uploadedDate: row.created_at?.split("T")[0],
        source: "INSTRUMENT",
      }
    : null;

const mapInstrument = (row) => {
  if (!row) return null;
  const purchaseBill = (row.documents || []).find((doc) => doc.storage_bucket === "instrument-documents") || null;
  return {
    uuid: row.id,
    id: row.instrument_id,
    instrument_id: row.instrument_id,
    instrumentId: row.instrument_id,
    district_id: row.district_id,
    businessUuid: row.business_id,
    businessId: row.businesses?.business_id,
    business_id: row.businesses?.business_id,
    businessName: row.businesses?.name,
    name: row.name,
    type: row.instrument_types?.name || row.type || row.status,
    category: row.instrument_types?.name || row.type || "Instrument",
    manufacturer: row.manufacturer,
    model: row.model,
    serialNumber: row.serial_number,
    capacity: row.capacity,
    readability: row.readability,
    accuracyClass: row.accuracy_class,
    yearOfManufacture: row.year_of_manufacture,
    purchaseDate: row.purchase_date,
    purpose: row.purpose,
    location: row.location,
    installationLocation: row.location,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    status: row.status,
    purchaseBill: mapDocument(purchaseBill),
    documents: (row.documents || []).map(mapDocument).filter(Boolean),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

const resolveInstrumentTypeId = async (instrumentData) => {
  const name = instrumentData.instrumentType || instrumentData.type || instrumentData.category;
  if (!name) return undefined;

  const { data: existing, error: findError } = await supabaseAdmin
    .from("instrument_types")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (findError) throw fromSupabaseError(findError, "Could not load instrument type.");
  if (existing?.id) return existing.id;

  const { data, error } = await supabaseAdmin
    .from("instrument_types")
    .insert({ name })
    .select("id")
    .single();
  if (error) throw fromSupabaseError(error, "Could not create instrument type.");
  return data.id;
};

export const instrumentRepository = {
  getAll: async () => {
    const { data, error } = await supabaseAdmin
      .from("instruments")
      .select(instrumentSelect)
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load instruments.");
    return (data || []).map(mapInstrument);
  },
  getByDistrict: async (district_id) => {
    let query = supabaseAdmin.from("instruments").select(instrumentSelect);
    if (district_id && district_id !== "ALL") query = query.eq("district_id", district_id);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load district instruments.");
    return (data || []).map(mapInstrument);
  },
  getByBusiness: async (businessId) => {
    if (!businessId) return [];
    let businessUuid = businessId;
    if (!/^[0-9a-f-]{36}$/i.test(String(businessId))) {
      const { data: business, error: businessError } = await supabaseAdmin
        .from("businesses")
        .select("id")
        .eq("business_id", businessId)
        .maybeSingle();
      if (businessError) throw fromSupabaseError(businessError, "Could not load business instruments.");
      businessUuid = business?.id;
    }
    if (!businessUuid) return [];

    const { data, error } = await supabaseAdmin
      .from("instruments")
      .select(instrumentSelect)
      .eq("business_id", businessUuid)
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load business instruments.");
    return (data || []).map(mapInstrument);
  },
  getById: async (id) => {
    const { data, error } = await supabaseAdmin
      .from("instruments")
      .select(instrumentSelect)
      .or(/^[0-9a-f-]{36}$/i.test(String(id)) ? `id.eq.${id},instrument_id.ilike.${id}` : `instrument_id.ilike.${id}`)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load instrument.");
    return mapInstrument(data);
  },
  getRowById: async (id) => {
    const { data, error } = await supabaseAdmin
      .from("instruments")
      .select(instrumentSelect)
      .or(/^[0-9a-f-]{36}$/i.test(String(id)) ? `id.eq.${id},instrument_id.ilike.${id}` : `instrument_id.ilike.${id}`)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load instrument.");
    return data || null;
  },
  create: async (instrumentData) => {
    const instrumentTypeId = await resolveInstrumentTypeId(instrumentData);
    const payload = stripUndefined({
      instrument_id: instrumentData.instrument_id || instrumentData.instrumentId || instrumentData.id,
      business_id: instrumentData.businessUuid,
      district_id: instrumentData.district_id,
      instrument_type_id: instrumentTypeId,
      name: instrumentData.name,
      manufacturer: instrumentData.manufacturer,
      model: instrumentData.model,
      serial_number: instrumentData.serialNumber || instrumentData.serial_number,
      capacity: instrumentData.capacity,
      accuracy_class: instrumentData.accuracyClass || instrumentData.accuracy_class,
      year_of_manufacture: instrumentData.yearOfManufacture
        ? Number.parseInt(instrumentData.yearOfManufacture, 10)
        : undefined,
      purchase_date: instrumentData.purchaseDate || instrumentData.purchase_date,
      purpose: instrumentData.purpose,
      location: instrumentData.location,
      city: instrumentData.city,
      state: instrumentData.state,
      pincode: instrumentData.pincode,
      status: instrumentData.status || "READY_FOR_VERIFICATION",
    });

    const { data, error } = await supabaseAdmin.from("instruments").insert(payload).select(instrumentSelect).single();
    if (error) throw fromSupabaseError(error, "Could not create instrument.");
    return mapInstrument(data);
  },
  update: async (id, updateData) => {
    const existing = await instrumentRepository.getRowById(id);
    if (!existing) return null;

    const instrumentTypeId = await resolveInstrumentTypeId(updateData);
    const payload = stripUndefined({
      instrument_type_id: instrumentTypeId,
      name: updateData.name,
      manufacturer: updateData.manufacturer,
      model: updateData.model,
      serial_number: updateData.serialNumber || updateData.serial_number,
      capacity: updateData.capacity,
      accuracy_class: updateData.accuracyClass || updateData.accuracy_class,
      year_of_manufacture: updateData.yearOfManufacture
        ? Number.parseInt(updateData.yearOfManufacture, 10)
        : undefined,
      purchase_date: updateData.purchaseDate || updateData.purchase_date,
      purpose: updateData.purpose,
      location: updateData.location,
      city: updateData.city,
      state: updateData.state,
      pincode: updateData.pincode,
      status: updateData.status,
      updated_at: new Date().toISOString(),
    });

    const { data, error } = await supabaseAdmin
      .from("instruments")
      .update(payload)
      .eq("id", existing.id)
      .select(instrumentSelect)
      .single();
    if (error) throw fromSupabaseError(error, "Could not update instrument.");
    return mapInstrument(data);
  },
  mapInstrument,
  mapDocument,
};
