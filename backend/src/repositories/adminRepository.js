import { supabaseAdmin } from "../config/supabase.js";
import { fromSupabaseError } from "../utils/errors.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

const ACTIVE_STATUS = "ACTIVE";
const INACTIVE_STATUS = "INACTIVE";
export const ADMIN_ACCOUNT_STATUSES = [ACTIVE_STATUS, INACTIVE_STATUS];

const AC_SELECT = `
  id,
  ac_id,
  user_id,
  district_id,
  name,
  designation,
  jurisdiction,
  organization,
  status,
  created_at,
  updated_at,
  districts:district_id (
    id,
    name,
    state,
    zone,
    controller_office
  )
`;

const LMO_SELECT = `
  id,
  lmo_id,
  user_id,
  district_id,
  name,
  designation,
  badge_number,
  jurisdiction,
  status,
  created_at,
  updated_at,
  districts:district_id (
    id,
    name,
    state,
    zone,
    controller_office
  )
`;

const mapDistrict = (row) =>
  row
    ? {
        id: row.id,
        code: row.id,
        name: row.name,
        state: row.state,
        zone: row.zone,
        controllerOffice: row.controller_office,
      }
    : null;

const mapAssistantController = (row) => {
  if (!row) return null;
  const profile = row.profiles || {};
  return {
    uuid: row.id,
    id: row.ac_id,
    acId: row.ac_id,
    authUserId: row.user_id,
    userId: row.user_id,
    accountEmail: profile.email,
    email: profile.email,
    officerName: row.name || profile.display_name,
    name: row.name || profile.display_name,
    displayName: profile.display_name || row.name,
    phone: profile.phone,
    designation: row.designation,
    jurisdiction: row.jurisdiction,
    organization: row.organization,
    districtId: row.district_id,
    district_id: row.district_id,
    district: mapDistrict(row.districts),
    status: row.status || profile.status || ACTIVE_STATUS,
    profileStatus: profile.status || ACTIVE_STATUS,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapLmo = (row, assignedAc = null) => {
  if (!row) return null;
  const profile = row.profiles || {};
  return {
    uuid: row.id,
    id: row.lmo_id,
    lmoId: row.lmo_id,
    officerId: row.lmo_id,
    authUserId: row.user_id,
    userId: row.user_id,
    accountEmail: profile.email,
    email: profile.email,
    officerName: row.name || profile.display_name,
    name: row.name || profile.display_name,
    phone: profile.phone,
    designation: row.designation,
    badgeNumber: row.badge_number || row.lmo_id,
    jurisdiction: row.jurisdiction,
    districtId: row.district_id,
    district_id: row.district_id,
    district: mapDistrict(row.districts),
    assignedAssistantController: assignedAc,
    status: row.status || profile.status || ACTIVE_STATUS,
    profileStatus: profile.status || ACTIVE_STATUS,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const loadProfilesByUserId = async (userIds) => {
  const uniqueIds = Array.from(new Set((userIds || []).filter(Boolean)));
  if (!uniqueIds.length) return new Map();

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("user_id, display_name, email, phone, status, created_at, updated_at")
    .in("user_id", uniqueIds);
  if (error) throw fromSupabaseError(error, "Could not load account profiles.");

  return new Map((data || []).map((profile) => [profile.user_id, profile]));
};

const withProfiles = async (rows) => {
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) return [];

  const profilesByUserId = await loadProfilesByUserId(list.map((row) => row.user_id));
  return list.map((row) => ({
    ...row,
    profiles: profilesByUserId.get(row.user_id) || null,
  }));
};

const withProfile = async (row) => {
  if (!row) return null;
  return (await withProfiles([row]))[0] || null;
};

const mapAudit = (row) => ({
  id: row.id,
  actorUserId: row.actor_user_id,
  actorRole: row.actor_role,
  action: row.action,
  entityType: row.entity_type,
  entityId: row.entity_id,
  districtId: row.district_id,
  metadata: row.metadata || {},
  createdAt: row.created_at,
  timestamp: row.created_at,
});

const uniqueBy = (rows, keyFn) => {
  const map = new Map();
  rows.filter(Boolean).forEach((row) => {
    const key = keyFn(row);
    if (key && !map.has(key)) map.set(key, row);
  });
  return Array.from(map.values());
};

const compact = (value) => String(value || "").trim();
const searchPattern = (value) => `%${compact(value).slice(0, 120)}%`;
const orSearchPattern = (value) => searchPattern(value).replace(/[(),]/g, " ");

const applyCommonFilters = (query, { districtId, status } = {}) => {
  let next = query;
  if (districtId) next = next.eq("district_id", districtId);
  if (status) next = next.eq("status", status);
  return next;
};

const fetchRows = async ({ table, select, filters = {}, column, pattern, inColumn, inValues, cap }) => {
  let query = supabaseAdmin.from(table).select(select);
  query = applyCommonFilters(query, filters);
  if (column && pattern) query = query.ilike(column, pattern);
  if (inColumn && Array.isArray(inValues) && inValues.length) query = query.in(inColumn, inValues);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(cap);
  if (error) throw fromSupabaseError(error, `Could not search ${table}.`);
  return data || [];
};

const searchProfiles = async ({ role, search, cap }) => {
  const pattern = searchPattern(search);
  const columns = ["display_name", "email", "phone"];
  const results = await Promise.all(
    columns.map(async (column) => {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .eq("role", role)
        .ilike(column, pattern)
        .limit(cap);
      if (error) throw fromSupabaseError(error, "Could not search profiles.");
      return data || [];
    })
  );
  return uniqueBy(results.flat(), (row) => row.user_id).map((row) => row.user_id);
};

const searchDistrictIds = async ({ search, cap }) => {
  const pattern = searchPattern(search);
  const columns = ["id", "name", "state"];
  const results = await Promise.all(
    columns.map(async (column) => {
      const { data, error } = await supabaseAdmin
        .from("districts")
        .select("id")
        .ilike(column, pattern)
        .limit(cap);
      if (error) throw fromSupabaseError(error, "Could not search districts.");
      return data || [];
    })
  );
  return uniqueBy(results.flat(), (row) => row.id).map((row) => row.id);
};

const withLimitedSearch = async ({
  table,
  select,
  filters,
  search,
  columns,
  role,
  mapper,
  pagination,
  hydrateRows = async (rows) => rows,
}) => {
  const hasSearch = Boolean(compact(search));
  const hasFilter = Boolean(filters.districtId || filters.status);
  if (!hasSearch && !hasFilter) {
    return paginatedResponse([], pagination, 0);
  }

  if (!hasSearch) {
    let query = supabaseAdmin.from(table).select(select, { count: "exact" });
    query = applyCommonFilters(query, filters);
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(pagination.from, pagination.to);
    if (error) throw fromSupabaseError(error, `Could not load ${table}.`);
    const hydrated = await hydrateRows(data || []);
    return paginatedResponse(hydrated.map(mapper), pagination, count || 0);
  }

  const cap = Math.min(pagination.to + pagination.limit + 1, 100);
  const pattern = searchPattern(search);
  const batches = await Promise.all([
    ...columns.map((column) => fetchRows({ table, select, filters, column, pattern, cap })),
    searchProfiles({ role, search, cap }).then((ids) =>
      ids.length ? fetchRows({ table, select, filters, inColumn: "user_id", inValues: ids, cap }) : []
    ),
    searchDistrictIds({ search, cap }).then((ids) =>
      ids.length ? fetchRows({ table, select, filters, inColumn: "district_id", inValues: ids, cap }) : []
    ),
  ]);

  const rawMerged = uniqueBy(batches.flat(), (row) => row.id)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const merged = (await hydrateRows(rawMerged)).map(mapper);
  const items = merged.slice(pagination.offset, pagination.offset + pagination.limit);
  return {
    ...paginatedResponse(items, pagination, null),
    hasMore: merged.length > pagination.offset + pagination.limit,
  };
};

export const adminRepository = {
  countRows: async (table, filters = {}) => {
    let query = supabaseAdmin.from(table).select("id", { count: "exact", head: true });
    query = applyCommonFilters(query, filters);
    const { count, error } = await query;
    if (error) throw fromSupabaseError(error, `Could not count ${table}.`);
    return count || 0;
  },

  checkDatabase: async () => {
    const { error } = await supabaseAdmin.from("districts").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw fromSupabaseError(error, "Database health check failed.");
    return true;
  },

  checkAuth: async () => {
    const { error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) throw error;
    return true;
  },

  checkStorage: async () => {
    const { error } = await supabaseAdmin.storage.listBuckets();
    if (error) throw error;
    return true;
  },

  getAssistantControllerByDistrict: async (districtId) => {
    const { data, error } = await supabaseAdmin
      .from("assistant_controllers")
      .select(AC_SELECT)
      .eq("district_id", districtId)
      .limit(1);
    if (error) throw fromSupabaseError(error, "Could not load Assistant Controller.");
    return mapAssistantController(await withProfile(data?.[0]));
  },

  getAssistantControllerByRef: async (ref) => {
    const value = compact(ref);
    if (!value) return null;

    const tryQuery = async (column, target) => {
      const { data, error } = await supabaseAdmin
        .from("assistant_controllers")
        .select(AC_SELECT)
        .eq(column, target)
        .limit(1);
      if (error) throw fromSupabaseError(error, "Could not load Assistant Controller.");
      return data?.[0] || null;
    };

    if (/^[0-9a-f-]{36}$/i.test(value)) {
      const byId = await tryQuery("id", value);
      if (byId) return mapAssistantController(await withProfile(byId));
      const byUser = await tryQuery("user_id", value);
      if (byUser) return mapAssistantController(await withProfile(byUser));
    }

    const byAcId = await tryQuery("ac_id", value.toUpperCase());
    if (byAcId) return mapAssistantController(await withProfile(byAcId));

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("role", "ASSISTANT_CONTROLLER")
      .ilike("email", value)
      .limit(1);
    if (profileError) throw fromSupabaseError(profileError, "Could not resolve Assistant Controller profile.");
    if (profile?.[0]?.user_id) {
      const byProfile = await tryQuery("user_id", profile[0].user_id);
      return byProfile ? mapAssistantController(await withProfile(byProfile)) : null;
    }

    return null;
  },

  searchAssistantControllers: async (params = {}) => {
    const pagination = getPagination(params);
    return withLimitedSearch({
      table: "assistant_controllers",
      select: AC_SELECT,
      filters: { districtId: params.districtId, status: params.status },
      search: params.search,
      columns: ["name", "ac_id", "designation", "jurisdiction", "organization"],
      role: "ASSISTANT_CONTROLLER",
      mapper: mapAssistantController,
      pagination,
      hydrateRows: withProfiles,
    });
  },

  createAssistantControllerRecord: async (data) => {
    const { data: ac, error } = await supabaseAdmin
      .from("assistant_controllers")
      .insert({
        ac_id: data.acId,
        user_id: data.userId,
        district_id: data.districtId,
        name: data.officerName,
        designation: data.designation,
        jurisdiction: data.jurisdiction,
        organization: data.organization,
        status: data.status || ACTIVE_STATUS,
      })
      .select(AC_SELECT)
      .single();
    if (error) throw fromSupabaseError(error, "Could not create Assistant Controller account.");
    return mapAssistantController(await withProfile(ac));
  },

  updateAssistantControllerRecord: async (id, data) => {
    const { data: updated, error } = await supabaseAdmin
      .from("assistant_controllers")
      .update({
        name: data.officerName,
        designation: data.designation,
        jurisdiction: data.jurisdiction,
        organization: data.organization,
        status: data.status,
      })
      .eq("id", id)
      .select(AC_SELECT)
      .single();
    if (error) throw fromSupabaseError(error, "Could not update Assistant Controller account.");
    return mapAssistantController(await withProfile(updated));
  },

  createProfile: async (profile) => {
    const { error } = await supabaseAdmin.from("profiles").insert(profile);
    if (error) throw fromSupabaseError(error, "Could not create MetriX profile.");
  },

  updateProfile: async (userId, patch) => {
    const { error } = await supabaseAdmin.from("profiles").update(patch).eq("user_id", userId);
    if (error) throw fromSupabaseError(error, "Could not update MetriX profile.");
  },

  deleteProfile: async (userId) => {
    await supabaseAdmin.from("profiles").delete().eq("user_id", userId);
  },

  deleteAssistantControllerByUser: async (userId) => {
    if (userId) await supabaseAdmin.from("assistant_controllers").delete().eq("user_id", userId);
  },

  deleteAuthUser: async (userId) => {
    if (userId) await supabaseAdmin.auth.admin.deleteUser(userId);
  },

  getProfileByEmail: async (email) => {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("user_id, role, email")
      .ilike("email", compact(email))
      .limit(1);
    if (error) throw fromSupabaseError(error, "Could not check profile email.");
    return data?.[0] || null;
  },

  getLmoByRef: async (ref) => {
    const value = compact(ref);
    if (!value) return null;

    const tryQuery = async (column, target) => {
      const { data, error } = await supabaseAdmin.from("lmos").select(LMO_SELECT).eq(column, target).limit(1);
      if (error) throw fromSupabaseError(error, "Could not load LMO.");
      return data?.[0] || null;
    };

    if (/^[0-9a-f-]{36}$/i.test(value)) {
      const byId = await tryQuery("id", value);
      if (byId) {
        const [lmo, assignedAc] = await Promise.all([
          withProfile(byId),
          adminRepository.getAssistantControllerByDistrict(byId.district_id),
        ]);
        return mapLmo(lmo, assignedAc);
      }

      const byUser = await tryQuery("user_id", value);
      if (byUser) {
        const [lmo, assignedAc] = await Promise.all([
          withProfile(byUser),
          adminRepository.getAssistantControllerByDistrict(byUser.district_id),
        ]);
        return mapLmo(lmo, assignedAc);
      }
    }

    const byLmoId = await tryQuery("lmo_id", value.toUpperCase());
    if (byLmoId) {
      const [lmo, assignedAc] = await Promise.all([
        withProfile(byLmoId),
        adminRepository.getAssistantControllerByDistrict(byLmoId.district_id),
      ]);
      return mapLmo(lmo, assignedAc);
    }

    const byBadge = await tryQuery("badge_number", value);
    if (byBadge) {
      const [lmo, assignedAc] = await Promise.all([
        withProfile(byBadge),
        adminRepository.getAssistantControllerByDistrict(byBadge.district_id),
      ]);
      return mapLmo(lmo, assignedAc);
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("role", "LMO")
      .ilike("email", value)
      .limit(1);
    if (profileError) throw fromSupabaseError(profileError, "Could not resolve LMO profile.");
    if (profile?.[0]?.user_id) {
      const byProfile = await tryQuery("user_id", profile[0].user_id);
      if (!byProfile) return null;
      const [lmo, assignedAc] = await Promise.all([
        withProfile(byProfile),
        adminRepository.getAssistantControllerByDistrict(byProfile.district_id),
      ]);
      return mapLmo(lmo, assignedAc);
    }

    return null;
  },

  searchLmos: async (params = {}) => {
    const pagination = getPagination(params);
    const result = await withLimitedSearch({
      table: "lmos",
      select: LMO_SELECT,
      filters: { districtId: params.districtId, status: params.status },
      search: params.search,
      columns: ["name", "lmo_id", "badge_number", "designation", "jurisdiction"],
      role: "LMO",
      mapper: (row) => mapLmo(row),
      pagination,
      hydrateRows: withProfiles,
    });

    const districtIds = uniqueBy(result.items, (item) => item.districtId).map((item) => item.districtId);
    const acByDistrict = new Map();
    await Promise.all(
      districtIds.map(async (districtId) => {
        if (!districtId) return;
        acByDistrict.set(districtId, await adminRepository.getAssistantControllerByDistrict(districtId));
      })
    );

    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        assignedAssistantController: acByDistrict.get(item.districtId) || null,
      })),
    };
  },

  searchAuditLogs: async (params = {}) => {
    const pagination = getPagination(params);
    let query = supabaseAdmin.from("audit_logs").select("*", { count: "exact" });

    if (params.search) {
      const pattern = orSearchPattern(params.search);
      query = query.or(`action.ilike.${pattern},entity_type.ilike.${pattern},entity_id.ilike.${pattern}`);
    }
    if (params.actorRole) query = query.eq("actor_role", params.actorRole);
    if (params.action) query = query.ilike("action", searchPattern(params.action));
    if (params.entityType) query = query.ilike("entity_type", searchPattern(params.entityType));
    if (params.entityId) query = query.ilike("entity_id", searchPattern(params.entityId));
    if (params.districtId) query = query.eq("district_id", params.districtId);
    if (params.dateFrom) query = query.gte("created_at", params.dateFrom);
    if (params.dateTo) query = query.lte("created_at", params.dateTo);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(pagination.from, pagination.to);
    if (error) throw fromSupabaseError(error, "Could not load audit logs.");
    return paginatedResponse((data || []).map(mapAudit), pagination, count || 0);
  },

  mapAssistantController,
  mapLmo,
};
