import { supabaseAdmin } from "../config/supabase.js";
import { fromSupabaseError } from "../utils/errors.js";

const inspectionSelect = `
  *,
  lmos:lmo_id (
    id,
    lmo_id,
    name,
    badge_number,
    designation,
    jurisdiction
  ),
  verification_applications:application_id (
    id,
    application_id,
    district_id,
    business_snapshot,
    instrument_snapshot,
    verification_location,
    status
  ),
  inspection_measurements (
    id,
    test_load,
    indicated_weight,
    error,
    mpe_limit,
    result,
    created_at
  ),
  inspection_evidence (
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

const mapMeasurement = (row) => ({
  id: row.id,
  testLoad: row.test_load,
  indicatedWeight: row.indicated_weight,
  observed: row.indicated_weight,
  error: row.error,
  mpeLimit: row.mpe_limit,
  mpe: row.mpe_limit,
  result: row.result,
});

const mapEvidence = (entry) => {
  const doc = entry?.documents || entry;
  if (!doc) return null;
  return {
    documentId: doc.id,
    fileName: doc.original_name,
    fileType: doc.mime_type,
    fileSize: doc.file_size,
    storageBucket: doc.storage_bucket,
    storagePath: doc.storage_path,
    uploadedDate: doc.created_at?.split("T")[0],
  };
};

const mapInspection = (row) => {
  if (!row) return null;
  const application = row.verification_applications || {};
  const business = application.business_snapshot || {};
  const instrument = application.instrument_snapshot || {};

  return {
    uuid: row.id,
    id: row.inspection_id,
    inspection_id: row.inspection_id,
    applicationUuid: row.application_id,
    applicationId: application.application_id,
    district_id: application.district_id || row.district_id,
    district: application.verification_location?.district,
    instrumentId: instrument.instrumentId,
    instrumentName: instrument.name,
    serialNumber: instrument.serialNumber,
    category: instrument.type || instrument.category,
    capacity: instrument.capacity,
    ownerName: business.name,
    businessName: business.name,
    location: application.verification_location?.address,
    lmoUuid: row.lmo_id,
    lmoId: row.lmos?.lmo_id,
    officerId: row.lmos?.lmo_id,
    officerName: row.lmos?.name,
    officer: row.lmos?.name,
    officerBadge: row.lmos?.badge_number || row.lmos?.lmo_id,
    officerRole: row.lmos?.designation,
    scheduledDate: row.scheduled_date,
    status: row.status,
    gpsCoords: row.gps_coordinates,
    gpsCoordinates: row.gps_coordinates,
    sealNumber: row.seal_number,
    standardsUsed: row.standards_used,
    checklist: row.checklist || {},
    measurements: (row.inspection_measurements || []).map(mapMeasurement),
    evidence: (row.inspection_evidence || []).map(mapEvidence).filter(Boolean),
    photos: (row.inspection_evidence || []).map(mapEvidence).filter(Boolean),
    remarks: row.officer_remarks,
    officerRemarks: row.officer_remarks,
    inspectionDate: row.inspection_date,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

export const inspectionRepository = {
  getAll: async () => {
    const { data, error } = await supabaseAdmin
      .from("inspections")
      .select(inspectionSelect)
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load inspections.");
    return (data || []).map(mapInspection);
  },
  getByDistrict: async (district_id) => {
    let query = supabaseAdmin.from("inspections").select(inspectionSelect);
    if (district_id && district_id !== "ALL") {
      query = query.eq("district_id", district_id);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load district inspections.");
    return (data || []).map(mapInspection);
  },
  getById: async (id) => {
    const row = await inspectionRepository.getRowById(id);
    return mapInspection(row);
  },
  getRowById: async (id) => {
    const { data, error } = await supabaseAdmin
      .from("inspections")
      .select(inspectionSelect)
      .or(/^[0-9a-f-]{36}$/i.test(String(id)) ? `id.eq.${id},inspection_id.ilike.${id}` : `inspection_id.ilike.${id}`)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load inspection.");
    return data || null;
  },
  getByApplicationId: async (applicationId) => {
    let applicationUuid = applicationId;
    if (!/^[0-9a-f-]{36}$/i.test(String(applicationId))) {
      const { data: app, error: appError } = await supabaseAdmin
        .from("verification_applications")
        .select("id")
        .eq("application_id", applicationId)
        .maybeSingle();
      if (appError) throw fromSupabaseError(appError, "Could not load application inspection.");
      applicationUuid = app?.id;
    }
    if (!applicationUuid) return null;
    const { data, error } = await supabaseAdmin
      .from("inspections")
      .select(inspectionSelect)
      .eq("application_id", applicationUuid)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load application inspection.");
    return mapInspection(data);
  },
  getRowByApplicationUuid: async (applicationUuid) => {
    const { data, error } = await supabaseAdmin
      .from("inspections")
      .select(inspectionSelect)
      .eq("application_id", applicationUuid)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load application inspection.");
    return data || null;
  },
  getByLmoId: async (lmoId) => {
    let lmoUuid = lmoId;
    if (!/^[0-9a-f-]{36}$/i.test(String(lmoId))) {
      const { data: lmo, error: lmoError } = await supabaseAdmin
        .from("lmos")
        .select("id")
        .eq("lmo_id", lmoId)
        .maybeSingle();
      if (lmoError) throw fromSupabaseError(lmoError, "Could not load LMO inspections.");
      lmoUuid = lmo?.id;
    }
    if (!lmoUuid) return [];
    const { data, error } = await supabaseAdmin
      .from("inspections")
      .select(inspectionSelect)
      .eq("lmo_id", lmoUuid)
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load LMO inspections.");
    return (data || []).map(mapInspection);
  },
  create: async (inspectionData) => {
    const { data, error } = await supabaseAdmin
      .from("inspections")
      .insert(stripUndefined({
        inspection_id: inspectionData.id || inspectionData.inspection_id || inspectionData.inspectionId,
        district_id: inspectionData.district_id,
        application_id: inspectionData.applicationUuid,
        lmo_id: inspectionData.lmoUuid,
        scheduled_date: inspectionData.scheduledDate,
        status: inspectionData.status,
      }))
      .select(inspectionSelect)
      .single();
    if (error) throw fromSupabaseError(error, "Could not create inspection.");
    return mapInspection(data);
  },
  update: async (id, updateData) => {
    const existing = await inspectionRepository.getRowById(id);
    if (!existing) return null;

    const { data, error } = await supabaseAdmin
      .from("inspections")
      .update(stripUndefined({
        lmo_id: updateData.lmoUuid,
        scheduled_date: updateData.scheduledDate,
        status: updateData.status,
        inspection_date: updateData.inspectionDate,
        gps_coordinates: updateData.gpsCoordinates || updateData.gpsCoords,
        seal_number: updateData.sealNumber,
        standards_used: updateData.standardsUsed,
        checklist: updateData.checklist,
        officer_remarks: updateData.officerRemarks || updateData.remarks,
        submitted_at: updateData.submittedAt,
        returned_at: updateData.returnedAt,
        return_reason: updateData.returnReason,
        certificate_id: updateData.certificateId,
        certificate_number: updateData.certificateNumber,
        approved_date: updateData.approvedDate,
        updated_at: new Date().toISOString(),
      }))
      .eq("id", existing.id)
      .select(inspectionSelect)
      .single();
    if (error) throw fromSupabaseError(error, "Could not update inspection.");
    return mapInspection(data);
  },
  replaceMeasurements: async (inspectionUuid, measurements = []) => {
    const { error: deleteError } = await supabaseAdmin
      .from("inspection_measurements")
      .delete()
      .eq("inspection_id", inspectionUuid);
    if (deleteError) throw fromSupabaseError(deleteError, "Could not update inspection measurements.");

    if (!measurements.length) return [];

    const rows = measurements.map((measurement) => ({
      inspection_id: inspectionUuid,
      test_load: measurement.testLoad || measurement.nominalLoad,
      indicated_weight: measurement.indicatedWeight || measurement.observed || measurement.indicatedLoad,
      error: measurement.error || measurement.observedError || null,
      mpe_limit: measurement.mpeLimit || measurement.mpe || measurement.mpeAllowable,
      result: measurement.result === "FAIL" ? "FAIL" : "PASS",
    }));
    const { data, error } = await supabaseAdmin.from("inspection_measurements").insert(rows).select("*");
    if (error) throw fromSupabaseError(error, "Could not create inspection measurements.");
    return data || [];
  },
  addEvidence: async (inspectionUuid, documentId) => {
    const { error } = await supabaseAdmin
      .from("inspection_evidence")
      .insert({ inspection_id: inspectionUuid, document_id: documentId });
    if (error && error.code !== "23505") throw fromSupabaseError(error, "Could not attach inspection evidence.");
  },
  mapInspection,
};
