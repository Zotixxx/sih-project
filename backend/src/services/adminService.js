import { supabaseAdmin } from "../config/supabase.js";
import { ROLES } from "../constants/roles.js";
import { adminRepository, ADMIN_ACCOUNT_STATUSES } from "../repositories/adminRepository.js";
import { auditRepository } from "../repositories/auditRepository.js";
import { districtRepository } from "../repositories/districtRepository.js";
import { assertDomainId, generateDomainId } from "../utils/id.js";
import { badRequest, conflict, forbidden, notFound } from "../utils/errors.js";

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

const normalizeStatus = (value) => {
  const status = text(value || ACTIVE_STATUS, 30)?.toUpperCase();
  if (!ADMIN_ACCOUNT_STATUSES.includes(status)) {
    throw badRequest(`Status must be one of: ${ADMIN_ACCOUNT_STATUSES.join(", ")}.`);
  }
  return status;
};

const normalizeOptionalDomainId = (value, label) => {
  const normalized = text(value, 64);
  if (!normalized) return null;
  try {
    return assertDomainId(normalized, label);
  } catch {
    throw badRequest(`${label} must be 2-64 characters and use only letters, numbers, hyphen, or underscore.`);
  }
};

const requireSystemAdmin = (user) => {
  if (user?.role !== ROLES.SYSTEM_ADMIN) {
    throw forbidden("Only System Admin users can access this operation.");
  }
};

const publicError = (error) => ({
  status: error ? "Unavailable" : "Healthy",
  message: error ? "Check failed." : "Check passed.",
});

const runHealthCheck = async (fn) => {
  const startedAt = Date.now();
  try {
    await fn();
    return {
      status: "Healthy",
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ...publicError(error),
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    };
  }
};

const normalizeSearchParams = (query = {}) => {
  const districtId = query.districtId || query.district_id || query.district;
  return {
    search: text(query.search || query.q, 120),
    districtId: districtId ? assertDomainId(String(districtId), "District") : null,
    status: query.status ? normalizeStatus(query.status) : null,
    page: query.page,
    limit: query.limit,
    pageSize: query.pageSize,
  };
};

const normalizeAuditParams = (query = {}) => ({
  search: text(query.search || query.q, 120),
  action: text(query.action, 80),
  entityType: text(query.entityType || query.entity_type, 80),
  entityId: text(query.entityId || query.entity_id, 120),
  actorRole: query.actorRole || query.actor_role ? String(query.actorRole || query.actor_role).trim().toUpperCase() : null,
  districtId: query.districtId || query.district_id ? assertDomainId(String(query.districtId || query.district_id), "District") : null,
  dateFrom: text(query.dateFrom || query.from, 40),
  dateTo: text(query.dateTo || query.to, 40),
  page: query.page,
  limit: query.limit,
  pageSize: query.pageSize,
});

