import { documentRepository } from "../repositories/documentRepository.js";
import { businessRepository } from "../repositories/businessRepository.js";
import { ROLES } from "../constants/roles.js";
import { forbidden, unprocessable } from "../utils/errors.js";

export const documentController = {
  upload: async (req, res, next) => {
    try {
      let businessUuid = null;
      const bucket = req.body.bucket;

      if (req.user.role === ROLES.BUSINESS) {
        if (!["business-documents", "instrument-documents"].includes(bucket)) {
          throw forbidden("Business users can upload only business and instrument documents.");
        }
        const business = await businessRepository.getRowByUserId(req.user.auth_user_id || req.user.id);
        if (!business) throw unprocessable("Create the business role record in Supabase before uploading documents.");
        businessUuid = business?.id || null;
      } else if (req.user.role === ROLES.LMO) {
        if (bucket !== "inspection-evidence") {
          throw forbidden("LMO users can upload only inspection evidence.");
        }
      } else if (req.user.role !== ROLES.SYSTEM_ADMIN) {
        throw forbidden("Role is not authorized to upload documents.");
      }

      const document = await documentRepository.upload({
        user: req.user,
        bucket,
        fileName: req.body.fileName,
        mimeType: req.body.mimeType,
        base64: req.body.base64,
        businessUuid,
      });

      return res.status(201).json({
        success: true,
        data: {
          documentId: document.id,
          fileName: document.original_name,
          fileSize: document.file_size,
          fileType: document.mime_type,
          storageBucket: document.storage_bucket,
          storagePath: document.storage_path,
          uploadedDate: document.created_at?.split("T")[0],
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
