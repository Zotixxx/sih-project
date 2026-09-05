import { createClient } from "@supabase/supabase-js";

const API_BASE = process.env.METRIX_API_BASE_URL || "http://localhost:5001/api";
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const REQUIRED_ENV = [
  "METRIX_TEST_BUSINESS_EMAIL",
  "METRIX_TEST_BUSINESS_PASSWORD",
  "METRIX_TEST_AC_EMAIL",
  "METRIX_TEST_AC_PASSWORD",
  "METRIX_TEST_LMO_EMAIL",
  "METRIX_TEST_LMO_PASSWORD",
];

const TEST_IDS = {
  instrumentId: process.env.METRIX_TEST_INSTRUMENT_ID || "INS-TEST-001",
  applicationId: process.env.METRIX_TEST_APPLICATION_ID || "APP-TEST-001",
  lmoId: process.env.METRIX_TEST_LMO_ID || "LMO-TEST-001",
};

const TINY_PDF_BASE64 = "JVBERi0xLjQKJSBNZXRyaVggdGVzdCBwdXJjaGFzZSBiaWxsCg==";

const missingEnv = () => {
  const missing = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_PUBLISHABLE_KEY) {
    missing.push("SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
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

  assert(profile.payload.data?.role === expectedRole, `${label} resolves role ${expectedRole} from API profile`);
  return {
    token: data.session.access_token,
    user: profile.payload.data,
  };
};

const ensureInstrument = async (business) => {
  const create = await request({
    token: business.token,
    endpoint: "/instruments",
    method: "POST",
    expected: [201, 409],
    label: "Create test instrument",
    body: {
      instrumentId: TEST_IDS.instrumentId,
      name: "Test Electronic Weighing Scale",
      type: "Electronic Weighing Scale",
      manufacturer: "MetriX Test Manufacturer",
      model: "MX-T100",
      serialNumber: "SN-TEST-001",
      capacity: "100 kg",
      accuracyClass: "Class III",
      purchaseDate: "2026-09-05",
      purpose: "Retail trade verification",
      location: "Test Verification Site",
      city: "Test City",
      state: "Rajasthan",
      pincode: "305001",
      purchaseBill: {
        fileName: "INS-TEST-001-purchase-bill.pdf",
        mimeType: "application/pdf",
        base64: TINY_PDF_BASE64,
      },
    },
  });

  if (create.status === 201) return create.payload.data;

  const instruments = await request({
    token: business.token,
    endpoint: "/instruments",
    label: "Fetch existing test instrument",
  });
  const instrument = instruments.payload.data.find((item) => item.instrumentId === TEST_IDS.instrumentId || item.id === TEST_IDS.instrumentId);
  assert(instrument, `Existing instrument ${TEST_IDS.instrumentId} is visible to the business`);
  assert(instrument.purchaseBill?.documentId, `Existing instrument ${TEST_IDS.instrumentId} has a purchase bill`);
  return instrument;
};

const ensureApplication = async (business, instrument) => {
  const create = await request({
    token: business.token,
    endpoint: "/applications",
    method: "POST",
    expected: [201, 409],
    label: "Submit test application",
    body: {
      applicationId: TEST_IDS.applicationId,
      instrumentId: instrument.instrumentId || instrument.id,
      verificationType: "First Time Verification",
      verificationLocation: {
        address: "Test Premises, Verification Bay 1",
        city: "Test City",
        district: "Test District",
        state: "Rajasthan",
        pincode: "305001",
        notes: "Disposable golden workflow test record.",
      },
    },
  });

  if (create.status === 201) {
    assert(create.payload.data.status === "SUBMITTED", "New application starts in SUBMITTED state");
    assert(!create.payload.data.certificateId, "No certificate is created at submission");
    return create.payload.data;
  }

  const existing = await request({
    token: business.token,
    endpoint: `/applications/${TEST_IDS.applicationId}`,
    label: "Fetch existing test application",
  });
  return existing.payload.data;
};

const progressToInspection = async ({ ac, lmo, application }) => {
  let current = application;

  if (["SUBMITTED", "UNDER_REVIEW"].includes(current.status)) {
    const fresh = await request({
      token: ac.token,
      endpoint: "/applications",
      label: "AC fresh applications",
    });
    assert(
      fresh.payload.data.some((item) => item.applicationId === TEST_IDS.applicationId || item.id === TEST_IDS.applicationId),
      `AC can see submitted application ${TEST_IDS.applicationId}`
    );

    const accepted = await request({
      token: ac.token,
      endpoint: `/applications/${TEST_IDS.applicationId}/accept`,
      method: "POST",
      label: "AC accept application",
    });
    current = accepted.payload.data;
    assert(current.status === "ACCEPTED", "AC acceptance moves application to ACCEPTED");
    assert(!current.certificateId, "Acceptance does not create a certificate");
  }

  if (["ACCEPTED", "SCHEDULED"].includes(current.status)) {
    const assigned = await request({
      token: ac.token,
      endpoint: `/applications/${TEST_IDS.applicationId}/assign`,
      method: "POST",
      label: "AC assign LMO",
      body: {
        lmoId: TEST_IDS.lmoId,
        scheduledDate: "2026-09-05",
      },
    });
    current = assigned.payload.data.application;
    assert(current.status === "SCHEDULED", "LMO assignment moves application to SCHEDULED");
    assert(current.assignedLmoId === TEST_IDS.lmoId, `Assignment persisted to ${TEST_IDS.lmoId}`);
  }

  const lmoInspections = await request({
    token: lmo.token,
    endpoint: "/inspections",
    label: "LMO inspections",
  });
  let inspection = lmoInspections.payload.data.find((item) => item.applicationId === TEST_IDS.applicationId);
  assert(inspection, `Assigned LMO can see inspection for ${TEST_IDS.applicationId}`);

  if (["ASSIGNED", "RETURNED"].includes(inspection.status)) {
    const started = await request({
      token: lmo.token,
      endpoint: `/inspections/${inspection.id}/start`,
      method: "POST",
      label: "LMO start inspection",
    });
    inspection = started.payload.data;
    assert(inspection.status === "IN_PROGRESS", "LMO start moves inspection to IN_PROGRESS");
  }

  if (inspection.status === "IN_PROGRESS") {
    const submitted = await request({
      token: lmo.token,
      endpoint: `/inspections/${inspection.id}/submit`,
      method: "POST",
      label: "LMO submit inspection",
      body: {
        inspectionDate: "2026-09-05",
        sealNumber: "SEAL-TEST-001",
        standardsUsed: "Class M1 standard weights",
        gpsCoordinates: "26.4499,74.6399",
        officerRemarks: "Golden workflow verification passed.",
        measurements: [
          {
            testLoad: "50 kg",
            indicatedWeight: "50.00 kg",
            error: "0 g",
            mpeLimit: "+/- 20 g",
            result: "PASS",
          },
        ],
      },
    });
    inspection = submitted.payload.data;
    assert(inspection.status === "SUBMITTED", "LMO submission moves inspection to SUBMITTED");
  }

  return inspection;
};

const approveAndVerifyCertificate = async ({ business, ac, applicationId }) => {
  const awaiting = await request({
    token: ac.token,
    endpoint: "/approvals/awaiting",
    label: "AC awaiting approvals",
  });

  const pending = awaiting.payload.data.find((item) => item.applicationId === applicationId || item.id === applicationId);
  let certificate = null;

  if (pending) {
    const approved = await request({
      token: ac.token,
      endpoint: "/approvals/approve",
      method: "POST",
      label: "AC final approval",
      body: {
        applicationId,
        remarks: "Golden workflow final approval.",
      },
    });
    certificate = approved.payload.data;
    assert(certificate.certificateId === applicationId || certificate.id === applicationId, "Certificate ID equals Application ID");
  } else {
    const certificates = await request({
      token: business.token,
      endpoint: "/certificates",
      label: "Business certificates",
    });
    certificate = certificates.payload.data.find((item) => item.certificateId === applicationId || item.id === applicationId);
    assert(certificate, `Certificate ${applicationId} already exists and is visible to business`);
  }

  const businessCertificates = await request({
    token: business.token,
    endpoint: "/certificates",
    label: "Business certificate vault",
  });
  assert(
    businessCertificates.payload.data.some((item) => item.certificateId === applicationId || item.id === applicationId),
    `Business can see certificate ${applicationId}`
  );

  const publicVerify = await request({
    endpoint: `/public/certificates/${applicationId}`,
    auth: false,
    label: "Public QR certificate lookup",
  });
  assert(publicVerify.payload.data?.certificateNumber === applicationId, "Public QR lookup returns the same certificate/application ID");

  const duplicate = await request({
    token: ac.token,
    endpoint: "/approvals/approve",
    method: "POST",
    expected: [409],
    label: "Duplicate certificate generation check",
    body: {
      applicationId,
      remarks: "Duplicate approval attempt.",
    },
  });
  assert(duplicate.status === 409, "Second approval does not create a duplicate certificate");

  return certificate;
};

const runNegativeChecks = async ({ business, lmo }) => {
  const noAuthDashboard = await request({
    endpoint: "/dashboard/stats",
    expected: [401],
    label: "Anonymous dashboard access",
  });
  assert(noAuthDashboard.status === 401, "Anonymous dashboard API access is blocked");

  const businessApprove = await request({
    token: business.token,
    endpoint: "/approvals/approve",
    method: "POST",
    expected: [403],
    label: "Business approve attempt",
    body: { applicationId: TEST_IDS.applicationId },
  });
  assert(businessApprove.status === 403, "Business cannot approve applications");

  const lmoApprove = await request({
    token: lmo.token,
    endpoint: "/approvals/approve",
    method: "POST",
    expected: [403],
    label: "LMO approve attempt",
    body: { applicationId: TEST_IDS.applicationId },
  });
  assert(lmoApprove.status === 403, "LMO cannot approve applications");
};

async function main() {
  const missing = missingEnv();
  if (missing.length) {
    console.error("NOT TESTED Supabase golden workflow credentials are missing.");
    console.error(`Missing: ${missing.join(", ")}`);
    process.exit(2);
  }

  await request({ endpoint: "/health", expected: [200], label: "API health" });

  const business = await signIn({
    email: process.env.METRIX_TEST_BUSINESS_EMAIL,
    password: process.env.METRIX_TEST_BUSINESS_PASSWORD,
    expectedRole: "BUSINESS",
    label: "Business",
  });
  const ac = await signIn({
    email: process.env.METRIX_TEST_AC_EMAIL,
    password: process.env.METRIX_TEST_AC_PASSWORD,
    expectedRole: "ASSISTANT_CONTROLLER",
    label: "Assistant Controller",
  });
  const lmo = await signIn({
    email: process.env.METRIX_TEST_LMO_EMAIL,
    password: process.env.METRIX_TEST_LMO_PASSWORD,
    expectedRole: "LMO",
    label: "LMO",
  });

  assert(business.user.id && ac.user.id && lmo.user.id, "API profiles expose Supabase Auth UUIDs");

  await request({
    token: business.token,
    endpoint: "/business/profile",
    method: "PUT",
    label: "Complete business profile",
    body: {
      businessName: "MetriX Test Traders",
      gstin: "08TESTGSTIN1Z5",
      pan: "TESTP1234A",
      registrationNumber: "REG-TEST-001",
      ownerName: "MetriX Test Owner",
      phone: "9000000000",
      email: process.env.METRIX_TEST_BUSINESS_EMAIL,
      address: "Test Registered Office",
      city: "Test City",
      state: "Rajasthan",
      pincode: "305001",
      natureOfBusiness: "Retail trade",
    },
  });
  console.log("PASS Business profile update persisted through API");

  const instrument = await ensureInstrument(business);
  const application = await ensureApplication(business, instrument);
  await progressToInspection({ ac, lmo, application });
  await approveAndVerifyCertificate({ business, ac, applicationId: TEST_IDS.applicationId });
  await runNegativeChecks({ business, lmo });

  console.log("PASS Golden Supabase workflow completed");
}

main().catch((error) => {
  console.error("FAIL Supabase golden workflow failed.");
  console.error(error.message);
  process.exit(1);
});
