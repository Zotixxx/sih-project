// Comprehensive Automated Test Suite for MetriX End-to-End Scenarios
// Validates all 7 user-specified mandatory criteria

const BASE_URL = "http://localhost:5001/api";

const request = async (endpoint, method = "GET", body = null, userId = "AC-AJM-001") => {
  const headers = {
    "Content-Type": "application/json",
    "x-user-id": userId,
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
};

async function runAllTests() {
  console.log("\n=======================================================");
  console.log("🧪 RUNNING METRIX MULTI-DISTRICT REGULATORY TEST SUITE");
  console.log("=======================================================\n");

  // Step 0: Reset Database to clean seed
  const resetRes = await request("/reset", "POST");
  assert(resetRes.status === 200, "Database reset to initial multi-district state");

  // TEST 1: Full Lifecycle Workflow in Ajmer
  console.log("\n▶ TEST 1: Full End-to-End Lifecycle Workflow (Ajmer)");
  // 1a. Assistant Controller reviews pending applications
  const ajmApps = await request("/applications", "GET", null, "AC-AJM-001");
  assert(ajmApps.status === 200, "Fetched Ajmer applications successfully");
  const submittedApp = ajmApps.data.data.find((a) => a.id === "APP-AJM-002");
  assert(submittedApp && submittedApp.status === "SUBMITTED", "Found fresh SUBMITTED application APP-AJM-002");

  // 1b. Accept Application
  const acceptRes = await request("/applications/APP-AJM-002/accept", "POST", {}, "AC-AJM-001");
  assert(acceptRes.status === 200, "Assistant Controller accepted APP-AJM-002");
  assert(acceptRes.data.data.status === "ACCEPTED", "Application transitioned to ACCEPTED");

  // 1c. Verify NO Certificate exists upon acceptance (RULE: Acceptance is NOT Final Approval!)
  const certsAfterAccept = await request("/certificates", "GET", null, "AC-AJM-001");
  const matchingCert = certsAfterAccept.data.data.find((c) => c.applicationId === "APP-AJM-002");
  assert(!matchingCert, "CRITICAL: No certificate generated upon application acceptance!");

  // 1d. Assign Ajmer LMO
  const assignRes = await request(
    "/applications/APP-AJM-002/assign",
    "POST",
    { lmoId: "LMO-AJM-021", scheduledDate: "2026-09-05" },
    "AC-AJM-001"
  );
  assert(assignRes.status === 200, "Assigned Ajmer LMO Rajesh Kumar (LMO-AJM-021)");
  assert(assignRes.data.data.application.status === "SCHEDULED", "Application transitioned to SCHEDULED");

  // 1e. LMO starts inspection
  const inspId = assignRes.data.data.inspection.id;
  const startInspRes = await request(`/inspections/${inspId}/start`, "POST", {}, "LMO-AJM-021");
  assert(startInspRes.status === 200, "LMO started field inspection");

  // 1f. LMO submits inspection with MPE measurements
  const submitInspRes = await request(
    `/inspections/${inspId}/submit`,
    "POST",
    {
      inspectionDate: "2026-09-05",
      sealNumber: "RAJ-AJM-2026-SL-88192",
      standardsUsed: "Class M1 Working Standards Kit",
      gpsCoordinates: "26.4499° N, 74.6399° E",
      measurements: [
        { testLoad: "50 kg", indicatedWeight: "50.00 kg", error: "0 g", mpeLimit: "±20 g", result: "PASS" },
        { testLoad: "100 kg", indicatedWeight: "100.01 kg", error: "+10 g", mpeLimit: "±50 g", result: "PASS" },
        { testLoad: "200 kg", indicatedWeight: "200.00 kg", error: "0 g", mpeLimit: "±50 g", result: "PASS" },
      ],
      checklist: {
        visualPlinthIntegrity: "SATISFACTORY",
        leadWireTamperProofSeal: "AFFIXED_SERIALIZED",
      },
      officerRemarks: "All MPE limits passed. Lead security seal affixed.",
    },
    "LMO-AJM-021"
  );
  assert(submitInspRes.status === 200, "LMO submitted field verification");
  assert(submitInspRes.data.data.status === "SUBMITTED", "Inspection status set to SUBMITTED");

  // Verify application transitioned to AWAITING_APPROVAL
  const appAfterInsp = await request("/applications/APP-AJM-002", "GET", null, "AC-AJM-001");
  assert(appAfterInsp.data.data.status === "AWAITING_APPROVAL", "Application moved to AWAITING_APPROVAL");

  // 1g. Assistant Controller reviews completed dossier and sanctions certificate
  const approveRes = await request(
    "/approvals/approve",
    "POST",
    { applicationId: "APP-AJM-002", remarks: "Final verification approved under Legal Metrology Act 2009." },
    "AC-AJM-001"
  );
  assert(approveRes.status === 200, "Assistant Controller approved application and issued certificate");
  const issuedCert = approveRes.data.data;
  assert(Boolean(issuedCert.certificateNumber), `Issued Certificate ID: ${issuedCert.certificateNumber}`);
  assert(Boolean(issuedCert.securityHash), `Cryptographic SHA-256 Hash: ${issuedCert.securityHash.substring(0, 16)}...`);
  assert(Boolean(issuedCert.qrVerificationToken), `QR Verification Token: ${issuedCert.qrVerificationToken}`);

  // TEST 2: Rejection Flow with Mandatory Reason
  console.log("\n▶ TEST 2: Rejection Flow with Mandatory Reason");
  const rejWithoutReason = await request("/applications/APP-AJM-003/reject", "POST", { reason: "" }, "AC-AJM-001");
  assert(rejWithoutReason.status === 400, "Rejected without reason returned HTTP 400 Bad Request");

  const rejWithReason = await request(
    "/applications/APP-AJM-003/reject",
    "POST",
    { reason: "Incorrect plinth foundation civil drawing uploaded." },
    "AC-AJM-001"
  );
  assert(rejWithReason.status === 200, "Application successfully rejected with valid reason");
  assert(rejWithReason.data.data.status === "REJECTED", "Application status set to REJECTED");

  // TEST 3: Return for Correction Flow
  console.log("\n▶ TEST 3: Return for Correction Flow");
  // APP-AJM-001 is currently AWAITING_APPROVAL in seed data
  const returnRes = await request(
    "/approvals/return",
    "POST",
    { applicationId: "APP-AJM-001", reason: "Corner load eccentricity test photo missing." },
    "AC-AJM-001"
  );
  assert(returnRes.status === 200, "Assistant Controller returned inspection for correction");
  assert(returnRes.data.data.status === "SCHEDULED", "Application reverted to SCHEDULED for LMO re-check");

  // TEST 4: Multi-District Data Isolation (Ajmer vs Jaipur)
  console.log("\n▶ TEST 4: Multi-District Data Isolation (Ajmer vs Jaipur)");
  // 4a. Ajmer Assistant Controller querying applications
  const ajmAppsOnly = await request("/applications", "GET", null, "AC-AJM-001");
  const hasJaipurAppInAjmer = ajmAppsOnly.data.data.some((a) => a.district_id === "JPR");
  assert(!hasJaipurAppInAjmer, "Ajmer Assistant Controller cannot see Jaipur applications in list");

  // 4b. Jaipur Assistant Controller querying applications
  const jprAppsOnly = await request("/applications", "GET", null, "AC-JPR-001");
  const hasAjmerAppInJaipur = jprAppsOnly.data.data.some((a) => a.district_id === "AJM");
  assert(!hasAjmerAppInJaipur, "Jaipur Assistant Controller cannot see Ajmer applications in list");

  // 4c. Cross-district direct ID access attempt (Ajmer AC trying to access APP-JPR-001)
  const crossDistrictApp = await request("/applications/APP-JPR-001", "GET", null, "AC-AJM-001");
  assert(crossDistrictApp.status === 403, "Cross-district application access blocked with HTTP 403 Forbidden");

  // 4d. Cross-district acceptance attempt (Ajmer AC trying to accept Jaipur app)
  const crossDistrictAccept = await request("/applications/APP-JPR-001/accept", "POST", {}, "AC-AJM-001");
  assert(crossDistrictAccept.status === 403, "Cross-district application acceptance blocked with HTTP 403 Forbidden");

  // 4e. Cross-district LMO assignment attempt (Assigning Jaipur LMO to Ajmer App)
  const crossAssignRes = await request(
    "/applications/APP-AJM-005/assign",
    "POST",
    { lmoId: "LMO-JPR-001", scheduledDate: "2026-09-06" },
    "AC-AJM-001"
  );
  assert(crossAssignRes.status === 400, "Assigning an out-of-district LMO blocked with HTTP 400/403");

  // TEST 5: LMO Role & Action Isolation
  console.log("\n▶ TEST 5: LMO Role & Action Isolation");
  // LMO trying to accept an application
  const lmoAccept = await request("/applications/APP-AJM-002/accept", "POST", {}, "LMO-AJM-021");
  assert(lmoAccept.status === 403, "LMO cannot accept applications (HTTP 403 Forbidden)");

  // LMO trying to approve certificate
  const lmoApprove = await request(
    "/approvals/approve",
    "POST",
    { applicationId: "APP-AJM-001" },
    "LMO-AJM-021"
  );
  assert(lmoApprove.status === 403, "LMO cannot approve certificates (HTTP 403 Forbidden)");

  // LMO trying to access another district's inspection
  const crossInsp = await request("/inspections/INSP-JPR-001", "GET", null, "LMO-AJM-021");
  assert(crossInsp.status === 403, "LMO cannot access inspections outside their district (HTTP 403 Forbidden)");

  // TEST 6: Certificate Consistency & Public QR Verification
  console.log("\n▶ TEST 6: Certificate Consistency & Public QR Verification");
  // Verify public endpoint reads the issued certificate
  const publicRes = await request(`/public/certificates/${issuedCert.id}`, "GET", null, "ANONYMOUS");
  assert(publicRes.status === 200, "Public citizen QR verification endpoint accessible without auth");
  assert(publicRes.data.data.certificateNumber === issuedCert.certificateNumber, "Public certificate number matches");
  assert(publicRes.data.data.verificationResult === "VERIFIED", "Public verification status is VERIFIED");
  assert(publicRes.data.data.securityHash === issuedCert.securityHash, "Cryptographic hash matches on public endpoint");

  // TEST 7: Search-Driven Certificates Vault
  console.log("\n▶ TEST 7: Search-Driven Certificates Vault");
  const searchByNumber = await request(`/certificates/search?q=${issuedCert.certificateNumber}`, "GET", null, "AC-AJM-001");
  assert(searchByNumber.status === 200, "Search by Certificate Number returned HTTP 200");
  assert(searchByNumber.data.data.length >= 1, "Certificate found via Certificate Number search");

  const searchByBiz = await request("/certificates/search?q=Rajputana", "GET", null, "AC-AJM-001");
  assert(searchByBiz.data.data.some((c) => c.businessName.includes("Rajputana")), "Found certificate via business name search");

  // TEST 8: Business Profile Completeness Validation (Acceptance Test 4)
  console.log("\n▶ TEST 8: Business Profile Completeness Validation");
  const incompleteBizRes = await request("/applications", "POST", {
    instrumentId: "INS-AJM-001",
    verificationType: "Re-verification",
    location: "Kishangarh, Ajmer",
  }, "BUS-NEW-EMPTY");
  assert(incompleteBizRes.status === 400, "Submission blocked if business profile is incomplete (HTTP 400)");
  assert(
    incompleteBizRes.data?.error?.message?.includes("Please complete your business details"),
    "Clear error returned: 'Please complete your business details before applying for verification.'"
  );

  // TEST 9: Instrument Purchase Bill Enforcement (Acceptance Test 6)
  console.log("\n▶ TEST 9: Instrument Purchase Bill Enforcement");
  const missingBillRes = await request("/instruments", "POST", {
    name: "Unverified Test Scale",
    serialNumber: "SN-NO-BILL-01",
    capacity: "50 kg",
    location: "Ajmer Market",
  }, "BUS-AJM-001");
  assert(missingBillRes.status === 400, "Adding instrument without purchase bill blocked with HTTP 400");
  assert(
    missingBillRes.data?.error?.message?.includes("Please add the purchase bill to this instrument"),
    "Clear error: 'Please add the purchase bill to this instrument before applying for verification.'"
  );

  // Register valid instrument WITH purchase bill
  const validInstRes = await request("/instruments", "POST", {
    name: "60T Electronic Weighbridge",
    manufacturer: "ABC Machines",
    model: "WM-60T",
    serialNumber: "WB-60T-AJM-0042",
    capacity: "60 Ton",
    accuracyClass: "Class III",
    location: "Industrial Area, Kishangarh, Ajmer",
    purchaseBill: {
      fileName: "ABC_Machines_Purchase_Invoice_2026.pdf",
      fileSize: "1.8 MB",
      fileType: "application/pdf",
    },
  }, "BUS-AJM-001");
  assert(validInstRes.status === 201, "Instrument with purchase bill registered successfully (HTTP 201)");
  const newInstrument = validInstRes.data.data;
  assert(newInstrument.purchaseBill?.fileName === "ABC_Machines_Purchase_Invoice_2026.pdf", "Purchase bill attached to instrument");

  // TEST 10: Instrument Ownership Isolation (Acceptance Test 5)
  console.log("\n▶ TEST 10: Cross-Business Instrument Ownership Security");
  const crossBizAppRes = await request("/applications", "POST", {
    instrumentId: newInstrument.id,
    verificationType: "Re-verification",
    location: "Jaipur Agro Hub",
  }, "BUS-JPR-001");
  assert(crossBizAppRes.status === 403, "Applying with another business's instrument blocked with HTTP 403 Forbidden");

  // TEST 11: Application Draft Support (Acceptance Test 3)
  console.log("\n▶ TEST 11: Application Draft Persistence & Retrieval");
  const saveDraftRes = await request("/applications/draft", "POST", {
    step: 3,
    instrumentId: newInstrument.id,
    verificationType: "Re-verification",
    locationAddress: "Industrial Area, Kishangarh",
    noteForLmo: "Please call Ramesh before visiting",
  }, "BUS-AJM-001");
  assert(saveDraftRes.status === 200, "Application draft saved successfully");

  const getDraftRes = await request("/applications/drafts/current", "GET", null, "BUS-AJM-001");
  assert(getDraftRes.status === 200 && getDraftRes.data.data.step === 3, "Draft retrieved accurately for resuming");

  // TEST 12: Complete End-to-End Business Submission Flow (Acceptance Test 1 & 7)
  console.log("\n▶ TEST 12: Business Application Submission & Snapshot");
  const submitAppRes = await request("/applications", "POST", {
    instrumentId: newInstrument.id,
    verificationType: "Re-verification",
    verificationLocation: {
      address: "Plot 88, Marble Industrial Area, Kishangarh",
      city: "Kishangarh",
      district: "Ajmer",
      state: "Rajasthan",
      pincode: "305801",
    },
    noteForLmo: "Please call before visiting. The weighbridge is inside the rear gate.",
    additionalDocuments: [
      { name: "Previous_Calibration_Report.pdf", size: "900 KB" },
    ],
  }, "BUS-AJM-001");

  assert(submitAppRes.status === 201, "Business application created with HTTP 201 Created");
  const submittedAppDetails = submitAppRes.data.data;
  assert(submittedAppDetails.id.startsWith("APP-AJM-2026-"), "Unique Application ID generated with district & year");
  assert(submittedAppDetails.status === "SUBMITTED", "Initial statutory application status is SUBMITTED");
  assert(!submittedAppDetails.assignedLmoId, "CRITICAL: No LMO is automatically assigned");
  assert(!submittedAppDetails.certificateId, "CRITICAL: No certificate is generated at submission");

  // Documents verification
  const pbDoc = submittedAppDetails.documents.find((d) => d.source === "INSTRUMENT");
  assert(pbDoc && pbDoc.name === "ABC_Machines_Purchase_Invoice_2026.pdf", "Purchase bill automatically reused from instrument");
  const addDoc = submittedAppDetails.documents.find((d) => d.name === "Previous_Calibration_Report.pdf");
  assert(addDoc, "Optional additional document attached");

  // TEST 13: Assistant Controller Fresh Applications Queue
  console.log("\n▶ TEST 13: Assistant Controller Fresh Applications Visibility");
  const acFreshQueue = await request("/applications", "GET", null, "AC-AJM-001");
  const foundInACQueue = acFreshQueue.data.data.find((a) => a.id === submittedAppDetails.id);
  assert(foundInACQueue, "Submitted application immediately appears in Assistant Controller Fresh Applications");
  assert(foundInACQueue.status === "SUBMITTED", "Application in AC queue shows SUBMITTED");

  // TEST 14: Draft Cleanup After Final Submission
  console.log("\n▶ TEST 14: Draft Cleanup Upon Submission");
  const postSubmitDraft = await request("/applications/drafts/current", "GET", null, "BUS-AJM-001");
  assert(!postSubmitDraft.data.data, "Draft cleared automatically after final application submission");

  // TEST 15: Assistant Controller Notice Creation to LMOs (Broadcast & Targeted)
  console.log("\n▶ TEST 15: Assistant Controller Notice Issuance & LMO Delivery");

  // 15a: Non-AC role cannot issue notices (HTTP 403)
  const lmoCreateNotice = await request("/reports/notifications/notice", "POST", {
    title: "Unauthorized Notice",
    message: "Should be blocked",
  }, "LMO-AJM-021");
  assert(lmoCreateNotice.status === 403, "LMO cannot issue official notices (HTTP 403 Forbidden)");

  // 15b: AC creates broadcast notice to ALL LMOs in district
  const broadcastNoticeRes = await request("/reports/notifications/notice", "POST", {
    title: "Special Verification Drive for Highway Weighbridges",
    message: "All officers are directed to complete weighbridge verifications along NH-8 by Sept 15.",
    priority: "URGENT",
    targetLmoId: "ALL",
  }, "AC-AJM-001");
  assert(broadcastNoticeRes.status === 201, "Assistant Controller issued broadcast notice (HTTP 201 Created)");
  const broadcastNoticeId = broadcastNoticeRes.data.data.id;

  // 15c: Verify both LMO-AJM-021 and LMO-AJM-014 receive the broadcast notice
  const lmo21Notifs = await request("/reports/notifications", "GET", null, "LMO-AJM-021");
  assert(
    lmo21Notifs.data.data.some((n) => n.id === broadcastNoticeId),
    "LMO Rajesh Kumar (LMO-AJM-021) received broadcast notice"
  );

  const lmo14Notifs = await request("/reports/notifications", "GET", null, "LMO-AJM-014");
  assert(
    lmo14Notifs.data.data.some((n) => n.id === broadcastNoticeId),
    "LMO Priya Sharma (LMO-AJM-014) received broadcast notice"
  );

  // 15d: AC creates targeted notice specifically to 1 LMO (Priya Sharma - LMO-AJM-014)
  const targetedNoticeRes = await request("/reports/notifications/notice", "POST", {
    title: "Kishangarh Marble Cluster Inspection Audit",
    message: "Senior Officer Priya Sharma is assigned to conduct surprise re-checks in Kishangarh zone.",
    priority: "DIRECTIVE",
    targetLmoId: "LMO-AJM-014",
  }, "AC-AJM-001");
  assert(targetedNoticeRes.status === 201, "Assistant Controller issued targeted notice to 1 LMO (HTTP 201)");
  const targetedNoticeId = targetedNoticeRes.data.data.id;

  // 15e: Verify Priya Sharma (LMO-AJM-014) sees the targeted notice
  const lmo14AfterTargeted = await request("/reports/notifications", "GET", null, "LMO-AJM-014");
  assert(
    lmo14AfterTargeted.data.data.some((n) => n.id === targetedNoticeId),
    "Targeted LMO Priya Sharma (LMO-AJM-014) received her direct notice"
  );

  // 15f: Verify Rajesh Kumar (LMO-AJM-021) DOES NOT see Priya Sharma's targeted notice
  const lmo21AfterTargeted = await request("/reports/notifications", "GET", null, "LMO-AJM-021");
  assert(
    !lmo21AfterTargeted.data.data.some((n) => n.id === targetedNoticeId),
    "Untargeted LMO Rajesh Kumar (LMO-AJM-021) does NOT receive notice addressed to Priya Sharma"
  );

  // 15g: AC sees issued notices in their own notifications list
  const acNotifs = await request("/reports/notifications", "GET", null, "AC-AJM-001");
  assert(
    acNotifs.data.data.some((n) => n.id === targetedNoticeId),
    "Assistant Controller sees issued notice in their management ledger"
  );

  console.log("\n=======================================================");
  console.log("🎉 ALL 15 METRIX REGULATORY & BUSINESS FLOW TESTS PASSED!");
  console.log("=======================================================\n");
}

runAllTests().catch((err) => {
  console.error("Test Suite Execution Aborted:", err);
  process.exit(1);
});