export const adminService = {
  getDashboard: async (user) => {
    requireSystemAdmin(user);

    const [assistantControllers, activeLmos, businesses, authentication, database, storage] = await Promise.all([
      adminRepository.countRows("assistant_controllers"),
      adminRepository.countRows("lmos", { status: ACTIVE_STATUS }),
      adminRepository.countRows("businesses"),
      runHealthCheck(adminRepository.checkAuth),
      runHealthCheck(adminRepository.checkDatabase),
      runHealthCheck(adminRepository.checkStorage),
    ]);

    return {
      counts: {
        assistantControllers,
        activeLmos,
        businesses,
      },
      health: {
        authentication,
        database,
        storage,
        api: {
          status: "Healthy",
          latencyMs: 0,
          checkedAt: new Date().toISOString(),
          message: "Admin API request reached Express.",
        },
      },
    };
  },

  searchAssistantControllers: async (user, query) => {
    requireSystemAdmin(user);
    return adminRepository.searchAssistantControllers(normalizeSearchParams(query));
  },

  getAssistantController: async (user, id) => {
    requireSystemAdmin(user);
    const ac = await adminRepository.getAssistantControllerByRef(id);
    if (!ac) throw notFound("Assistant Controller account not found.");
    return ac;
  },

  createAssistantController: async (user, input = {}) => {
    requireSystemAdmin(user);

    const districtId = assertDomainId(String(input.districtId || input.district_id || ""), "District");
    const district = await districtRepository.getById(districtId);
    if (!district) throw badRequest(`District '${districtId}' is not configured.`);

    const existingDistrictAccount = await adminRepository.getAssistantControllerByDistrict(districtId);
    if (existingDistrictAccount) {
      throw conflict(`Assistant Controller account already exists for ${district.name || districtId}.`);
    }

    const email = normalizeEmail(input.email);
    const existingProfile = await adminRepository.getProfileByEmail(email);
    if (existingProfile) {
      throw conflict("A MetriX profile already exists for this email.");
    }

    const officerName = requiredText(input.officerName || input.name, "Current officer name", 120);
    const password = requiredText(input.temporaryPassword || input.password, "Temporary password", 128);
    if (password.length < 8) throw badRequest("Temporary password must be at least 8 characters.");

    const status = normalizeStatus(input.status);
    const acId =
      normalizeOptionalDomainId(input.acId ?? input.ac_id, "Assistant Controller ID") ||
      generateDomainId("AC", districtId);

    let createdAuthUserId = null;
    let createdAc = null;
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          accountRole: ROLES.ASSISTANT_CONTROLLER,
          districtId,
        },
      });
      if (authError || !authData?.user?.id) {
        throw conflict(authError?.message || "Could not create Supabase Auth account.");
      }

      createdAuthUserId = authData.user.id;
      await adminRepository.createProfile({
        user_id: createdAuthUserId,
        role: ROLES.ASSISTANT_CONTROLLER,
        display_name: officerName,
        district_id: districtId,
        email,
        phone: text(input.phone, 30),
        status,
      });

      createdAc = await adminRepository.createAssistantControllerRecord({
        acId,
        userId: createdAuthUserId,
        districtId,
        officerName,
        designation: text(input.designation, 120) || "Assistant Controller",
        jurisdiction: text(input.jurisdiction, 160) || district.name,
        organization: text(input.organization, 160) || district.controllerOffice || `Office of the Assistant Controller, ${district.name}`,
        status,
      });

      await auditRepository.create({
        actor_user_id: user.auth_user_id || user.id,
        actor_role: user.role,
        district_id: districtId,
        action: "ASSISTANT_CONTROLLER_ACCOUNT_CREATED",
        entity_type: "ASSISTANT_CONTROLLER",
        entity_id: createdAc.acId,
        metadata: {
          acId: createdAc.acId,
          authUserId: createdAuthUserId,
          districtId,
          accountEmail: email,
          officerName,
        },
      });

      return createdAc;
    } catch (error) {
      if (createdAuthUserId) {
        if (createdAc) await adminRepository.deleteAssistantControllerByUser(createdAuthUserId);
        await adminRepository.deleteProfile(createdAuthUserId);
        await adminRepository.deleteAuthUser(createdAuthUserId);
      }
      throw error;
    }
  },

  updateAssistantController: async (user, id, input = {}) => {
    requireSystemAdmin(user);
    const existing = await adminRepository.getAssistantControllerByRef(id);
    if (!existing) throw notFound("Assistant Controller account not found.");

    const officerName = requiredText(input.officerName || input.name || existing.officerName, "Current officer name", 120);
    const status = normalizeStatus(input.status || existing.status);
    const phone = text(input.phone, 30);
    const designation = text(input.designation, 120) || existing.designation || "Assistant Controller";
    const jurisdiction = text(input.jurisdiction, 160) || existing.jurisdiction;
    const organization = text(input.organization, 160) || existing.organization;

    await adminRepository.updateProfile(existing.authUserId, {
      display_name: officerName,
      phone,
      status,
    });

    const updated = await adminRepository.updateAssistantControllerRecord(existing.uuid, {
      officerName,
      designation,
      jurisdiction,
      organization,
      status,
    });

    await auditRepository.create({
      actor_user_id: user.auth_user_id || user.id,
      actor_role: user.role,
      district_id: existing.districtId,
      action: "ASSISTANT_CONTROLLER_OFFICER_UPDATED",
      entity_type: "ASSISTANT_CONTROLLER",
      entity_id: existing.acId,
      metadata: {
        acId: existing.acId,
        authUserId: existing.authUserId,
        districtId: existing.districtId,
        before: {
          officerName: existing.officerName,
          phone: existing.phone,
          designation: existing.designation,
          jurisdiction: existing.jurisdiction,
          organization: existing.organization,
          status: existing.status,
        },
        after: {
          officerName: updated.officerName,
          phone: updated.phone,
          designation: updated.designation,
          jurisdiction: updated.jurisdiction,
          organization: updated.organization,
          status: updated.status,
        },
      },
    });

    return updated;
  },

  searchLmos: async (user, query) => {
    requireSystemAdmin(user);
    return adminRepository.searchLmos(normalizeSearchParams(query));
  },

  getLmo: async (user, id) => {
    requireSystemAdmin(user);
    const lmo = await adminRepository.getLmoByRef(id);
    if (!lmo) throw notFound("LMO not found.");
    return lmo;
  },

  searchAuditLogs: async (user, query) => {
    requireSystemAdmin(user);
    const params = normalizeAuditParams(query);
    if (params.actorRole && !Object.values(ROLES).includes(params.actorRole)) {
      throw badRequest("Actor role filter is invalid.");
    }
    return adminRepository.searchAuditLogs(params);
  },
};
