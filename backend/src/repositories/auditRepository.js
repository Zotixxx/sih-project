import { supabaseAdmin } from "../config/supabase.js";
import { fromSupabaseError } from "../utils/errors.js";

const mapAudit = (row) => ({
  id: row.id,
  actorUserId: row.actor_user_id,
  actorRole: row.actor_role,
  action: row.action,
  entityType: row.entity_type,
  entity_type: row.entity_type,
  entityId: row.entity_id,
  entity_id: row.entity_id,
  metadata: row.metadata || {},
  district_id: row.district_id,
  timestamp: row.created_at,
  createdAt: row.created_at,
});

export const auditRepository = {
  getAll: async () => {
    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load audit logs.");
    return (data || []).map(mapAudit);
  },
  getByDistrict: async (district_id) => {
    let query = supabaseAdmin.from("audit_logs").select("*");
    if (district_id && district_id !== "ALL") query = query.eq("district_id", district_id);
    const { data, error } = await query.order("created_at", { ascending: false }).limit(100);
    if (error) throw fromSupabaseError(error, "Could not load audit logs.");
    return (data || []).map(mapAudit);
  },
  create: async (auditData) => {
    const metadata = {
      ...(auditData.metadata || {}),
      ...(auditData.remarks ? { remarks: auditData.remarks } : {}),
      ...(auditData.details ? { details: auditData.details } : {}),
      ...(auditData.actor ? { actor: auditData.actor } : {}),
    };

    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        actor_user_id: auditData.actor_user_id || auditData.actor_id,
        actor_role: auditData.actor_role,
        district_id: auditData.district_id || null,
        action: auditData.action,
        entity_type: auditData.entity_type || auditData.entityType,
        entity_id: auditData.entity_id || auditData.entityId,
        metadata,
      })
      .select("*")
      .single();
    if (error) throw fromSupabaseError(error, "Could not create audit log.");
    return mapAudit(data);
  },
};
