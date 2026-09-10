import { supabaseAdmin } from "../config/supabase.js";
import { ROLES } from "../constants/roles.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { generateDomainId } from "../utils/id.js";
import { badRequest, conflict, forbidden, fromSupabaseError } from "../utils/errors.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACTIVE_STATUS = "ACTIVE";

const text = (value, max = 200) => {
  const normalized = String(value || "").trim();
  return normalized ? normalized.slice(0, max) : null;
};

const requiredText = (value, label, max = 200) => {
  const normalized = text(value, max);
  if (!normalized) throw badRequest(`${label} is required.`);
  return normalized;
};

const normalizeEmail = (value) => {
  const email = requiredText(value, "Email", 320).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw badRequest("Email must be valid.");
  return email;
};

const requireAssistantController = (user) => {
  if (user?.role !== ROLES.ASSISTANT_CONTROLLER) {
    throw forbidden("Only Assistant Controllers can create LMO accounts.");
  }

  if (!user.district_id || user.district_id === "ALL") {
    throw forbidden("Assistant Controller district scope is not configured.");
  }
};

const getProfileByEmail = async (email) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("user_id, role, email")
    .ilike("email", email)
    .limit(1);
  if (error) throw fromSupabaseError(error, "Could not check profile email.");
  return data?.[0] || null;
};

const deleteLmoByUser = async (userId) => {
  if (userId) await supabaseAdmin.from("lmos").delete().eq("user_id", userId);
};

const deleteProfile = async (userId) => {
  if (userId) await supabaseAdmin.from("profiles").delete().eq("user_id", userId);
};

const deleteAuthUser = async (userId) => {
  if (userId) await supabaseAdmin.auth.admin.deleteUser(userId);
};

export const lmoService = {
  createLmo: async (user, input = {}) => {
    requireAssistantController(user);

    const districtId = user.district_id;
    const email = normalizeEmail(input.email);
    const existingProfile = await getProfileByEmail(email);
    if (existingProfile) {
      throw conflict("A MetriX profile already exists for this email.");
    }

    const officerName = requiredText(input.officerName || input.name, "Officer name", 120);
    const password = requiredText(input.temporaryPassword || input.password, "Temporary password", 128);
    if (password.length < 8) throw badRequest("Temporary password must be at least 8 characters.");

    const lmoId = generateDomainId("LMO", districtId);
    const phone = text(input.phone, 30);
    const designation = text(input.designation, 120) || "Legal Metrology Officer";
    const badgeNumber = text(input.badgeNumber || input.badge_number, 80) || lmoId;
    const jurisdiction = text(input.jurisdiction, 160) || user.jurisdiction || districtId;

    let createdAuthUserId = null;
    let createdLmo = null;

    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          accountRole: ROLES.LMO,
          districtId,
        },
      });
      if (authError || !authData?.user?.id) {
        throw conflict(authError?.message || "Could not create Supabase Auth account.");
      }

      createdAuthUserId = authData.user.id;

      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        user_id: createdAuthUserId,
        role: ROLES.LMO,
        display_name: officerName,
        district_id: districtId,
        email,
        phone,
        status: ACTIVE_STATUS,
      });
      if (profileError) throw fromSupabaseError(profileError, "Could not create LMO profile.");

      const { data: lmo, error: lmoError } = await supabaseAdmin
        .from("lmos")
        .insert({
          lmo_id: lmoId,
          user_id: createdAuthUserId,
          district_id: districtId,
          name: officerName,
          designation,
          badge_number: badgeNumber,
          jurisdiction,
          phone,
          email,
          status: ACTIVE_STATUS,
        })
        .select("id, lmo_id")
        .single();
      if (lmoError) throw fromSupabaseError(lmoError, "Could not create LMO account.");
      createdLmo = lmo;

      await auditRepository.create({
        actor_user_id: user.auth_user_id || user.id,
        actor_role: user.role,
        district_id: districtId,
        action: "LMO_ACCOUNT_CREATED",
        entity_type: "LMO",
        entity_id: lmoId,
        metadata: {
          lmoId,
          authUserId: createdAuthUserId,
          districtId,
          accountEmail: email,
          officerName,
          badgeNumber,
        },
      });

      return userRepository.getById(createdAuthUserId);
    } catch (error) {
      if (createdAuthUserId) {
        if (createdLmo) await deleteLmoByUser(createdAuthUserId);
        await deleteProfile(createdAuthUserId);
        await deleteAuthUser(createdAuthUserId);
      }
      throw error;
    }
  },
};
