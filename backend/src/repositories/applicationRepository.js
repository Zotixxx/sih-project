import { supabaseAdmin } from "../config/supabase.js";
import { fromSupabaseError } from "../utils/errors.js";

const applicationSelect = `
  *,
  businesses:business_id (
    id,
    business_id,
    user_id,
    name,
    contact_person,
    phone,
    email,
    address,
    city,
    state,
    pincode
  ),
  instruments:instrument_id (
    id,
    instrument_id,
    name,
    manufacturer,
    model,
    serial_number,
    capacity,
    accuracy_class,
    location,
    city,
    state,
    pincode
  ),
  lmos:assigned_lmo_id (
    id,
    lmo_id,
    user_id,
    name,
    badge_number,
    designation,
    jurisdiction
  ),
  inspections (
    id,
    inspection_id,
    status,
    seal_number,
    inspection_date,
    submitted_at
  ),
  application_status_history (
    id,
    from_status,
    to_status,
    reason,
    created_at
  ),
  application_documents (
    documents (
      id,
      original_name,
      mime_type,
      file_size,
      storage_bucket,
      storage_path,
      created_at
    )
  )
`;

const mapDocument = (row) =>
  row
    ? {
        documentId: row.id,
        name: row.original_name,
        fileName: row.original_name,
        size: row.file_size ? `${Math.round(row.file_size / 1024)} KB` : undefined,
        type: row.mime_type,
        storageBucket: row.storage_bucket,
        storagePath: row.storage_path,
        uploadDate: row.created_at?.split("T")[0],
        source: row.storage_bucket === "instrument-documents" ? "INSTRUMENT" : "APPLICATION",
      }
    : null;

