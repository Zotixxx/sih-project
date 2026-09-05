import { supabaseAdmin } from "../config/supabase.js";
import { ROLES } from "../constants/roles.js";
import { fromSupabaseError } from "../utils/errors.js";

const mapNotification = (row) => ({
  id: row.id,
  recipientUserId: row.recipient_user_id,
  category: row.category,
  title: row.title,
  message: row.message,
  relatedApplicationId: row.related_application_id,
  read: Boolean(row.read_at),
  unread: !row.read_at,
  createdAt: row.created_at,
  timestamp: row.created_at,
  metadata: row.metadata || {},
  targetRole: row.metadata?.targetRole,
  targetUserId: row.metadata?.targetUserId,
  priority: row.metadata?.priority,
  link: row.metadata?.link,
});

export const notificationRepository = {
  getAll: async () => {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw fromSupabaseError(error, "Could not load notifications.");
    return (data || []).map(mapNotification);
  },
  getByUser: async (user) => {
    if (!user) return [];
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("recipient_user_id", user.auth_user_id || user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw fromSupabaseError(error, "Could not load notifications.");
    return (data || []).map(mapNotification);
  },
  getByDistrictAndRole: async (district_id, role) => {
    let query = supabaseAdmin.from("profiles").select("user_id, role, district_id");
    if (role) query = query.eq("role", role);
    if (district_id && district_id !== "ALL") query = query.eq("district_id", district_id);
    const { data, error } = await query;
    if (error) throw fromSupabaseError(error, "Could not load notification recipients.");
    return data || [];
  },
  create: async (notificationData) => {
    let recipientIds = [];

    if (notificationData.recipient_user_id || notificationData.recipientUserId) {
      recipientIds = [notificationData.recipient_user_id || notificationData.recipientUserId];
    } else if (notificationData.recipient_id || notificationData.recipientId) {
      const domainId = notificationData.recipient_id || notificationData.recipientId;
      const table =
        notificationData.targetRole === ROLES.LMO || notificationData.recipient_role === ROLES.LMO
          ? "lmos"
          : notificationData.targetRole === ROLES.ASSISTANT_CONTROLLER ||
            notificationData.recipient_role === ROLES.ASSISTANT_CONTROLLER
          ? "assistant_controllers"
          : "businesses";
      const domainColumn = table === "lmos" ? "lmo_id" : table === "assistant_controllers" ? "ac_id" : "business_id";
      const { data, error } = await supabaseAdmin
        .from(table)
        .select("user_id")
        .eq(domainColumn, domainId)
        .maybeSingle();
      if (error) throw fromSupabaseError(error, "Could not resolve notification recipient.");
      if (data?.user_id) recipientIds = [data.user_id];
    } else if (notificationData.targetRole || notificationData.recipient_role) {
      const targetRole = notificationData.targetRole || notificationData.recipient_role;
      const recipients = await notificationRepository.getByDistrictAndRole(notificationData.district_id, targetRole);
      recipientIds = recipients.map((recipient) => recipient.user_id);
    }

    if (!recipientIds.length) return null;

    const rows = recipientIds.map((recipientUserId) => ({
      recipient_user_id: recipientUserId,
      category: notificationData.category || "GENERAL",
      title: notificationData.title,
      message: notificationData.message,
      related_application_id: notificationData.related_application_uuid || null,
      metadata: {
        district_id: notificationData.district_id,
        targetRole: notificationData.targetRole || notificationData.recipient_role,
        targetUserId: notificationData.targetUserId,
        priority: notificationData.priority,
        link: notificationData.link,
        senderId: notificationData.senderId,
        senderName: notificationData.senderName,
        statutoryRef: notificationData.statutoryRef,
      },
    }));

    const { data, error } = await supabaseAdmin.from("notifications").insert(rows).select("*");
    if (error) throw fromSupabaseError(error, "Could not create notification.");
    const mapped = (data || []).map(mapNotification);
    return notificationData.returnAll ? mapped : mapped[0] || null;
  },
  markRead: async (id, user) => {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("recipient_user_id", user.auth_user_id || user.id)
      .select("*")
      .single();
    if (error) throw fromSupabaseError(error, "Could not update notification.");
    return mapNotification(data);
  },
};
