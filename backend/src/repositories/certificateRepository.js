import { supabaseAdmin } from "../config/supabase.js";
import { fromSupabaseError } from "../utils/errors.js";

const certificateSelect = `
  *,
  verification_applications:application_id (
    id,
    application_id,
    business_id,
    instrument_id,
    district_id,
    business_snapshot,
    instrument_snapshot,
    verification_location,
    applicant_name,
    businesses:business_id (
      id,
      business_id,
      user_id,
      name
    )
  ),
  inspections:inspection_id (
    id,
    inspection_id,
    seal_number,
    inspection_date,
    lmos:lmo_id (
      id,
      lmo_id,
      name,
      badge_number
    )
  )
`;

const mapCertificate = (row) => {
  if (!row) return null;

  const application = row.verification_applications || {};
  const inspection = row.inspections || {};
  const snapshot = row.public_snapshot || {};
  const businessSnapshot = application.business_snapshot || {};
  const instrumentSnapshot = application.instrument_snapshot || {};

  return {
    uuid: row.id,
    id: row.certificate_id,
    certificate_id: row.certificate_id,
    certificateId: row.certificate_id,
    certificateNumber: row.certificate_number,
    officialNumber: row.official_number,
    applicationUuid: row.application_id,
    applicationId: application.application_id || snapshot.applicationId || row.certificate_id,
    inspectionUuid: row.inspection_id,
    inspectionId: inspection.inspection_id || snapshot.inspectionId,
    businessUuid: row.business_id || application.business_id,
    businessId: application.businesses?.business_id || snapshot.businessId,
    businessUserId: application.businesses?.user_id,
    businessName: snapshot.businessName || businessSnapshot.name || application.businesses?.name,
    ownerName: snapshot.ownerName || snapshot.businessName || businessSnapshot.name,
    applicantName: snapshot.applicantName || application.applicant_name || businessSnapshot.contactPerson,
    district_id: row.district_id || application.district_id || snapshot.district_id,
    district: snapshot.district,
    instrumentUuid: application.instrument_id,
    instrumentId: snapshot.instrumentId || instrumentSnapshot.instrumentId,
    instrumentName: snapshot.instrumentName || instrumentSnapshot.name,
    instrumentType: snapshot.instrumentType || instrumentSnapshot.type || instrumentSnapshot.category,
    manufacturer: snapshot.manufacturer || instrumentSnapshot.manufacturer,
    model: snapshot.model || instrumentSnapshot.model,
    serialNumber: snapshot.serialNumber || instrumentSnapshot.serialNumber,
    capacity: snapshot.capacity || instrumentSnapshot.capacity,
    accuracyClass: snapshot.accuracyClass || instrumentSnapshot.accuracyClass,
    location: snapshot.location,
    verificationDate: snapshot.verificationDate || inspection.inspection_date,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    verifyingOfficer:
      snapshot.verifyingOfficer ||
      (inspection.lmos?.name
        ? `${inspection.lmos.name} (${inspection.lmos.badge_number || inspection.lmos.lmo_id})`
        : undefined),
    approvingOfficer: snapshot.approvingOfficer,
    issuingAuthority: snapshot.issuingAuthority,
    sealNumber: snapshot.sealNumber || inspection.seal_number,
    securityHash: row.security_hash,
    qrVerificationToken: row.qr_verification_token,
    status: row.status,
    remarks: snapshot.remarks,
    createdTimestamp: row.created_at,
    createdAt: row.created_at,
  };
};

const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

const resolveApplicationUuid = async (applicationId) => {
  if (!applicationId) return null;
  if (/^[0-9a-f-]{36}$/i.test(String(applicationId))) return applicationId;
  const { data, error } = await supabaseAdmin
    .from("verification_applications")
    .select("id")
    .eq("application_id", applicationId)
    .maybeSingle();
  if (error) throw fromSupabaseError(error, "Could not resolve certificate application.");
  return data?.id || null;
};

