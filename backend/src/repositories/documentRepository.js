import { supabaseAdmin } from "../config/supabase.js";
import { fromSupabaseError, forbidden, notFound } from "../utils/errors.js";
import { sanitizeStorageName } from "../utils/id.js";

const ALLOWED_BUCKETS = new Set(["business-documents", "instrument-documents", "inspection-evidence"]);
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const documentRepository = {
  upload: async ({ user, bucket, fileName, mimeType, base64, businessUuid, instrumentUuid, applicationUuid, inspectionUuid }) => {
    if (!ALLOWED_BUCKETS.has(bucket)) {
      const err = new Error("Unsupported storage bucket.");
      err.statusCode = 400;
      throw err;
    }
    if (!fileName || !mimeType || !base64) {
      const err = new Error("fileName, mimeType and base64 are required for document upload.");
      err.statusCode = 400;
      throw err;
    }
    if (!["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(mimeType)) {
      const err = new Error("Unsupported document MIME type.");
      err.statusCode = 400;
      throw err;
    }

    const fileBuffer = Buffer.from(base64, "base64");
    if (!fileBuffer.length || fileBuffer.length > MAX_FILE_BYTES) {
      const err = new Error("Document size must be greater than 0 and not exceed 10 MB.");
      err.statusCode = 400;
      throw err;
    }

    const storagePath = `${user.auth_user_id || user.id}/${Date.now()}-${sanitizeStorageName(fileName)}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });
    if (uploadError) throw fromSupabaseError(uploadError, "Could not upload document.");

    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert({
        storage_bucket: bucket,
        storage_path: storagePath,
        original_name: fileName,
        mime_type: mimeType,
        file_size: fileBuffer.length,
        uploaded_by: user.auth_user_id || user.id,
        business_id: businessUuid || null,
        instrument_id: instrumentUuid || null,
        application_id: applicationUuid || null,
        inspection_id: inspectionUuid || null,
      })
      .select("*")
      .single();
    if (error) throw fromSupabaseError(error, "Could not create document metadata.");
    return data;
  },

  getById: async (id) => {
    const { data, error } = await supabaseAdmin.from("documents").select("*").eq("id", id).maybeSingle();
    if (error) throw fromSupabaseError(error, "Could not load document.");
    return data || null;
  },

  assertUploader: async (documentId, user) => {
    const document = await documentRepository.getById(documentId);
    if (!document) throw notFound("Document not found.");
    if (document.uploaded_by !== (user.auth_user_id || user.id) && user.role !== "SYSTEM_ADMIN") {
      throw forbidden("Document belongs to another user.");
    }
    return document;
  },

  attachToInstrument: async (documentId, instrumentUuid, businessUuid) => {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .update({ instrument_id: instrumentUuid, business_id: businessUuid })
      .eq("id", documentId)
      .select("*")
      .single();
    if (error) throw fromSupabaseError(error, "Could not attach document to instrument.");
    return data;
  },

  attachToApplication: async (documentId, applicationUuid) => {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .update({ application_id: applicationUuid })
      .eq("id", documentId)
      .select("*")
      .single();
    if (error) throw fromSupabaseError(error, "Could not attach document to application.");
    return data;
  },

  attachToInspection: async (documentId, inspectionUuid) => {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .update({ inspection_id: inspectionUuid })
      .eq("id", documentId)
      .select("*")
      .single();
    if (error) throw fromSupabaseError(error, "Could not attach document to inspection.");
    return data;
  },

  createSignedUrl: async (document, expiresIn = 300) => {
    const { data, error } = await supabaseAdmin.storage
      .from(document.storage_bucket)
      .createSignedUrl(document.storage_path, expiresIn);
    if (error) throw fromSupabaseError(error, "Could not create signed document URL.");
    return data?.signedUrl;
  },
};
