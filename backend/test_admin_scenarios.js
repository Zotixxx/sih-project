import { createClient } from "@supabase/supabase-js";

const API_BASE = process.env.METRIX_API_BASE_URL || "http://localhost:5001/api";
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const REQUIRED_ENV = [
  "METRIX_TEST_ADMIN_EMAIL",
  "METRIX_TEST_ADMIN_PASSWORD",
  "METRIX_ADMIN_TEST_AC_EMAIL",
  "METRIX_ADMIN_TEST_AC_PASSWORD",
  "METRIX_ADMIN_TEST_DISTRICT_ID",
];

const missingEnv = () => {
  const missing = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_PUBLISHABLE_KEY) missing.push("SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  missing.push(...REQUIRED_ENV.filter((key) => !process.env[key]));
  return missing;
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
};

const request = async ({ token, endpoint, method = "GET", body, expected = [200], label }) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({}));
  if (!expected.includes(res.status)) {
    const message = payload?.error?.message || payload?.message || `HTTP ${res.status}`;
    throw new Error(`${label || method + " " + endpoint} failed: expected ${expected.join("/")}, got ${res.status}: ${message}`);
  }
  return { status: res.status, payload };
};

const signIn = async ({ email, password, expectedRole, label }) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`${label} Supabase sign-in failed: ${error?.message || "No session returned."}`);
  }

  const profile = await request({
    token: data.session.access_token,
    endpoint: "/auth/profile",
    label: `${label} profile`,
  });

  assert(profile.payload.data?.role === expectedRole, `${label} resolves role ${expectedRole}`);
  return {
    token: data.session.access_token,
    user: profile.payload.data,
  };
};

const optionalRoleReject = async ({ emailKey, passwordKey, expectedRole, label }) => {
  if (!process.env[emailKey] || !process.env[passwordKey]) return;
  const user = await signIn({
    email: process.env[emailKey],
    password: process.env[passwordKey],
    expectedRole,
    label,
  });
  const rejected = await request({
    token: user.token,
    endpoint: "/admin/dashboard",
    expected: [403],
    label: `${label} admin dashboard rejection`,
  });
  assert(rejected.status === 403, `${label} cannot access Admin APIs`);
};

async function main() {
  const missing = missingEnv();
  if (missing.length) {
    console.error("NOT TESTED System Admin workflow credentials are missing.");
    console.error(`Missing: ${missing.join(", ")}`);
    process.exit(2);
  }

  await request({ endpoint: "/health", expected: [200], label: "API health" });

  const admin = await signIn({
    email: process.env.METRIX_TEST_ADMIN_EMAIL,
    password: process.env.METRIX_TEST_ADMIN_PASSWORD,
    expectedRole: "SYSTEM_ADMIN",
    label: "System Admin",
  });

  const dashboard = await request({
    token: admin.token,
    endpoint: "/admin/dashboard",
    label: "Admin dashboard",
  });
  assert(typeof dashboard.payload.data?.counts?.assistantControllers === "number", "Admin dashboard returns real AC count");
  assert(dashboard.payload.data?.health?.database?.status, "Admin dashboard returns database health");

  await optionalRoleReject({
    emailKey: "METRIX_TEST_BUSINESS_EMAIL",
    passwordKey: "METRIX_TEST_BUSINESS_PASSWORD",
    expectedRole: "BUSINESS",
    label: "Business",
  });
  await optionalRoleReject({
    emailKey: "METRIX_TEST_LMO_EMAIL",
    passwordKey: "METRIX_TEST_LMO_PASSWORD",
    expectedRole: "LMO",
    label: "LMO",
  });
  await optionalRoleReject({
    emailKey: "METRIX_TEST_AC_EMAIL",
    passwordKey: "METRIX_TEST_AC_PASSWORD",
    expectedRole: "ASSISTANT_CONTROLLER",
    label: "Assistant Controller",
  });

  const createdOrConflict = await request({
    token: admin.token,
    endpoint: "/admin/assistant-controllers",
    method: "POST",
    expected: [201, 409],
    label: "Create Assistant Controller",
    body: {
      districtId: process.env.METRIX_ADMIN_TEST_DISTRICT_ID,
      email: process.env.METRIX_ADMIN_TEST_AC_EMAIL,
      temporaryPassword: process.env.METRIX_ADMIN_TEST_AC_PASSWORD,
      officerName: "Rajesh Kumar",
      phone: "9000000001",
      designation: "Assistant Controller",
      jurisdiction: "System Admin test district",
    },
  });
  assert([201, 409].includes(createdOrConflict.status), "Create AC is allowed only for System Admin");

  const search = await request({
    token: admin.token,
    endpoint: `/admin/assistant-controllers?districtId=${encodeURIComponent(process.env.METRIX_ADMIN_TEST_DISTRICT_ID)}&limit=25`,
    label: "Search Assistant Controllers by district",
  });
  const ac = search.payload.data?.items?.find((item) => item.accountEmail === process.env.METRIX_ADMIN_TEST_AC_EMAIL);
  assert(ac, "Created or existing Assistant Controller appears in district search");

  const updated = await request({
    token: admin.token,
    endpoint: `/admin/assistant-controllers/${encodeURIComponent(ac.uuid)}`,
    method: "PATCH",
    label: "Update Assistant Controller officer",
    body: {
      officerName: "Amit Sharma",
      phone: "9000000002",
      designation: "Assistant Controller",
      jurisdiction: ac.jurisdiction || "System Admin test district",
      organization: ac.organization || "MetriX test office",
      status: "ACTIVE",
    },
  });
  assert(updated.payload.data?.authUserId === ac.authUserId, "Officer update keeps the same Auth account");
  assert(updated.payload.data?.districtId === ac.districtId, "Officer update keeps the same district account");
  assert(updated.payload.data?.officerName === "Amit Sharma", "Officer details are updated");

  const lmoSearch = await request({
    token: admin.token,
    endpoint: `/admin/lmos?districtId=${encodeURIComponent(process.env.METRIX_ADMIN_TEST_DISTRICT_ID)}&limit=25`,
    label: "Search LMOs by district",
  });
  assert(Array.isArray(lmoSearch.payload.data?.items), "LMO district search returns a limited result set");

  const audit = await request({
    token: admin.token,
    endpoint: `/admin/audit-logs?search=ASSISTANT_CONTROLLER&limit=25`,
    label: "Search audit logs",
  });
  assert(
    audit.payload.data?.items?.some((item) =>
      ["ASSISTANT_CONTROLLER_ACCOUNT_CREATED", "ASSISTANT_CONTROLLER_OFFICER_UPDATED"].includes(item.action)
    ),
    "Audit logs contain AC creation or update activity"
  );

  console.log("PASS System Admin workflow completed");
}

main().catch((error) => {
  console.error("FAIL System Admin workflow failed.");
  console.error(error.message);
  process.exit(1);
});