export const certificateRepository = {
  getAll: async () => {
    const { data, error } = await supabaseAdmin
      .from("certificates")
      .select(certificateSelect)
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load certificates.");
    return (data || []).map(mapCertificate);
  },
  getByDistrict: async (district_id) => {
    let query = supabaseAdmin.from("certificates").select(certificateSelect);
    if (district_id && district_id !== "ALL") query = query.eq("district_id", district_id);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load district certificates.");
    return (data || []).map(mapCertificate);
  },
  getByBusiness: async (businessUuid) => {
    if (!businessUuid) return [];
    const { data, error } = await supabaseAdmin
      .from("certificates")
      .select(certificateSelect)
      .eq("business_id", businessUuid)
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load business certificates.");
    return (data || []).map(mapCertificate);
  },
  getById: async (id) => {
    if (!id) return null;
    const normalized = String(id).trim();
    const isUuid = /^[0-9a-f-]{36}$/i.test(normalized);
    const filter = isUuid
      ? `id.eq.${normalized},certificate_id.ilike.${normalized},certificate_number.ilike.${normalized},qr_verification_token.eq.${normalized}`
      : `certificate_id.ilike.${normalized},certificate_number.ilike.${normalized},official_number.ilike.${normalized},qr_verification_token.eq.${normalized}`;

    const { data, error } = await supabaseAdmin
      .from("certificates")
      .select(certificateSelect)
      .or(filter)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load certificate.");
    return mapCertificate(data);
  },
  getByApplicationId: async (applicationId) => {
    const applicationUuid = await resolveApplicationUuid(applicationId);
    if (!applicationUuid) return null;

    const { data, error } = await supabaseAdmin
      .from("certificates")
      .select(certificateSelect)
      .eq("application_id", applicationUuid)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load application certificate.");
    return mapCertificate(data);
  },
  search: async (query, district_id) => {
    const q = String(query || "").trim();
    if (!q) return [];

    let request = supabaseAdmin
      .from("certificates")
      .select(certificateSelect)
      .or(
        `certificate_id.ilike.%${q}%,certificate_number.ilike.%${q}%,official_number.ilike.%${q}%,qr_verification_token.ilike.%${q}%`
      );
    if (district_id && district_id !== "ALL") request = request.eq("district_id", district_id);

    const { data, error } = await request.order("created_at", { ascending: false }).limit(50);
    if (error) throw fromSupabaseError(error, "Could not search certificates.");
    return (data || []).map(mapCertificate);
  },
  create: async (certificateData) => {
    const payload = stripUndefined({
      certificate_id: certificateData.certificateId || certificateData.certificate_id || certificateData.id,
      certificate_number:
        certificateData.certificateNumber ||
        certificateData.certificate_number ||
        certificateData.certificateId ||
        certificateData.id,
      official_number: certificateData.officialNumber || certificateData.official_number,
      application_id: certificateData.applicationUuid,
      inspection_id: certificateData.inspectionUuid,
      business_id: certificateData.businessUuid,
      district_id: certificateData.district_id,
      status: certificateData.status,
      valid_from: certificateData.validFrom,
      valid_until: certificateData.validUntil,
      security_hash: certificateData.securityHash,
      qr_verification_token: certificateData.qrVerificationToken,
      public_snapshot: certificateData.publicSnapshot || certificateData.public_snapshot,
    });

    const { data, error } = await supabaseAdmin
      .from("certificates")
      .insert(payload)
      .select(certificateSelect)
      .single();
    if (error) throw fromSupabaseError(error, "Could not create certificate.");
    return mapCertificate(data);
  },
  approveApplicationTransaction: async ({
    applicationRef,
    actorUserId,
    actorRole,
    validFrom,
    validUntil,
    securityHash,
    officialNumber,
    publicSnapshot,
    remarks,
  }) => {
    const { data, error } = await supabaseAdmin.rpc("approve_application_and_generate_certificate", {
      p_application_ref: applicationRef,
      p_actor_user_id: actorUserId,
      p_actor_role: actorRole,
      p_valid_from: validFrom,
      p_valid_until: validUntil,
      p_security_hash: securityHash,
      p_official_number: officialNumber,
      p_public_snapshot: publicSnapshot,
      p_remarks: remarks || null,
    });
    if (error) throw fromSupabaseError(error, "Could not approve application and generate certificate.");
    const row = Array.isArray(data) ? data[0] : data;
    return mapCertificate(row);
  },
  update: async (id, updateData) => {
    const existing = await certificateRepository.getById(id);
    if (!existing) return null;

    const { data, error } = await supabaseAdmin
      .from("certificates")
      .update(stripUndefined({
        status: updateData.status,
        public_snapshot: updateData.publicSnapshot || updateData.public_snapshot,
      }))
      .eq("id", existing.uuid)
      .select(certificateSelect)
      .single();
    if (error) throw fromSupabaseError(error, "Could not update certificate.");
    return mapCertificate(data);
  },
  mapCertificate,
};