const mapApplication = (row) => {
  if (!row) return null;
  const businessSnapshot = row.business_snapshot || {};
  const instrumentSnapshot = row.instrument_snapshot || {};
  const verificationLocation = row.verification_location || {};
  const inspection = Array.isArray(row.inspections) ? row.inspections[0] : row.inspections;
  const documents = (row.application_documents || [])
    .map((entry) => mapDocument(entry.documents))
    .filter(Boolean);

  return {
    uuid: row.id,
    id: row.application_id,
    application_id: row.application_id,
    applicationId: row.application_id,
    district_id: row.district_id,
    businessUuid: row.business_id,
    businessId: row.businesses?.business_id,
    business_id: row.businesses?.business_id,
    businessUserId: row.businesses?.user_id,
    businessName: businessSnapshot.name || row.businesses?.name,
    applicantName: row.applicant_name || businessSnapshot.contactPerson || row.businesses?.contact_person,
    phone: businessSnapshot.phone || row.businesses?.phone,
    email: businessSnapshot.email || row.businesses?.email,
    businessAddress: businessSnapshot.address || row.businesses?.address,
    businessCity: businessSnapshot.city || row.businesses?.city,
    businessState: businessSnapshot.state || row.businesses?.state,
    businessPincode: businessSnapshot.pincode || row.businesses?.pincode,
    address: verificationLocation.address || businessSnapshot.address || row.businesses?.address,
    city: verificationLocation.city || businessSnapshot.city || row.businesses?.city,
    district: verificationLocation.district || row.district_id,
    districtId: verificationLocation.districtId || row.district_id,
    state: verificationLocation.state || businessSnapshot.state || row.businesses?.state,
    pincode: verificationLocation.pincode || businessSnapshot.pincode || row.businesses?.pincode,
    instrumentUuid: row.instrument_id,
    instrumentId: row.instruments?.instrument_id,
    instrument_id: row.instruments?.instrument_id,
    instrumentName: instrumentSnapshot.name || row.instruments?.name,
    instrumentType: instrumentSnapshot.type || instrumentSnapshot.category,
    serialNumber: instrumentSnapshot.serialNumber || row.instruments?.serial_number,
    manufacturer: instrumentSnapshot.manufacturer || row.instruments?.manufacturer,
    model: instrumentSnapshot.model || row.instruments?.model,
    capacity: instrumentSnapshot.capacity || row.instruments?.capacity,
    accuracyClass: instrumentSnapshot.accuracyClass || row.instruments?.accuracy_class,
    verificationType: row.verification_type,
    applicationType: row.verification_type,
    verificationLocation,
    location: verificationLocation.address || row.instruments?.location,
    noteForLmo: row.notes,
    notes: row.notes,
    status: row.status,
    assignedLmoUuid: row.assigned_lmo_id,
    assignedLmoId: row.lmos?.lmo_id,
    assignedLmoUserId: row.lmos?.user_id,
    assignedLmoName: row.lmos?.name,
    assignedLmoBadge: row.lmos?.badge_number || row.lmos?.lmo_id,
    inspectionId: inspection?.inspection_id,
    sealNumber: inspection?.seal_number,
    inspectionDate: inspection?.inspection_date,
    submissionDate: row.submitted_at?.split("T")[0] || row.created_at?.split("T")[0],
    applicationDate: row.created_at?.split("T")[0],
    certifiedDate: row.certified_at?.split("T")[0],
    certificateId: row.certificate_id,
    certificateNumber: row.certificate_number,
    acceptedAt: row.accepted_at,
    assignedAt: row.assigned_at,
    rejectedAt: row.rejected_at,
    rejectionReason: row.rejection_reason,
    returnedReason: row.returned_reason,
    documents,
    timeline: (row.application_status_history || []).map((history) => ({
      id: history.id,
      fromStatus: history.from_status,
      toStatus: history.to_status,
      event: history.to_status,
      reason: history.reason,
      date: history.created_at,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

export const applicationRepository = {
  getAll: async () => {
    const { data, error } = await supabaseAdmin
      .from("verification_applications")
      .select(applicationSelect)
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load applications.");
    return (data || []).map(mapApplication);
  },
  getByDistrict: async (district_id) => {
    let query = supabaseAdmin.from("verification_applications").select(applicationSelect);
    if (district_id && district_id !== "ALL") query = query.eq("district_id", district_id);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load district applications.");
    return (data || []).map(mapApplication);
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
      if (businessError) throw fromSupabaseError(businessError, "Could not load business applications.");
      businessUuid = business?.id;
    }
    if (!businessUuid) return [];

    const { data, error } = await supabaseAdmin
      .from("verification_applications")
      .select(applicationSelect)
      .eq("business_id", businessUuid)
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load business applications.");
    return (data || []).map(mapApplication);
  },
  getById: async (id) => {
    const row = await applicationRepository.getRowById(id);
    return mapApplication(row);
  },
  getRowById: async (id) => {
    const { data, error } = await supabaseAdmin
      .from("verification_applications")
      .select(applicationSelect)
      .or(/^[0-9a-f-]{36}$/i.test(String(id)) ? `id.eq.${id},application_id.ilike.${id}` : `application_id.ilike.${id}`)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load application.");
    return data || null;
  },
  create: async (applicationData) => {
    const payload = stripUndefined({
      application_id: applicationData.id || applicationData.application_id || applicationData.applicationId,
      business_id: applicationData.businessUuid,
      instrument_id: applicationData.instrumentUuid,
      district_id: applicationData.district_id,
      assigned_lmo_id: applicationData.assignedLmoUuid,
      status: applicationData.status,
      verification_type: applicationData.verificationType || applicationData.verification_type,
      verification_location: applicationData.verificationLocation,
      business_snapshot: applicationData.businessSnapshot,
      instrument_snapshot: applicationData.instrumentSnapshot,
      applicant_name: applicationData.applicantName,
      notes: applicationData.notes || applicationData.noteForLmo,
      submitted_at: applicationData.submittedAt || new Date().toISOString(),
    });

    const { data, error } = await supabaseAdmin
      .from("verification_applications")
      .insert(payload)
      .select(applicationSelect)
      .single();
    if (error) throw fromSupabaseError(error, "Could not create application.");
    return mapApplication(data);
  },
  update: async (id, updateData) => {
    const existing = await applicationRepository.getRowById(id);
    if (!existing) return null;

    const payload = stripUndefined({
      status: updateData.status,
      assigned_lmo_id: updateData.assignedLmoUuid,
      notes: updateData.notes,
      certificate_id: updateData.certificateId,
      certificate_number: updateData.certificateNumber,
      certified_at: updateData.certifiedDate ? new Date(updateData.certifiedDate).toISOString() : undefined,
      accepted_at: updateData.acceptedAt,
      assigned_at: updateData.assignedAt,
      rejected_at: updateData.rejectedAt,
      rejection_reason: updateData.rejectionReason,
      returned_reason: updateData.returnedReason || updateData.returnReason,
      updated_at: new Date().toISOString(),
    });

    const { data, error } = await supabaseAdmin
      .from("verification_applications")
      .update(payload)
      .eq("id", existing.id)
      .select(applicationSelect)
      .single();
    if (error) throw fromSupabaseError(error, "Could not update application.");
    return mapApplication(data);
  },
  addStatusHistory: async ({ applicationUuid, fromStatus, toStatus, actorUserId, reason }) => {
    const { error } = await supabaseAdmin.from("application_status_history").insert({
      application_id: applicationUuid,
      from_status: fromStatus || null,
      to_status: toStatus,
      actor_user_id: actorUserId,
      reason: reason || null,
    });
    if (error) throw fromSupabaseError(error, "Could not create application status history.");
  },
  attachDocument: async ({ applicationUuid, documentId }) => {
    const { error } = await supabaseAdmin
      .from("application_documents")
      .insert({ application_id: applicationUuid, document_id: documentId });
    if (error && error.code !== "23505") {
      throw fromSupabaseError(error, "Could not attach application document.");
    }
  },
  saveDraft: async ({ businessUuid, userId, draftData }) => {
    const payload = {
      business_id: businessUuid,
      user_id: userId,
      draft_data: draftData || {},
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("application_drafts")
      .upsert(payload, { onConflict: "business_id" })
      .select("*")
      .single();
    if (error) throw fromSupabaseError(error, "Could not save application draft.");
    return {
      id: data.id,
      businessUuid: data.business_id,
      status: "DRAFT",
      ...data.draft_data,
      updatedAt: data.updated_at,
    };
  },
  getDraft: async (businessUuid) => {
    const { data, error } = await supabaseAdmin
      .from("application_drafts")
      .select("*")
      .eq("business_id", businessUuid)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load application draft.");
    return data
      ? {
          id: data.id,
          businessUuid: data.business_id,
          status: "DRAFT",
          ...data.draft_data,
          updatedAt: data.updated_at,
        }
      : null;
  },
  deleteDraft: async (businessUuid) => {
    const { error } = await supabaseAdmin
      .from("application_drafts")
      .delete()
      .eq("business_id", businessUuid);
    if (error) throw fromSupabaseError(error, "Could not delete application draft.");
    return true;
  },
  mapApplication,
};
